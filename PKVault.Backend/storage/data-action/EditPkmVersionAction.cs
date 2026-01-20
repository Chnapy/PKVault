using PKHeX.Core;

public class EditPkmVersionAction(
    ActionService actionService, PkmConvertService pkmConvertService,
    string pkmVersionId, EditPkmVersionPayload editPayload
) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
        var pkmVersionPKM = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);

        var availableMoves = await actionService.GetPkmAvailableMoves(null, pkmVersionId);

        var pkm = pkmVersionPKM.Update(pkm =>
        {
            EditPkmNickname(pkmConvertService, pkm, editPayload.Nickname);
            EditPkmEVs(pkmConvertService, pkm, editPayload.EVs);
            EditPkmMoves(pkmConvertService, pkm, availableMoves, editPayload.Moves);

            // absolutly required before each write
            // TODO make a using write pkm to ensure use of this call
            pkm.ResetPartyStats();
            pkm.RefreshChecksum();
        });

        loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity, pkm);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetEntitiesByBox(pkmVersionEntity.BoxId, pkmVersionEntity.BoxSlot).Values.ToList()
            .FindAll(value => value.Id != pkmVersionId);

        relatedPkmVersions.ForEach((versionEntity) =>
        {
            var relatedPkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(versionEntity).Update(relatedPkm =>
            {
                pkmConvertService.PassDynamicsToPkm(pkm, relatedPkm);

                relatedPkm.ResetPartyStats();
                relatedPkm.RefreshChecksum();
            });

            loaders.pkmVersionLoader.WriteEntity(versionEntity, relatedPkm);
        });

        if (pkmVersionEntity.AttachedSaveId != null)
        {
            await SynchronizePkmAction.SynchronizePkmVersionToSave(pkmConvertService, loaders, flags, [(pkmVersionEntity.Id, pkmVersionEntity.AttachedSavePkmIdBase!)]);
        }

        return new(
            type: DataActionType.EDIT_PKM_VERSION,
            parameters: [pkmVersionPKM.Nickname, pkmVersionPKM.Generation]
        );
    }

    public static void EditPkmNickname(PkmConvertService pkmConvertService, PKM pkm, string nickname)
    {
        if (pkm.Nickname == nickname)
        {
            return;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            throw new ArgumentException($"Nickname should be <= {pkm.MaxStringLengthNickname} for this generation & language");
        }

        pkmConvertService.ApplyNicknameToPkm(pkm, nickname, true);
    }

    public static void EditPkmEVs(PkmConvertService pkmConvertService, PKM pkm, int[] evs)
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

            if (pkm.Format <= 2 && ev > 65535)
            {
                throw new ArgumentException($"G1-2 EV cannot be > 65535");
            }

            if (pkm.Format > 2 && pkm.Format <= 5 && ev > 255)
            {
                throw new ArgumentException($"G3-5 EV cannot be > 255");
            }

            if (pkm.Format > 5 && ev > 252)
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

        pkmConvertService.ApplyEVsAVsToPkm(pkm, newEVs);
    }

    public static void EditPkmMoves(PkmConvertService pkmConvertService, PKM pkm, List<MoveItem> availableMoves, Span<ushort> moves)
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

        pkmConvertService.ApplyMovesToPkm(pkm, moves);
    }
}

public record EditPkmVersionPayload(
    string Nickname,
    int[] EVs,
    ushort[] Moves
);
