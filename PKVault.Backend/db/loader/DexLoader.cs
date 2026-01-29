using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IDexLoader : IEntityLoader<DexItemForm, DexFormEntity>
{
    public DexItemForm CreateDTO(DexFormEntity entity, DexItemForm? dynamicInfos);
    public Task<Dictionary<ushort, DexFormEntity[]>> GetEntitiesBySpecies();
    public Task<Dictionary<ushort, DexFormEntity[]>> GetEntitiesBySpecies(ICollection<ushort> speciesList);
}

public class DexLoader : EntityLoader<DexItemForm, DexFormEntity>, IDexLoader
{
    public static string GetId(ushort species, byte form, Gender gender) => $"{species}.{form}.{gender}";

    public DexLoader(
        ISessionServiceMinimal sessionService,
        SessionDbContext db) : base(
        sessionService, db, new()
    )
    {
    }

    public DexItemForm CreateDTO(DexFormEntity entity, DexItemForm? dynamicInfos) => new(
        Id: entity.Id,
        Species: entity.Species,
        Form: entity.Form,
        Gender: entity.Gender,
        Context: dynamicInfos?.Context ?? default,
        Generation: dynamicInfos?.Generation ?? default,
        Types: dynamicInfos?.Types ?? [],
        Abilities: dynamicInfos?.Abilities ?? [],
        BaseStats: dynamicInfos?.BaseStats ?? [],
        IsSeen: entity.IsCaught,
        IsSeenShiny: entity.IsCaughtShiny,
        IsCaught: entity.IsCaught,
        IsOwned: dynamicInfos?.IsOwned ?? false,
        IsOwnedShiny: dynamicInfos?.IsOwnedShiny ?? false
    );

    public async Task<Dictionary<ushort, DexFormEntity[]>> GetEntitiesBySpecies()
    {
        var dbSet = await GetDbSet();

        return await dbSet
            .GroupBy(e => e.Species)
            .ToDictionaryAsync(g => g.First().Species, g => g.ToArray());
    }

    public async Task<Dictionary<ushort, DexFormEntity[]>> GetEntitiesBySpecies(ICollection<ushort> speciesList)
    {
        var dbSet = await GetDbSet();

        return await dbSet
            .Where(e => speciesList.Contains(e.Species))
            .GroupBy(e => e.Species)
            .ToDictionaryAsync(g => g.First().Species, g => g.ToArray());
    }

    protected override async Task<DexItemForm> GetDTOFromEntity(DexFormEntity entity) => CreateDTO(entity, default);

    protected override DbSet<DexFormEntity> GetDbSetRaw() => db.Pokedex;
}
