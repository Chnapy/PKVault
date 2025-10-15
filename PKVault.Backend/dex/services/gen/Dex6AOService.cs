using PKHeX.Core;

public class Dex6AOService : DexGenService<SAV6AO>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV6AO save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Zukan;

        var (formIndex, formCount) = dex.GetFormIndex(species);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var isSeenBase = dex.GetSeen(species, gender == Gender.Female ? 1 : 0);
        var isSeenShinyBase = dex.GetSeen(species, gender == Gender.Female ? 3 : 2);

        var isSeenForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 0);
        var isSeenShinyForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 1);

        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isOwned || (formCount > 0 ? isSeenForm : isSeenBase);

        Span<int> abilities = stackalloc int[pi.AbilityCount];
        pi.GetAbilities(abilities);

        int[] baseStats = [
            pi.GetBaseStatValue(0),
            pi.GetBaseStatValue(1),
            pi.GetBaseStatValue(2),
            pi.GetBaseStatValue(4),
            pi.GetBaseStatValue(5),
            pi.GetBaseStatValue(3),
        ];

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = isSeenShiny,
            IsCaught = isSeen && save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
            // IsLangJa = save.Zukan.GetLanguageFlag(species - 1, 0),
            // IsLangEn = save.Zukan.GetLanguageFlag(species - 1, 1),
            // IsLangFr = save.Zukan.GetLanguageFlag(species - 1, 2),
            // IsLangIt = save.Zukan.GetLanguageFlag(species - 1, 3),
            // IsLangDe = save.Zukan.GetLanguageFlag(species - 1, 4),
            // IsLangEs = save.Zukan.GetLanguageFlag(species - 1, 5),
            // IsLangKo = save.Zukan.GetLanguageFlag(species - 1, 6),
            // IsLangCh = save.Zukan.GetLanguageFlag(species - 1, 7),
            // IsLangCh2 = save.Zukan.GetLanguageFlag(species - 1, 8)
        };
    }
}
