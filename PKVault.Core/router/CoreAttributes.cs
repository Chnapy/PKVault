namespace PKVault.Core;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public class RouteAttribute(string template) : Attribute
{
    public string Template { get; } = template;
}

public class HttpAttribute(string method, string template) : Attribute
{
    public string Method { get; } = method;
    public string Template { get; } = template;
}

[AttributeUsage(AttributeTargets.All, AllowMultiple = false)]
public class HttpGetAttribute(string template = "") : HttpAttribute("GET", template)
{
}

[AttributeUsage(AttributeTargets.All, AllowMultiple = false)]
public class HttpPutAttribute(string template = "") : HttpAttribute("PUT", template)
{
}

[AttributeUsage(AttributeTargets.All, AllowMultiple = false)]
public class HttpPostAttribute(string template = "") : HttpAttribute("POST", template)
{
}

[AttributeUsage(AttributeTargets.All, AllowMultiple = false)]
public class HttpDeleteAttribute(string template = "") : HttpAttribute("DELETE", template)
{
}
