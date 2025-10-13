using PKHeX.Core;

public class Dex4Service : DexGenService<SAV4>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV4 save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

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

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || save.GetSeen(species);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = false,
            IsCaught = ownedPkms.Count > 0 || save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
            // IsLangJa = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 0),
            // IsLangEn = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 1),
            // IsLangFr = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 2),
            // IsLangIt = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 3),
            // IsLangDe = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 4),
            // IsLangEs = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 5),
        };
    }
}
