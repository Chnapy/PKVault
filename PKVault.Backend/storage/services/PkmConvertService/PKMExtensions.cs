using PKHeX.Core;

public static class PKMExtensions
{
    public static void FixPID(this PKM pkm, bool isShiny, byte form, byte gender, Nature nature)
    {
        var rnd = Util.Rand;
        var i = 0;
        LegalityAnalysis legality = new(pkm);

        while (
            pkm.IsShiny != isShiny
            || pkm.Form != form
            || pkm.Gender != gender
            || pkm.Nature != nature

            // TODO may cause performance issues,
            // consider tolerate this illegality
            || (!legality.Valid && legality.Results.Any(r =>
                r.Identifier == CheckIdentifier.EC && r.Result == LegalityCheckResultCode.TransferEncryptGen6BitFlip
            ))
        )
        {
            pkm.PID = EntityPID.GetRandomPID(rnd, pkm.Species, gender, pkm.Version, nature, form, pkm.PID);
            i++;
            if (i > 100_000)
            {
                break;
            }

            legality = new(pkm);
        }

        if (pkm.Format >= 6 && (pkm.Gen3 || pkm.Gen4 || pkm.Gen5))
        {
            pkm.EncryptionConstant = pkm.PID;
        }

    }

    public static void FixMetLocation(this PKM pkm, GameVersion[] versionsToTry)
    {
        int countLocationIllegalities()
        {
            var legality = new LegalityAnalysis(pkm);
            return legality.Valid
                ? 0
                : legality.Results.ToList().FindAll(r => !r.Valid && (
                    (r.Identifier == CheckIdentifier.Encounter && r.Result != LegalityCheckResultCode.TransferTrackerMissing)
                    || r.Identifier == CheckIdentifier.Fateful
                    || r.Identifier == CheckIdentifier.GameOrigin
                )).Count;
        }

        var currentSafestVersion = pkm.Version;

        var currentCount = countLocationIllegalities();
        if (currentCount == 0)
        {
            return;
        }

        GameVersion[] allVersionsToTry = [pkm.Version, .. versionsToTry];

        foreach (var version in allVersionsToTry)
        {
            pkm.Version = version;
            SetSuggestedMetLocation(pkm);

            var count = countLocationIllegalities();
            if (count < currentCount)
            {
                currentSafestVersion = version;
                currentCount = count;
            }
            if (currentCount == 0)
            {
                break;
            }
        }

        if (currentCount > 0)
        {
            pkm.Version = currentSafestVersion;
            SetSuggestedMetLocation(pkm);
        }
    }

    public static void FixAbility(this PKM pkm)
    {
        bool hasAbilityIssue()
        {
            var legality = new LegalityAnalysis(pkm);

            // IEnumerable<CheckResult> abilityIssue = !legality.Valid
            //     ? legality.Results.Where(r =>
            //         !r.Valid
            //         && (
            //             r.Identifier == CheckIdentifier.Ability
            //         )
            //     )
            //     : [];

            // if (abilityIssue.Any())
            // {
            //     Console.WriteLine($"ABILITY ISSUE ({pkm.Ability}/{pkm.AbilityNumber}/{pkm.PersonalInfo.AbilityCount}) = {abilityIssue.First().Identifier}/{abilityIssue.First().Result}\n{legality.Report()}");
            // }
            // else
            // {
            //     Console.WriteLine($"ABILITY OK ({pkm.Ability}/{pkm.AbilityNumber}/{pkm.PersonalInfo.AbilityCount})\n{legality.Report()}");
            // }

            // return abilityIssue.Any();

            return !legality.Valid && legality.Results.Any(r =>
                !r.Valid
                && (
                    r.Identifier == CheckIdentifier.Ability
                )
            );
        }

        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && hasAbilityIssue(); i++)
        {
            pkm.RefreshAbility(i);
        }
    }

    public static void SetSuggestedMetLocation(PKM pkm)
    {
        var encounter = EncounterSuggestion.GetSuggestedMetInfo(pkm);
        if (encounter == null) return;
        // ArgumentNullException.ThrowIfNull(encounter);

        // var level = encounter.LevelMin;
        // int minLevel = EncounterSuggestion.GetLowestLevel(pkm, level);
        // if (minLevel == 0)
        //     minLevel = level;
        ushort location = encounter.Location;
        if (pkm.Format < 3 && encounter.Encounter is { } x && !x.Version.Contains(GameVersion.C))
            location = 0;

        // if (minLevel < level)
        //     minLevel = level;

        // var foo = EntitySuggestionUtil.GetMetLocationSuggestionMessage(pkm, level, location, minLevel, encounter.Encounter);

        if (pkm.Format >= 3)
        {
            pkm.MetLocation = location;
            pkm.MetLevel = encounter.GetSuggestedMetLevel(pkm);

            if (encounter.HasGroundTile(pkm.Format) && pkm is IGroundTile pkmGround)
                pkmGround.GroundTile = encounter.GetSuggestedGroundTile();

            if (pkm is { Gen6: true, WasEgg: true })
                pkm.SetHatchMemory6();
        }
        else
        {
            pkm.MetLocation = location;
            pkm.MetLevel = encounter.GetSuggestedMetLevel(pkm);
            if (pkm is ICaughtData2 pk2)
            {
                pk2.MetTimeOfDay = location == 0 ? 0 : encounter.GetSuggestedMetTimeOfDay();
            }
        }

        // if (pk6.CurrentLevel < minLevel)
        //     TB_Level.Text = minLevel.ToString();
    }
}
