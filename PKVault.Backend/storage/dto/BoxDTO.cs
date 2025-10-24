using PKHeX.Core;

public class BoxDTO : IWithId<string>
{
    public string Id { get { return BoxEntity.Id; } }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public StorageSlotType Type { get; set; }

    public string Name { get { return BoxEntity.Name; } }

    public int SlotCount
    {
        get => SlotCountVariable == -1
            ? Type switch
            {
                StorageSlotType.Box => 30,
                StorageSlotType.Party => 6,
                _ => throw new NotImplementedException(),
            }
            : SlotCountVariable;
    }

    public int SlotCountVariable = -1;

    public bool CanWrite => Type == StorageSlotType.Box;

    public bool CanReceivePkm => Type == StorageSlotType.Party || Type == StorageSlotType.Box;

    public required BoxEntity BoxEntity;

    public static bool CanIdReceivePkm(int boxId) => boxId == -(int)StorageSlotType.Party || boxId >= 0;
}
