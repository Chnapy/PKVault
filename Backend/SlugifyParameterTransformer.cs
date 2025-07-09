using System.Text.RegularExpressions;

public class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object value)
    {
        // Convertit "UserRegistration" en "user-registration"
        return value == null ? null :
            Regex.Replace(value.ToString(), "([a-z])([A-Z])", "$1-$2").ToLower();
    }
}
