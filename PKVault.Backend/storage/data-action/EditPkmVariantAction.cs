using PKHeX.Core;

public record EditPkmVariantActionInput(string pkmVariantId, EditPkmVariantPayload editPayload);

public class EditPkmVariantAction(
    ActionService actionService, PkmUpdateService pkmUpdateService, PkmConvertService pkmConvertService,
    SynchronizePkmAction synchronizePkmAction,
    IPkmVariantLoader pkmVariantLoader
) : DataAction<EditPkmVariantActionInput>
{
    protected override async Task<DataActionPayload> Execute(EditPkmVariantActionInput input, DataUpdateFlags flags)
    {
        var pkmVariantEntity = await pkmVariantLoader.GetEntity(input.pkmVariantId);
        var pkmVariantPKM = await pkmVariantLoader.GetPKM(pkmVariantEntity);

        var availableMoves = await actionService.GetPkmAvailableMoves(null, input.pkmVariantId);

        var pkm = pkmVariantPKM.Update(pkm =>
        {
            EditPkmNickname(pkmUpdateService, pkm, input.editPayload.Nickname);
            EditPkmEVs(pkmUpdateService, pkm, input.editPayload.EVs);
            EditPkmMoves(pkmUpdateService, pkm, availableMoves, input.editPayload.Moves);

            // absolutly required before each write
            // TODO make a using write pkm to ensure use of this call
            pkm.ResetPartyStats();
            pkm.RefreshChecksum();
        });

        await pkmVariantLoader.UpdateEntity(pkmVariantEntity, pkm);

        var relatedPkmVariants = (await pkmVariantLoader.GetEntitiesByBox(pkmVariantEntity.BoxId, pkmVariantEntity.BoxSlot)).Values.ToList()
            .FindAll(value => value.Id != input.pkmVariantId);

        foreach (var variantEntity in relatedPkmVariants)
        {
            var relatedPkm = await pkmVariantLoader.GetPKM(variantEntity);

            var convertedPkm = pkmConvertService.ConvertToExisting(
                pkm,
                relatedPkm.GetMutablePkm(),
                keepMoves: true
            );

            await pkmVariantLoader.UpdateEntity(variantEntity, convertedPkm);
        }

        if (pkmVariantEntity.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizePkmVariantToSave(new([(pkmVariantEntity.Id, pkmVariantEntity.AttachedSavePkmIdBase!)]));
        }

        return new(
            type: DataActionType.EDIT_PKM_VERSION,
            parameters: [pkmVariantPKM.Nickname, pkmVariantPKM.Generation]
        );
    }

    public static void EditPkmNickname(PkmUpdateService pkmUpdateService, PKM pkm, string nickname)
    {
        if (pkm.Nickname == nickname)
        {
            return;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            throw new ArgumentException($"Nickname should be <= {pkm.MaxStringLengthNickname} for this generation & language");
        }

        pkmUpdateService.ApplyNicknameToPkm(pkm, nickname, true);
    }

    public static void EditPkmEVs(PkmUpdateService pkmUpdateService, PKM pkm, int[] evs)
    {
        if (evs.Count() != 6)
        {
            throw new ArgumentException("EVs should be length 6");
        }

        var evHP = evs[0];
        var evATK = evs[1];
        var evDEF = evs[2];
        var evSPE = evs[5];
        var evSPA = evs[3];
        var evSPD = evs[4];

        Span<int> newEVs = [
            evHP,
            evATK,
            evDEF,
            evSPE,
            evSPA,
            evSPD,
        ];

        List<int> existingEVs = [
            pkm.EV_HP,
            pkm.EV_ATK,
            pkm.EV_DEF,
            pkm.EV_SPE,
            pkm.EV_SPA,
            pkm.EV_SPD,
        ];

        newEVs.ToArray().ToList().ForEach(ev =>
        {
            if (ev < 0)
            {
                throw new ArgumentException($"EV value should be positive");
            }

            if (pkm is PB7 && ev > 200)
            {
                throw new ArgumentException($"G7 GG EV cannot be > 200");
            }

            if (pkm.Format <= 2 && ev > ushort.MaxValue)
            {
                throw new ArgumentException($"G1-2 EV cannot be > 65535");
            }

            if (pkm.Format > 2 && pkm.Format <= 5 && ev > EffortValues.Max255)
            {
                throw new ArgumentException($"G3-5 EV cannot be > 255");
            }

            if (pkm.Format > 5 && ev > EffortValues.Max252)
            {
                throw new ArgumentException($"G6+ EV cannot be > 252");
            }
        });

        var newSum = newEVs.ToArray().Sum();
        var existingSum = existingEVs.Sum();

        if (newSum != existingSum)
        {
            throw new ArgumentException("EVs total sum should not change");
        }

        if (string.Join('.', newEVs.ToArray()) == string.Join('.', existingEVs))
        {
            return;
        }

        pkmUpdateService.ApplyEVsAVsToPkm(pkm, newEVs);
    }

    public static void EditPkmMoves(PkmUpdateService pkmUpdateService, PKM pkm, List<MoveItem> availableMoves, Span<ushort> moves)
    {
        var newMoves = moves.ToArray().Where(move => move != 0).ToList();
        var existingMoves = pkm.Moves.Where(move => move != 0);

        if (string.Join('.', newMoves) == string.Join('.', existingMoves))
        {
            return;
        }

        if (newMoves.Count == 0 || newMoves.Count > 4)
        {
            throw new ArgumentException($"Moves length should be > 0 & <= 4");
        }

        if (newMoves.Count != newMoves.Distinct().Count())
        {
            throw new ArgumentException($"Moves contains duplicates");
        }

        newMoves.ForEach(moveId =>
        {
            if (!availableMoves.Any(move => move.Id == moveId))
            {
                throw new ArgumentException($"Move not available for this pkm: move={moveId}");
            }
        });

        pkmUpdateService.ApplyMovesToPkm(pkm, moves);
    }
}

public record EditPkmVariantPayload(
    string Nickname,
    int[] EVs,
    ushort[] Moves
);
