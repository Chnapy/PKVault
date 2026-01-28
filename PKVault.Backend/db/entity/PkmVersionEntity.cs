using PKHeX.Core;

public class PkmVersionEntity : IEntity
{
    public override required string Id { get; init; }
    public required string BoxId { get; set; }
    public required int BoxSlot { get; set; }
    public required bool IsMain { get; set; }
    public required uint? AttachedSaveId { get; set; }
    public required string? AttachedSavePkmIdBase { get; set; }
    public required byte Generation { get; set; }
    public required string Filepath { get; set; }   // FK -> PkmFileEntity

    public required ushort Species { get; set; }
    public required byte Form { get; set; }
    public required Gender Gender { get; set; }
    public required bool IsShiny { get; set; }

    public virtual required PkmFileEntity? PkmFile { get; set; }
}
