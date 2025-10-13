
using PKHeX.Core;

public class DexItemDTO
{
    public required string Id { get; set; }
    public required ushort Species { get; set; }
    public required uint SaveId { get; set; }
    public required List<DexItemForm> Forms { get; set; }
    // public bool IsSeen { get => Forms.Any(form => form.IsSeen); }
    // public bool IsSeenShiny { get => Forms.Any(form => form.IsSeenShiny); }
    // public bool IsCaught { get => Forms.Any(form => form.IsCaught); }
    // public bool IsOwned { get => Forms.Any(form => form.IsOwned); }
    // public bool IsOwnedShiny { get => Forms.Any(form => form.IsOwnedShiny); }
    // public bool IsLangJa { get; set; }
    // public bool IsLangEn { get; set; }
    // public bool IsLangFr { get; set; }
    // public bool IsLangIt { get; set; }
    // public bool IsLangDe { get; set; }
    // public bool IsLangEs { get; set; }
    // public bool IsLangKo { get; set; }
    // public bool IsLangCh { get; set; }
    // public bool IsLangCh2 { get; set; }
}

public class DexItemForm
{
    public required byte Form { get; set; }
    public byte Generation { get; set; }
    public required Gender Gender { get; set; }
    public required List<byte> Types { get; set; }
    public required int[] Abilities { get; set; }
    public required int[] BaseStats { get; set; }
    public required bool IsSeen { get; set; }
    public required bool IsSeenShiny { get; set; }
    public required bool IsCaught { get; set; }
    public required bool IsOwned { get; set; }
    public required bool IsOwnedShiny { get; set; }
}
