
using System.Buffers;
using System.Text.Json;
using PKHeX.Core;

public class DexDataService(StaticDataService staticDataService, ISettingsService settingsService)
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
        foreach (var s in allSpecies)
        {
            results.Add(s, staticEvolvesRich[s]);
        }
        return results;
    }

    public async Task<DexLocationDTO> GetLocations(GameVersion version, ushort species)
    {
        var lang = settingsService.GetSettings().GetLanguageForPKHeX();
        var strings = GameInfo.GetStrings(lang);

        var context = version.Context;

        SaveWrapper save = new(BlankSaveFile.Get(version));

        var pkm = new ImmutablePKM(EntityBlank.GetBlank(context));

        var staticSpecies = await staticDataService.GetStaticSpecies();

        var speciesData = staticSpecies[species];
        var staticForms = speciesData.Forms[(byte)context];

        var fc = staticForms.Length;

        DexLocationDTO dto = new(
            Species: species,
            Context: context,
            Version: version,
            Locations: []
        );

        EncounterMovesetGenerator.PriorityList = [
            EncounterTypeGroup.Static,
            EncounterTypeGroup.Trade,
            EncounterTypeGroup.Slot,
            // EncounterTypeGroup.Egg,
            // EncounterTypeGroup.Mystery,
        ];

        for (byte formIndex = 0; formIndex < fc; formIndex++)
        {
            byte GetRealForm(byte form, int index)
            {
                if (form == EncounterUtil.FormRandom)
                {
                    return (byte)index;
                }

                if (form == EncounterUtil.FormVivillon)
                {
                    return formIndex;
                }

                if (form >= EncounterUtil.FormDynamic)
                {
                    return 0;
                }

                return form;
            }

            pkm = pkm.Update(pkm =>
            {
                pkm.Species = species;
                pkm.Form = formIndex;
                pkm.SetGender(pkm.GetSaneGender());
                EncounterMovesetGenerator.OptimizeCriteria(pkm, save.GetSave());
                pkm.RefreshChecksum();
            });

            if (FormInfo.IsBattleOnlyForm(species, formIndex, pkm.Format))
                continue;

            var encounters = EncounterMovesetGenerator.GenerateEncounters(pkm.GetMutablePkm(), new ReadOnlyMemory<ushort>(), [version]).ToArray();

            var encountersFiltered = encounters
                .Where(e => e.Species == species)
                .Where((e, i) => GetRealForm(e.Form, i) == formIndex);

            foreach (var e in encountersFiltered)
            {
                if (e.Location == 0)
                    continue;

                pkm.GetMutablePkm().MetLocation = e.Location;
                string location = pkm.GetOriginMetLocation(lang);

                // string? eggLocation = null;
                // if (e.EggLocation > 0)
                // {
                //     pkm.GetMutablePkm().MetLocation = e.EggLocation;
                //     eggLocation = pkm.GetOriginMetLocation(lang);
                // }

                // int? fixedBall = null;
                // if (e.FixedBall > 0)
                // {
                //     var ballName = strings.balllist[(byte)e.FixedBall];
                //     fixedBall = strings.itemlist.IndexOf(ballName);
                // }

                var encounterType = e.Name;
                var encounterWithMethod = e.LongName;

                var isShiny = (e.IsShiny || e.Shiny == Shiny.Always || e.Shiny == Shiny.AlwaysSquare || e.Shiny == Shiny.AlwaysStar)
                    && (e.Shiny != Shiny.Never);

                DexLocationItem newItem = new(
                    Forms: [],
                    EncounterType: encounterType,
                    EncounterWithMethod: encounterWithMethod,
                    IsEgg: e.IsEgg,
                    IsShiny: isShiny,
                    Location: location,
                    // EggLocation: eggLocation,
                    Levels: [],
                    AbilitiesAllowed: e.Ability
                // FixedBall: fixedBall,
                // ShinyProbability: e.Shiny
                );

                if (!dto.Locations.TryGetValue(location, out var locationsByMethod))
                {
                    locationsByMethod = [];
                    dto.Locations.Add(location, locationsByMethod);
                }

                if (!locationsByMethod.TryGetValue(encounterWithMethod, out var locationItems))
                {
                    locationItems = [];
                    locationsByMethod.Add(encounterWithMethod, locationItems);
                }

                var newItemForm = newItem with { Forms = [formIndex] };
                var existingItem = locationItems.FirstOrDefault(
                    i => (i! with { Forms = [], Levels = [] } == newItem
                        && i.Levels.Any(l => l.LevelMin == e.LevelMin && l.LevelMax == e.LevelMax))
                        || (i! with { Levels = [] } == newItemForm),
                    null
                );

                var item = existingItem ?? newItem;

                item.Forms.Add(formIndex);
                item.Levels.Add(new(e.LevelMin, e.LevelMax));

                if (existingItem == null)
                {
                    locationItems.Add(newItem);
                }
            }
        }

        return dto;
    }
}
