using Microsoft.EntityFrameworkCore;

public interface IDexLoader : IEntityLoader<DexItemDTO, DexEntity>
{
}

public class DexLoader : EntityLoader<DexItemDTO, DexEntity>, IDexLoader
{
    public DexLoader(
        IFileIOService fileIOService,
        SessionService sessionService,
        SessionDbContext db) : base(
        fileIOService, sessionService, db, new()
    )
    {
    }

    protected override Task<DexItemDTO> GetDTOFromEntity(DexEntity entity) => throw new NotImplementedException($"Entity to DTO should not be used here");

    protected override DbSet<DexEntity> GetDbSetRaw() => db.Pokedex;
}
