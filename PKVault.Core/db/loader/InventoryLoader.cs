using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

namespace PKVault.Core;

public interface IInventoryLoader : IEntityLoader<InventoryItemDTO, InventoryItemEntity>
{
    public InventoryItemDTO CreateDTO(InventoryItemEntity entity);
    public Task NormalizeOrders();
}

public class InventoryLoader : EntityLoader<InventoryItemDTO, InventoryItemEntity>, IInventoryLoader
{
    private readonly ISettingsService settingsService;

    private readonly Dictionary<GameVersion, (string[] Names, HashSet<ushort> Allowed)> VersionDataDict = [];
    private string currentLanguage = "";

    public InventoryLoader(
        ISessionServiceMinimal sessionService,
        SessionDbContext db,
        ISettingsService _settingsService
    ) : base(
        sessionService, db
    )
    {
        settingsService = _settingsService;
    }

    public InventoryItemDTO CreateDTO(InventoryItemEntity entity)
    {
        var (Names, Allowed) = GetVersionData(entity.Version);

        return new(
            Id: entity.Id,
            Item: entity.Item,
            Name: entity.Item < Names.Length ? Names[entity.Item] : "",
            Type: entity.Type,
            Version: entity.Version,
            Count: entity.Count,
            BoxId: entity.BoxId,
            BoxSlot: entity.BoxSlot,
            CanBeHeld: entity.Item <= ushort.MaxValue && Allowed.Contains((ushort)entity.Item)
        );
    }

    private (string[] Names, HashSet<ushort> Allowed) GetVersionData(GameVersion version)
    {
        var pkhexLang = settingsService.GetSettings().GetLanguageForPKHeX();

        if (pkhexLang != currentLanguage)
        {
            currentLanguage = pkhexLang;
            VersionDataDict.Clear();
        }

        if (!VersionDataDict.TryGetValue(version, out var versionData))
        {
            var itemsStrings = GameInfo.GetStrings(pkhexLang)
                .GetItemStrings(version.Context, version);
            var blankSave = BlankSaveFile.Get(version);
            var allowedHeldItems = blankSave.HeldItems.ToArray().ToHashSet();

            versionData = (itemsStrings, allowedHeldItems);
            VersionDataDict.Add(version, versionData);
        }
        return versionData;
    }

    public async Task NormalizeOrders()
    {
        var dbSet = await GetDbSet();

        var entities = await dbSet
            .OrderBy(box => box.BoxId)
            .ThenBy(box => box.BoxSlot)
            .ToArrayAsync();

        var currentOrder = 0;
        int? boxId = null;

        foreach (var entity in entities)
        {
            if (boxId != entity.BoxId)
            {
                boxId = entity.BoxId;
                currentOrder = 0;
            }

            if (entity.BoxSlot != currentOrder)
            {
                entity.BoxSlot = currentOrder;
                await UpdateEntity(entity);
            }
            currentOrder += 1;
        }

        await db.SaveChangesAsync();
    }

    protected override async Task<InventoryItemDTO> GetDTOFromEntity(InventoryItemEntity entity)
    {
        return CreateDTO(entity);
    }

    protected override DbSet<InventoryItemEntity> GetDbSetRaw() => db.InventoryItems;
}
