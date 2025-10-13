using PKHeX.Core;

public class Dex7Service : DexGenService<SAV7>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV7 save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal[species];

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || save.Zukan.GetSeen(species, gender == Gender.Female ? 1 : 0);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);
        var isSeenShiny = isOwnedShiny || save.Zukan.GetSeen(species, gender == Gender.Female ? 3 : 2);

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
            IsCaught = save.GetCaught(species),
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
