using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

namespace PKVault.Core;

public interface IInventoryLoader : IEntityLoader<InventoryItemDTO, InventoryItemEntity>
{
    public InventoryItemDTO CreateDTO(InventoryItemEntity entity);
    public Task<InventoryItemDTO> IncrementItemCount(ushort item, GameVersion version, int boxId);
    public Task<InventoryItemDTO> DecrementItemCount(string itemId);
    public Task<Dictionary<string, InventoryItemEntity>> GetEntitiesForBox(int boxId);
    public Task<int> GetMaxBoxSlot(int boxId);
    public Task NormalizeOrders();
}

public class InventoryLoader : EntityLoader<InventoryItemDTO, InventoryItemEntity>, IInventoryLoader
{
    private readonly ISettingsService settingsService;
    private readonly PKMConverterUtils pkmConverterUtils;
    private readonly StaticDataService staticDataService;
    private readonly IBoxLoader boxLoader;

    private readonly Dictionary<GameVersion, (string[] Names, HashSet<ushort> Allowed)> VersionDataDict = [];
    private string currentLanguage = "";

    public InventoryLoader(
        ISessionServiceMinimal sessionService,
        SessionDbContext db,
        ISettingsService _settingsService,
        PKMConverterUtils _pkmConverterUtils,
        StaticDataService _staticDataService,
        IBoxLoader _boxLoader
    ) : base(
        sessionService, db
    )
    {
        settingsService = _settingsService;
        pkmConverterUtils = _pkmConverterUtils;
        staticDataService = _staticDataService;
        boxLoader = _boxLoader;
    }

    public InventoryItemDTO CreateDTO(InventoryItemEntity entity)
    {
        var (Names, Allowed) = GetVersionData(entity.Version);

        return new(
            Id: entity.Id,
            Item: (ushort)entity.Item,
            Name: entity.Item < Names.Length ? Names[entity.Item] : "",
            Type: InventoryType.None,
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
            var (_, allowedHeldItems) = pkmConverterUtils.allSavesAllowedItems[(byte)version];

            versionData = (itemsStrings, allowedHeldItems);
            VersionDataDict.Add(version, versionData);
        }
        return versionData;
    }

    public async Task<InventoryItemDTO> IncrementItemCount(ushort item, GameVersion version, int boxId)
    {
        var entity = await GetEntity(item, version, boxId);

        if (entity == null)
        {
            var itemKey = await GetItemKey(item, version);
            var id = (await GetMaxId()) + 1;

            var boxSlot = (await GetMaxBoxSlot(boxId)) + 1;

            var box = await boxLoader.GetEntityRequired(boxId.ToString());
            if (box.Type != BoxType.Inventory)
                throw new ArgumentException($"Box {boxId} is not type Inventory");
            if (boxSlot >= box.SlotCount)
                throw new ArgumentException($"Item slot out of box bounds: {boxSlot}/{box.SlotCount}");

            entity = new()
            {
                Id = id.ToString(),
                IdInt = id,
                ItemKey = itemKey,
                Item = item,
                Version = version,
                Count = 1,
                BoxId = boxId,
                BoxSlot = boxSlot,
            };
            await AddEntity(entity);
        }
        else
        {
            entity.Count++;
            await UpdateEntity(entity);
        }

        return CreateDTO(entity);
    }

    public async Task<InventoryItemDTO> DecrementItemCount(string itemId)
    {
        var entity = await GetEntityRequired(itemId);

        entity.Count--;

        if (entity.Count <= 0)
            await DeleteEntity(entity);
        else
            await UpdateEntity(entity);

        return CreateDTO(entity);
    }

    public async Task<Dictionary<string, InventoryItemEntity>> GetEntitiesForBox(int boxId)
    {
        var dbSet = await GetDbSet();

        return await dbSet
            .Where(p => p.BoxId == boxId)
            .ToDictionaryAsync(p => p.Id);
    }

    public async Task<InventoryItemEntity?> GetEntity(ushort item, GameVersion version, int boxId)
    {
        var itemKey = await GetItemKey(item, version);

        var dbSet = await GetDbSet();

        return await dbSet.FirstOrDefaultAsync(p => p.ItemKey == itemKey && p.BoxId == boxId);
    }

    public async Task<int> GetMaxBoxSlot(int boxId)
    {
        var dbSet = await GetDbSet();

        var q = dbSet.Where(p => p.BoxId == boxId);

        if (!await q.AnyAsync())
            return 0;

        return await q.MaxAsync(p => p.BoxSlot);
    }

    public async Task<int> GetMaxId()
    {
        var dbSet = await GetDbSet();

        if (!await dbSet.AnyAsync())
            return 0;

        return await dbSet.MaxAsync(p => p.IdInt);
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

    private async Task<string> GetItemKey(ushort item, GameVersion version)
    {
        var staticItems = (await staticDataService.GetStaticOthers()).Items;

        var versionItems = staticItems.VersionItems.First(vi => vi.Versions.Contains((byte)version));
        return versionItems.ComboItems[item];
    }

    protected override async Task<InventoryItemDTO> GetDTOFromEntity(InventoryItemEntity entity)
    {
        return CreateDTO(entity);
    }

    protected override DbSet<InventoryItemEntity> GetDbSetRaw() => db.InventoryItems;
}
