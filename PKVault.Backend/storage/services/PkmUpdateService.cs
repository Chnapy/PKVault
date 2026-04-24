
using PKHeX.Core;

/**
 * Pass (copy) properties from a PKM to another one.
 * Apply properties to a PKM.
 */
public class PkmUpdateService(ILogger<PkmUpdateService> log, ILegalityAnalysisService legalityAnalysisService)
{
    public void ApplyNicknameToPkm(PKM pkm, string nickname, bool sourcePkmIsNicknamed)
    {
        var language = GetPkmLanguage(pkm);

        if (!sourcePkmIsNicknamed)
        {
            nickname = "";
        }

        var defaultNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, language, pkm.Format);
        if (defaultNickname.Length == 0)
        {
            log.LogWarning($"defaultNickname EMPTY for SPECIES={pkm.Species} LANG={language} FORMAT={pkm.Format} NICKNAME={nickname}");
        }

        if (nickname.Trim().Length == 0)
        {
            nickname = defaultNickname;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            nickname = nickname[..pkm.MaxStringLengthNickname];
        }

        var isNicknamed = SpeciesName.IsNicknamed(pkm.Species, nickname, language, pkm.Format)
            && !nickname.Equals(defaultNickname, StringComparison.InvariantCultureIgnoreCase);

        pkm.SetNickname(isNicknamed ? nickname : "");

        // log.LogInformation($"NICKNAME: {isNicknamed} {pkm.Nickname} expected={nickname} default={defaultNickname}");
    }

    public void ApplyEVsAVsToPkm(PKM pkm, Span<int> evs)
    {
        if (pkm is PB7 pb7)
        {
            for (var i = 0; i < evs.Length; i++)
            {
                pb7.SetAV(i, (byte)evs.ToArray()[i]);
            }
        }
        else
        {
            pkm.SetEVs(evs);
        }
    }

    public void ApplyAbilityToPkm(PKM pkm)
    {
        bool hasAbilityOrPidIssue() => legalityAnalysisService.GetLegalitySafe(new(pkm)).Results.Any(result =>
            !result.Valid
            && (result.Identifier == CheckIdentifier.Ability || result.Identifier == CheckIdentifier.PID)
        );
        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && hasAbilityOrPidIssue(); i++)
        {
            pkm.RefreshAbility(i);
        }
    }

    public void ApplyMovesToPkm(PKM pkm, Span<ushort> moves)
    {
        pkm.SetMoves(moves);
        pkm.FixMoves();
    }

    public int GetPkmLanguage(PKM pkm)
    {
        if (pkm is GBPKM gbpkm)
        {
            return gbpkm.IsSpeciesNameMatch(pkm.Language) ? pkm.Language : gbpkm.GuessedLanguage(pkm.Language);
        }

        return pkm.Language;
    }
}
