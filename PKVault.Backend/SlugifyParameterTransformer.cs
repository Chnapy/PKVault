using System.Text.RegularExpressions;

public partial class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        // Convertit "UserRegistration" en "user-registration"
        return value == null ? null :
            MyRegex().Replace(value.ToString()!, "$1-$2").ToLower();
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex MyRegex();
}
