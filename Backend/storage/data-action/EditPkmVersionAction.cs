
using PKHeX.Core;

public class EditPkmVersionAction : DataAction
{
    private readonly string pkmVersionId;
    private readonly EditPkmVersionPayload payload;

    public EditPkmVersionAction(string _pkmVersionId, EditPkmVersionPayload _payload)
    {
        pkmVersionId = _pkmVersionId;
        payload = _payload;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.EDIT_PKM_VERSION,
            parameters = [pkmVersionId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId);

        if (pkmEntity.SaveId != default)
        {
            throw new Exception("Edit not possible for pkm attached with save");
        }

        var pkmBytes = loaders.pkmFileLoader.GetEntity(pkmVersionEntity);
        var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity, pkmEntity);

        var pkmVersionDto = PkmVersionDTO.FromEntity(pkmVersionEntity, pkm, pkmEntity);

        EditPkmNickname(pkm, pkmVersionEntity.Generation, payload.Nickname);
        EditPkmEVs(pkm, payload.EVs);
        EditPkmMoves(pkm, pkmVersionDto.AvailableMoves, payload.Moves);

        // absolutly required before each write
        // TODO make a using write pkm to ensure use of this call
        pkm.RefreshChecksum();

        loaders.pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(pkm), pkm, pkmVersionEntity.Generation, null
        );

        // var testBytes = loaders.pkmFileLoader.GetEntity(pkmVersionEntity);
        // var testPkm = PKMLoader.CreatePKM(testBytes, pkmVersionEntity, pkmEntity);

        // Console.WriteLine($"PKM EV-HP = {pkm.EV_HP} - {testPkm.EV_HP} - {string.Join('.', pkm.Data) == string.Join('.', testPkm.Data)}");

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllEntities()
        .FindAll(value => value.PkmId == pkmEntity.Id && value.Id != pkmVersionId);

        relatedPkmVersions.ForEach(version =>
        {
            var pkmBytes = loaders.pkmFileLoader.GetEntity(version);
            if (pkmBytes == default)
            {
                throw new Exception($"PKM-bytes is null, from entity Id={version.Id} Filepath={version.Filepath}");
            }

            var relatedPkm = PKMLoader.CreatePKM(pkmBytes, version, pkmEntity);
            if (relatedPkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={version.Id} Filepath={version.Filepath} bytes.length={pkmBytes.Length}");
            }

            PkmConvertService.PassDynamicsToPkm(pkm, relatedPkm, pkmEntity, version.Generation);

            relatedPkm.RefreshChecksum();

            loaders.pkmFileLoader.WriteEntity(PKMLoader.GetPKMBytes(relatedPkm), relatedPkm, version.Generation, null);
        });
    }

    public static void EditPkmNickname(PKM pkm, uint generation, string nickname)
    {
        if (pkm.Nickname == nickname)
        {
            return;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            throw new Exception($"Nickname should be <= {pkm.MaxStringLengthNickname} for this generation & language");
        }

        PkmConvertService.ApplyNicknameToPkm(pkm, generation, nickname);
    }

    public static void EditPkmEVs(PKM pkm, int[] evs)
    {
        if (evs.Count() != 6)
        {
            throw new Exception("EVs should be length 6");
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
                throw new Exception($"EV value should be positive");
            }

            if (pkm.Generation <= 2 && ev > 65535)
            {
                throw new Exception($"G1-2 EV cannot be > 65535");
            }

            if (pkm.Generation > 2 && pkm.Generation <= 5 && ev > 255)
            {
                throw new Exception($"G3-5 EV cannot be > 255");
            }

            if (pkm.Generation > 5 && ev > 252)
            {
                throw new Exception($"G6+ EV cannot be > 252");
            }
        });

        var newSum = newEVs.ToArray().Sum();
        var existingSum = existingEVs.Sum();

        if (newSum != existingSum)
        {
            throw new Exception("EVs total sum should not change");
        }

        if (string.Join('.', newEVs.ToArray()) == string.Join('.', existingEVs))
        {
            return;
        }

        PkmConvertService.ApplyEVsToPkm(pkm, newEVs);
    }

    public static void EditPkmMoves(PKM pkm, List<MoveItem> availableMoves, Span<ushort> moves)
    {
        var newMoves = moves.ToArray().ToList();
        var existingMoves = pkm.Moves;

        if (string.Join('.', newMoves) == string.Join('.', existingMoves))
        {
            return;
        }

        if (newMoves.Count == 0 || newMoves.Count > 4)
        {
            throw new Exception($"Moves length should be > 0 & <= 4");
        }

        if (newMoves.Count != newMoves.Distinct().Count())
        {
            throw new Exception($"Moves contains duplicates");
        }

        newMoves.ForEach(moveId =>
        {
            if (availableMoves.FindAll(move => move.Id == moveId).Count() == 0)
            {
                throw new Exception($"Move not available for this pkm-version: {moveId}");
            }
        });

        PkmConvertService.ApplyMovesToPkm(pkm, moves);
    }
}

public struct EditPkmVersionPayload
{
    public string Nickname { get; set; }

    public int[] EVs { get; set; }

    public ushort[] Moves { get; set; }
}
