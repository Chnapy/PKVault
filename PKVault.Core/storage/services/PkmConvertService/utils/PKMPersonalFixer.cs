using PKHeX.Core;
using Serilog;

namespace PKVault.Core;

public class PKMPersonalFixer(ILegalityAnalysisService legalityAnalysisService)
{
    // Fix PID and related personal data: Shiny, Form, Gender, Nature, Ability
    public void FixPID(
        PKM pkm,
        bool isShiny, byte form, byte gender, Nature nature, int ability,
        bool checkLegality = false,
        // force final values
        ConvertContext? ctx = null
    )
    {
        if (ctx?.TargetPkm?.GetType() == pkm.GetType())
        {
            FixAbility(pkm, ctx);
            pkm.PID = ctx.TargetPkm.PID;
            if (pkm is GBPKM gbpkm)
            {
                if (isShiny)
                    gbpkm.SetShiny();
                else
                    gbpkm.SetPIDGender(gender);
            }
            return;
        }

        var initialAbilityNumber = pkm.AbilityNumber;

        void RefreshEncryptionConstant()
        {
            if (pkm.Format >= 6 && (pkm.Gen3 || pkm.Gen4 || pkm.Gen5))
                pkm.EncryptionConstant = pkm.PID;
        }

        bool hasWrongShiny()
        {
            if (pkm is PK1)
                return false;

            return pkm.IsShiny != isShiny;
        }

        bool hasWrongForm()
        {
            // G3 Unown form based on PID
            var g3unown = pkm.Version is GameVersion.FR or GameVersion.LG && pkm.Species == (int)Species.Unown;
            if (!g3unown)
                return false;

            return pkm.Form != form;
        }

        bool hasWrongGender()
        {
            if (pkm is PK1)
                return false;

            if (!pkm.PersonalInfo.IsDualGender)
                return false;

            return pkm.Gender != gender;
        }

        bool hasWrongNature()
        {
            if (pkm is GBPKM)
                return false;

            return pkm.Nature != nature;
        }

        bool hasWrongAbility()
        {
            if (pkm is GBPKM)
                return false;

            if (pkm.PersonalInfo.AbilityCount < 2)
                return false;

            return HasAbilityIssue(pkm, ability);
        }

        var i = 0;

        bool hasPIDFixableIllegality()
        {
            if (!checkLegality)
                return false;

            var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx?.TargetSave);
            return !legality.Valid && legality.Results.Any(r => !r.Valid && (
                r.Identifier == CheckIdentifier.EC && r.Result == LegalityCheckResultCode.TransferEncryptGen6BitFlip

                // may causes infinite-loop with some cases (PK3), so it is capped
                || (r.Result == LegalityCheckResultCode.AbilityMismatchPID && i < 1000)
            ));
        }

        // based on https://bulbapedia.bulbagarden.net/wiki/Personality_value#Usage
        bool hasWrongPIDRelatedData()
        {
            if (pkm is PK3)
            {
                return hasWrongShiny()
                    || hasWrongForm()
                    || hasWrongGender()
                    || hasWrongNature()
                    || hasWrongAbility();
            }
            if (pkm is G3PKM)
            {
                return hasWrongShiny()
                    || hasWrongForm()
                    || hasWrongGender()
                    || hasWrongNature();
            }

            if (pkm is G4PKM)
            {
                return hasWrongShiny()
                    || hasWrongGender()
                    || hasWrongNature()
                    || hasWrongAbility();
            }

            if (pkm is PK5)
            {
                return hasWrongShiny()
                    || hasWrongGender()
                    || hasWrongAbility();
            }

            return hasWrongShiny();
        }

        // for debug purpose only
        string GetThrowMessage(string msg) => $"{msg}: {pkm.GetType().Name} {pkm.Nickname} #{pkm.Species}"
            + $"\nCurrent/Expected: shiny={pkm.IsShiny}/{isShiny} form={pkm.Form}/{form} gender={pkm.Gender}/{gender} nature={pkm.Nature}/{nature}"
            + $" ability={pkm.Ability}/{ability} ({pkm.AbilityNumber}/{initialAbilityNumber}) index={pkm.PersonalInfo.GetIndexOfAbility(ability)} checkLegality={checkLegality}"
            + $" available={pkm.PersonalInfo.GetAbilityAtIndex(0)}/{pkm.PersonalInfo.GetAbilityAtIndex(1)}"
            + $"\nversion={pkm.Version} origin={new ImmutablePKM(pkm).GetOriginMetLocation("en")} / {pkm.MetLevel} {pkm.Move1}/{pkm.Move2}/{pkm.Move3}/{pkm.Move4}"
            + $"\n{legalityAnalysisService.GetLegalitySafe(new(pkm), ctx?.TargetSave).Report("en")}";

        // for debug purpose only
        void CheckIfWrongData(Func<bool> fn)
        {
            var hasWrongData = fn();
            var fnName = fn.Method.Name;

            if (hasWrongData)
            {
#if DEBUG
                // var pkmData = new ImmutablePKM(pkm).GetDecryptedDataParty();
                // File.WriteAllBytes($"{pkm.Species}_{pkm.Form}_{fnName}.{pkm.Extension}", pkmData);

                throw new Exception(GetThrowMessage(fnName));
#else
                Log.Error(GetThrowMessage(fnName));
#endif
            }
        }

