
public class DexItemDTO
{
    public required string Id { get; set; }
    public required ushort Species { get; set; }
    public required uint SaveId { get; set; }
    public List<byte> Types { get; set; }
    public required int[] Abilities { get; set; }
    public int[] BaseStats { get; set; }
    public required bool IsOnlyMale { get; set; }
    public required bool IsOnlyFemale { get; set; }
    public required bool IsGenderless { get; set; }
    public required bool IsAnySeen { get; set; }
    public bool IsSeenM { get; set; }
    public bool IsSeenF { get; set; }
    public bool IsSeenMS { get; set; }
    public bool IsSeenFS { get; set; }
    public bool IsCaught { get; set; }
    public bool IsOwned { get; set; }
    public bool IsOwnedShiny { get; set; }
    public bool IsLangJa { get; set; }
    public bool IsLangEn { get; set; }
    public bool IsLangFr { get; set; }
    public bool IsLangIt { get; set; }
    public bool IsLangDe { get; set; }
    public bool IsLangEs { get; set; }
    public bool IsLangKo { get; set; }
    public bool IsLangCh { get; set; }
    public bool IsLangCh2 { get; set; }
}
