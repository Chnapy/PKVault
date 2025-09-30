public class BoxEntity : IWithId<string>
{
    public required string Id { get; set; }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public required string Name { get; set; }
}
