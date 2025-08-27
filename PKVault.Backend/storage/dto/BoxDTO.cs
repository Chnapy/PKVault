public class BoxDTO : IWithId<string>
{
    public const int PARTY_ID = -1;
    public const int DAYCARE_ID = -2;

    public string Id { get { return BoxEntity.Id; } }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public BoxType Type { get; set; }

    public string Name { get { return BoxEntity.Name; } }

    public bool CanReceivePkm { get { return Type != BoxType.Daycare; } }

    public required BoxEntity BoxEntity;
}

public enum BoxType
{
    Default,
    Party,
    Daycare
}
