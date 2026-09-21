using System.Reflection;
using Serilog;

public static class ObjectComparer
{
    public static void DisplayDifferences(object? obj1, object? obj2)
    {
        Log.Debug($"[Compare] {obj1} vs {obj2}");

        if (obj1 == null || obj2 == null)
        {
            Log.Debug("[Compare] One or all of given objects are null");
            return;
        }

        Type type = obj1.GetType();

        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic)
            .Where(prop => prop.CanRead)
            .Select(prop =>
            {
                try
                {
                    return (
                        prop.Name,
                        V1: prop.GetValue(obj1),
                        V2: prop.GetValue(obj2),
                        prop.PropertyType.IsArray
                    );
                }
                catch
                {
                    return (
                        prop.Name,
                        V1: "(error)",
                        V2: "(error)",
                        IsArray: false
                    );
                }
            });

        var fields = type.GetFields(BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic)
            .Select(prop =>
            {
                try
                {
                    return (
                        prop.Name,
                        V1: prop.GetValue(obj1),
                        V2: prop.GetValue(obj2),
                        prop.FieldType.IsArray
                    );
                }
                catch
                {
                    return (
                        prop.Name,
                        V1: "(error)",
                        V2: "(error)",
                        IsArray: false
                    );
                }
            });
        IEnumerable<(string Name, object? V1, object? V2, bool IsArray)> allProps = [.. properties, .. fields];

        foreach (var (Name, V1, V2, IsArray) in allProps)
        {
            if (IsArray)
            {
                if (!AreArraysEqual(V1 as Array, V2 as Array))
                    LogDifference(Name, FormatArray(V1 as Array), FormatArray(V2 as Array));
            }
            else
            {
                if (!Equals(V1, V2))
                    LogDifference(Name, V1, V2);
            }
        }
    }

    private static void LogDifference(string name, object? val1, object? val2)
    {
        Log.Debug($"[Compare] {name}: {val1}/{val2}");
    }

    private static bool AreArraysEqual(Array? arr1, Array? arr2)
    {
        if (arr1 == null && arr2 == null) return true;
        if (arr1 == null || arr2 == null) return false;
        if (arr1.Length != arr2.Length) return false;

        for (int i = 0; i < arr1.Length; i++)
        {
            var item1 = arr1.GetValue(i);
            var item2 = arr2.GetValue(i);
            if (!Equals(item1, item2))
                return false;
        }
        return true;
    }

    private static string FormatArray(Array? arr)
    {
        if (arr == null) return "null";
        var items = arr.Cast<object>().Select(x => x?.ToString() ?? "null");
        return $"[{string.Join(", ", items)}]";
    }
}
