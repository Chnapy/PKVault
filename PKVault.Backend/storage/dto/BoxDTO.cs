using PKHeX.Core;

public class BoxDTO : IWithId<string>
{
    public string Id { get { return BoxEntity.Id; } }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public BoxType Type { get; set; }

    public string Name { get { return BoxEntity.Name; } }

    public int SlotCount
    {
        get => SlotCountVariable == -1
            ? Type switch
            {
                BoxType.Box => 30,
                BoxType.Party => 6,
                _ => throw new NotImplementedException(),
            }
            : SlotCountVariable;
    }

    public int SlotCountVariable = -1;

    public bool CanWrite => Type == BoxType.Box;

    public bool CanReceivePkm => Type == BoxType.Party || Type == BoxType.Box;

    public required BoxEntity BoxEntity;

    public static bool CanIdReceivePkm(int boxId) => boxId == (int)BoxType.Party || boxId >= (int)BoxType.Box;

    public static BoxType GetTypeFromStorageSlotType(StorageSlotType slotType) => slotType switch
    {
        StorageSlotType.Box => BoxType.Box,
        StorageSlotType.Party => BoxType.Party,
        StorageSlotType.BattleBox => BoxType.BattleBox,
        StorageSlotType.Daycare => BoxType.Daycare,
        StorageSlotType.GTS => BoxType.GTS,
        StorageSlotType.FusedKyurem => BoxType.Fused,
        StorageSlotType.FusedNecrozmaS => BoxType.Fused,
        StorageSlotType.FusedNecrozmaM => BoxType.Fused,
        StorageSlotType.FusedCalyrex => BoxType.Fused,
        StorageSlotType.Misc => BoxType.Misc,
        StorageSlotType.Resort => BoxType.Resort,
        StorageSlotType.Ride => BoxType.Ride,
        StorageSlotType.Shiny => BoxType.Shiny,
        _ => throw new NotImplementedException(slotType.ToString()),
    };
}

public enum BoxType : int
{
    Box = 0,
    Party = -1,

    /// <summary> Battle Box </summary>
    BattleBox = -2,
    /// <summary> Daycare </summary>
    Daycare = -3,
    /// <summary> Global Trade Station (GTS) </summary>
    GTS = -4,

    /// <summary> Fused Legendary Storage </summary>
    Fused = -5,

    /// <summary> Miscellaneous </summary>
    Misc = -6,
    /// <summary> Poké Pelago (Gen7) </summary>
    Resort = -7,
    /// <summary> Ride Legendary Slot (S/V) </summary>
    Ride = -8,

    /// <summary> Shiny Overworld Cache </summary>
    Shiny = -9,
}
