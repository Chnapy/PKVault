using PKHeX.Core;

public class PkmVariantEntity : IEntity
{
    public static PkmVariantEntity CreateFrom(PkmVariantEntity entity, string id) => new()
    {
        Id = id,
        BoxId = entity.BoxId,
        BoxSlot = entity.BoxSlot,
        IsMain = entity.IsMain,
        IsExternal = entity.IsExternal,
        AttachedSaveId = entity.AttachedSaveId,
        AttachedSavePkmIdBase = entity.AttachedSavePkmIdBase,
        Context = entity.Context,
        Generation = entity.Generation,
        Filepath = entity.Filepath,
        Species = entity.Species,
        Form = entity.Form,
        Gender = entity.Gender,
        IsShiny = entity.IsShiny,
        IsAlpha = entity.IsAlpha,
        PkmFile = entity.PkmFile
    };

    public override required string Id { get; init; }
    public required string BoxId { get; set; }
    public required int BoxSlot { get; set; }
    public required bool IsMain { get; set; }
    public required bool IsExternal { get; set; }
    public required uint? AttachedSaveId { get; set; }
    public required string? AttachedSavePkmIdBase { get; set; }
    public required EntityContext Context { get; set; }
    public required byte Generation { get; set; }
    public required string Filepath { get; set; }   // FK -> PkmFileEntity

    public required ushort Species { get; set; }
    public required byte Form { get; set; }
    public required Gender Gender { get; set; }
    public required bool IsShiny { get; set; }
    public required bool IsAlpha { get; set; }

    public virtual required PkmFileEntity? PkmFile { get; set; }
}
