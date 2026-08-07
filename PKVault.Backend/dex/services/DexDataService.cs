
using System.Buffers;
using PKHeX.Core;

public class DexDataService(StaticDataService staticDataService)
{
    private static Func<PKM, PersonalInfo, EvoCriteria, ushort, MoveSourceType, LearnOption, MoveLearnInfo> CreateGetCanLearn(ILearnSource learnSource, PersonalInfo pi)
    {
        var piType = pi.GetType();
        var learnSourceType = typeof(ILearnSource<>).MakeGenericType(piType);
        var getCanLearn = learnSourceType.GetMethod("GetCanLearn");
        if (!learnSourceType.IsInstanceOfType(learnSource) || getCanLearn == null)
        {
            throw new Exception("learnSource is expected to be type ILearnSource<pkm.PersonalType>");
        }

        /// GetCanLearn(PKM pk, T pi, EvoCriteria evo, ushort move, MoveSourceType types = MoveSourceType.All, LearnOption option = LearnOption.Current)
        /// <see cref="ILearnSource<T>"/>
        return (pk, pi, evo, move, types, option) =>
            (MoveLearnInfo)getCanLearn.Invoke(learnSource, [pk, pi, evo, move, types, option])!;
    }

    public DexMoveDTO GetMoves(EntityContext context, ushort species, byte form)
    {
        if (context == EntityContext.SplitInvalid)
            context--;

        if (!context.IsValid)
            throw new ArgumentException($"Invalid context = {context}");

        var pkm = new ImmutablePKM(EntityBlank.GetBlank(context)).Update(pkm =>
        {
            pkm.Species = species;
            pkm.Form = form;
            pkm.RefreshChecksum();
        });

        SaveWrapper save = new(BlankSaveFile.Get(context, pkm.OriginalTrainerName));
        var version = save.Version;
        var pi = pkm.PersonalInfo;

        if (!save.IsSpeciesAllowed(species))
        {
            return GetMoves(context - 1, species, form);
        }

        var legality = LegalityAnalysisService.GetLegalitySafeRaw(pkm);

        var learnSource = GameData.GetLearnSource(version);
        var getCanLearn = CreateGetCanLearn(learnSource, pi);

        var bufferLength = pkm.MaxMoveID + 1;

        var learnset = learnSource.GetLearnset(species, form);
        var eggMoves = learnSource.GetEggMoves(species, form);

        HashSet<ushort> GetEncounterMoves()
        {
            bool[] bufferRent = ArrayPool<bool>.Shared.Rent(bufferLength);
            var encounterMovesSpan = bufferRent.AsSpan(0, bufferLength);

            LearnPossible.Get(pkm.GetMutablePkm(), legality.Info.EncounterOriginal, legality.Info.EvoChainsAllGens, encounterMovesSpan, MoveSourceType.Encounter);

            HashSet<ushort> values = [];

            for (ushort move = 1; move < bufferLength; move++)
            {
                if (encounterMovesSpan[move])
                    values.Add(move);
            }

            encounterMovesSpan.Clear();
            ArrayPool<bool>.Shared.Return(bufferRent);

            return values;
        }

        Dictionary<ushort, byte> learnableMoves = GetEncounterMoves().Select(move => (move, (byte)1)).ToDictionary();
        // HashSet<ushort> encounterMoves = GetEncounterMoves();
        HashSet<ushort> TMHMMoves = [];
        HashSet<ushort> tutorMoves = [];

        // learnset.GetAllMoves().ToArray()
        //     .Select((Move, i) => (
        //         Move,
        //         Level: learnset.GetAllLevels()[i]
        //     ))
        //     .OrderBy(moveLevel => moveLevel.Level)
        //     .ToDictionary();

        var evos = legality.Info.EvoChainsAllGens.Get(context).ToArray();
        var evo = evos.FirstOrDefault(e => e.Species == species && e.Form == form, new()
        {
            Species = species,
            Form = form,
        }) with
        {
            LevelMax = 100
        };

        MoveSourceType[] sourceTypes = [
            MoveSourceType.LevelUp,
            MoveSourceType.Evolve,
            MoveSourceType.AllMachines,
            MoveSourceType.AllTutors,
        ];

        for (ushort move = 1; move < bufferLength; move++)
        {
            foreach (var sourceType in sourceTypes)
            {
                var moveInfos = getCanLearn(
                    pkm.GetMutablePkm(),
                    pkm.PersonalInfo,
                    evo,
                    move,
                    sourceType,
                    LearnOption.AtAnyTime
                );

                if (!moveInfos.Method.IsValid)
                    continue;

                switch (moveInfos.Method)
                {
                    case LearnMethod.LevelUp:
                    case LearnMethod.Evolution:
                        {
                            learnableMoves.TryAdd(move, moveInfos.Argument);
                            break;
                        }
                    case LearnMethod.TMHM:
                        {
                            TMHMMoves.Add(move);
                            break;
                        }
                    case LearnMethod.Tutor:
                        {
                            tutorMoves.Add(move);
                            break;
                        }
                }

                // if (generation == 1)
                // Console.WriteLine(move + " - " + foo.Method);
            }
        }

        learnableMoves = learnableMoves.OrderBy(l => l.Value).ToDictionary();

        if (learnableMoves.Count == 0)
            Console.WriteLine("NO LEARNABLE FOR " + save.Context + " " + evo);

        var inheritMoves = learnSource.GetInheritMoves(species, form).ToArray()
            .Where(move => !learnableMoves.ContainsKey(move));

        return new(
                Context: context,
                LearnMoves: learnableMoves,
                EggMoves: eggMoves.ToArray(),
                // EncounterMoves: encounterMoves,
                InheritMoves: inheritMoves,
                TMHMMoves: TMHMMoves,
                TutorMoves: tutorMoves
            );
    }

    public async Task<StaticEvolvesRichData> GetEvolutionChain(ushort species)
    {
        var staticEvolvesRich = await staticDataService.GetStaticEvolvesRich();

        ushort GetPreviousSpecies(ushort species)
        {
            if (staticEvolvesRich.TryGetValue(species, out var speciesEvolveByForm)
                && speciesEvolveByForm.Values.First().PreviousSpecies != null)
                return GetPreviousSpecies((ushort)speciesEvolveByForm.Values.First().PreviousSpecies!);
            return species;
        }

        HashSet<ushort> GetNextSpecies(ushort species)
        {
            var evolvesValues = staticEvolvesRich.TryGetValue(species, out var speciesEvolveByForm)
                ? speciesEvolveByForm.Values.SelectMany(f => f.Evolves.SelectMany(e => GetNextSpecies(e.EvolveSpecies)))
                : [];
            return [
                species,
                ..evolvesValues
            ];
        }

        var firstSpecies = GetPreviousSpecies(species);
        HashSet<ushort> allSpecies = GetNextSpecies(firstSpecies);

        var results = new StaticEvolvesRichData();
        foreach(var s in allSpecies)
        {
            results.Add(s, staticEvolvesRich[s]);
        }
        return results;
    }
}