        while (true)
        {
            if (hasWrongForm())
                pkm.Form = form;
            CheckIfWrongData(hasWrongForm);

            if (hasWrongGender())
                pkm.SetGender(gender);
            CheckIfWrongData(hasWrongGender);

            if (hasWrongShiny())
            {
                if (pkm is GBPKM gbpkm)
                {
                    if (isShiny)
                    {
                        gbpkm.SetShiny();
                    }
                    else
                    {
                        gbpkm.SetPIDGender(gender);
                    }
                }
                else
                    pkm.SetIsShiny(isShiny);
            }
            CheckIfWrongData(hasWrongShiny);

            if (hasWrongNature())
                pkm.SetNature(nature);
            CheckIfWrongData(hasWrongNature);

            if (hasWrongAbility())
            {
                // initial set, so FixAbility knows ability to use
                if (pkm.Ability != ability)
                    pkm.SetAbilityIndex(pkm.PersonalInfo.GetIndexOfAbility(ability));
                FixAbility(pkm, null);
            }
            // ability may stay wrong here, it's tolerated

            if (hasWrongPIDRelatedData() || hasPIDFixableIllegality())
            {
                pkm.PID = EntityPID.GetRandomPID(Util.Rand, pkm.Species, gender, pkm.Version, nature, form, pkm.PID);
                RefreshEncryptionConstant();
            }

            var hasRemainingPIDIssues =
                hasWrongPIDRelatedData()
                || hasPIDFixableIllegality();

            // loops are expected mainly from PK3 (over 1000+ tries)
            // some possible with PK4 or PK5
            // none expected for later generations
            if (!hasRemainingPIDIssues)
                break;

            i++;

            if (i == 10_000)
                Log.Warning(GetThrowMessage("PID compute reached 10.000 tries, it may be unexpected"));

            if (i > 1_000_000)
                throw new Exception(GetThrowMessage("PID compute stopped after 10^6 failing tries"));
        }

        RefreshEncryptionConstant();
    }

    // Note: pkm.SetAbility and direct assignments are not always reliable
    // Only pkm.SetAbilityIndex should be used: it gives control on AbilityNumber, and handles all generations details like PID change etc
    public void FixAbility(
        PKM pkm,
        // force final values
        ConvertContext? ctx
    )
    {
        if (pkm is GBPKM)
            return;

        if (ctx?.TargetPkm?.GetType() == pkm.GetType())
        {
            pkm.SetAbilityIndex(GetAbilityIndex(ctx.TargetPkm.AbilityNumber));
            return;
        }

        var initialAbilityNumber = pkm.AbilityNumber;
        var ability = pkm.Ability;

        Span<int> abilities = stackalloc int[pkm.PersonalInfo.AbilityCount];
        pkm.PersonalInfo.GetAbilities(abilities);
        var initialAbilityValid = abilities.Contains(ability);

        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && HasAbilityIssue(pkm, ability); i++)
        {
            var current = pkm.PersonalInfo.GetAbilityAtIndex(i);
            if (current == ability || !initialAbilityValid)
            {
                pkm.SetAbilityIndex(i);
            }
        }

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm));

        // handle AbilityMismatchFlag (G3 specific case)
        if (HasG3AbilityMismatchFlag(pkm, legality))
        {
            // we just switch index
            pkm.SetAbilityIndex(GetAbilityIndex(pkm.AbilityNumber) == 0 ? 1 : 0);
        }
    }

    private bool HasAbilityIssue(PKM pkm, int expectedAbility)
    {
        // no ability available => pkm is in an incompatible game (like Arbok in G8) => skip
        if (pkm.PersonalInfo.GetAbilityAtIndex(0) == 0)
            return false;

        // sometimes AbilityNumber can be wrong even with a correct Ability
        if (pkm.Ability != pkm.PersonalInfo.GetAbilityAtIndex(GetAbilityIndex(pkm.AbilityNumber)))
            return true;

        // expected ability not available in context
        if (pkm.PersonalInfo.GetIndexOfAbility(expectedAbility) < 0)
            return false;

        if (pkm.Ability != expectedAbility)
            return true;

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm));
        if (legality.Valid)
            return false;

        if (HasG3AbilityMismatchFlag(pkm, legality))
            return true;

        return legality.Results.Any(r => !r.Valid
            && r.Identifier == CheckIdentifier.Ability

            // more PID issue than ability one
            && r.Result != LegalityCheckResultCode.AbilityMismatchPID

            // hidden fail can be caused by something not related to ability (moves, origin)
            && r.Result != LegalityCheckResultCode.AbilityHiddenFail

            // this mismatch cannot be fixed if we want to use expected ability
            && r.Result != LegalityCheckResultCode.AbilityMismatch3
        );
    }

    private bool HasG3AbilityMismatchFlag(PKM pkm, LegalityAnalysisWrapper legality)
    {
        if (pkm is G3PKM
            && pkm.PersonalInfo.AbilityCount > 1
            && pkm.PersonalInfo.GetAbilityAtIndex(0) == pkm.PersonalInfo.GetAbilityAtIndex(1))
        {
            if (!legality.Valid && legality.Results.Any(r => !r.Valid && r.Result == LegalityCheckResultCode.AbilityMismatchFlag))
                return true;
        }

        return false;
    }

    // 1/2/4 => 0/1/2
    private static int GetAbilityIndex(int abilityNumber, PKM? pkm = null)
    {
        // 1, 2, 4
        if (!AbilityVerifier.IsValidAbilityBits(abilityNumber))
            return 0;

        if (abilityNumber == 4)
            return 2;

        return abilityNumber - 1;
    }
}
