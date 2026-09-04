using System.Text.RegularExpressions;

namespace PKVault.Core;

public partial class SlugifyTransformer
{
    public static string? TransformOutbound(object? value)
    {
        // convert "UserRegistration" to "user-registration"
        return value == null ? null :
            MyRegex().Replace(value.ToString()!, "$1-$2").ToLower();
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex MyRegex();
}
