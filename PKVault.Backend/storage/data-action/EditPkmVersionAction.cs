using PKHeX.Core;

public class EditPkmVersionAction(string pkmVersionId, EditPkmVersionPayload editPayload) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkmVersionDto = loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkmDto = pkmVersionDto!.PkmDto;

        if (pkmDto.SaveId != default)
        {
            throw new ArgumentException("Edit not possible for pkm attached with save");
        }

        var availableMoves = await StorageService.GetPkmAvailableMoves(null, pkmVersionId);

        var pkm = pkmVersionDto.Pkm;

        EditPkmNickname(pkm, editPayload.Nickname);
        EditPkmEVs(pkm, editPayload.EVs);
        EditPkmMoves(pkm, availableMoves, editPayload.Moves);

        // absolutly required before each write
        // TODO make a using write pkm to ensure use of this call
        pkm.RefreshChecksum();

        loaders.pkmVersionLoader.WriteDto(pkmVersionDto);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetDtosByPkmId(pkmDto.Id).Values.ToList()
            .FindAll(value => value.Id != pkmVersionId);

        relatedPkmVersions.ForEach((versionDto) =>
        {
            var relatedPkm = versionDto.Pkm;

            PkmConvertService.PassDynamicsToPkm(pkm, relatedPkm);

            relatedPkm.RefreshChecksum();

            loaders.pkmVersionLoader.WriteDto(versionDto);
        });

        flags.MainPkmVersions = true;

        return new()
        {
            type = DataActionType.EDIT_PKM_VERSION,
            parameters = [pkmVersionDto.Nickname, pkmVersionDto.Generation]
        };
    }

    public static void EditPkmNickname(PKM pkm, string nickname)
    {
        if (pkm.Nickname == nickname)
        {
            return;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            throw new ArgumentException($"Nickname should be <= {pkm.MaxStringLengthNickname} for this generation & language");
        }

        PkmConvertService.ApplyNicknameToPkm(pkm, nickname);
    }

    public static void EditPkmEVs(PKM pkm, int[] evs)
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

        PkmConvertService.ApplyEVsAVsToPkm(pkm, newEVs);
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
            throw new ArgumentException($"Moves length should be > 0 & <= 4");
        }

        if (newMoves.Count != newMoves.Distinct().Count())
        {
            throw new ArgumentException($"Moves contains duplicates");
        }

        newMoves.ForEach(moveId =>
        {
            if (availableMoves.FindAll(move => move.Id == moveId).Count() == 0)
            {
                throw new ArgumentException($"Move not available for this pkm-version: {moveId}");
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
