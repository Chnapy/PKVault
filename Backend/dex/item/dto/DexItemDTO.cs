
public class DexItemDTO
{
    public string Id { get; set; }
    public ushort Species { get; set; }
    public uint SaveId { get; set; }
    public string SpeciesName { get; set; }
    public byte Type1 { get; set; }
    public byte Type2 { get; set; }
    public bool IsOnlyMale { get; set; }
    public bool IsOnlyFemale { get; set; }
    public bool IsGenderless { get; set; }
    public bool IsAnySeen { get; set; }
    public bool IsSeenM { get; set; }
    public bool IsSeenF { get; set; }
    public bool IsSeenMS { get; set; }
    public bool IsSeenFS { get; set; }
    // public bool IsAnySeen { get; set; }
    // public bool IsDisplayedM { get; set; }
    // public bool IsDisplayedF { get; set; }
    // public bool IsDisplayedMS { get; set; }
    // public bool IsDisplayedFS { get; set; }
    // public bool IsAnyDisplayed { get; set; }
    public bool IsCaught { get; set; }
    public bool IsOwned { get; set; }
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
