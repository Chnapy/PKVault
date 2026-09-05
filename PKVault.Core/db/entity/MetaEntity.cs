public class MetaEntity
{
    public required MetaKey Key { get; init; }
    public required string Value { get; set; }
}

public enum MetaKey
{
    APP_VERSION,
    USER_ID
}
