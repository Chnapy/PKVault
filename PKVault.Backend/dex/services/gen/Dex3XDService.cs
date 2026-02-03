using PKHeX.Core;

public class Dex3XDService(SAV3XD save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        // TODO all memo part dont work (wrong values)

        // Span<ushort> subLength = stackalloc ushort[16];
        // int[] subOffsets = new int[16];
        // for (int i = 0; i < 16; i++)
        // {
        //     subLength[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x20 + (2 * i)));
        //     subOffsets[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i))) | (BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i) + 2)) << 16);
        // }

        // var Memo = subOffsets[5] + 0xA8;

        // var memo = new StrategyMemo(save.Data.AsSpan(Memo, subLength[5]), xd: true);

        // var entry = memo.GetEntry(species);

        var isSeen = isOwned || save.GetSeen(species);

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: false,
            IsCaught: isOwned || save.GetCaught(species),
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return [];
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.SetSeen(species, true);

        if (isCaught)
            save.SetCaught(species, true);
    }
}
