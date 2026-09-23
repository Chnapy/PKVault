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

        var objectsDiffs = GetObjectsDiff(obj1, obj2);

        foreach (var (Name, (Value1, Value2)) in objectsDiffs)
        {
            LogDifference(Name, Value1, Value2);
        }
    }

    public static Dictionary<string, Tuple<string, string>> GetObjectsDiff(object obj1, object obj2)
    {
        var obj1Members = GetObjectMembers(obj1);
        var obj2Members = GetObjectMembers(obj2);

        string[] membersNames = [.. obj1Members.Keys, .. obj2Members.Keys];
        membersNames = membersNames.Distinct().ToArray();

        return membersNames.Select(name =>
        {
            obj1Members.TryGetValue(name, out var v1);
            obj2Members.TryGetValue(name, out var v2);

            if (v1.IsArray || v2.IsArray)
            {
                if (!AreArraysEqual(v1.Value as Array, v2.Value as Array))
                    return (Name: name, Value1: FormatArray(v1.Value as Array), Value2: FormatArray(v2.Value as Array));
            }
            else
            {
                if (!IsValuesEqual(v1.Value, v2.Value))
                    return (Name: name, Value1: FormatPrimitive(v1.Value), Value2: FormatPrimitive(v2.Value));
            }
            return default;
        })
        .Where(e => e != default)
        .ToDictionary(
            e => e.Name,
            e => Tuple.Create(e.Value1, e.Value2)
        );
    }

    private static Dictionary<string, (object? Value, bool IsArray)> GetObjectMembers(object obj)
    {
        Type type = obj.GetType();

        Dictionary<string, (object? Value, bool IsArray)> dict = [];

        dict.Add("Type", (Value: type.FullName, IsArray: false));

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic))
        {
            if (!prop.CanRead)
                continue;
            try
            {
                dict.TryAdd(prop.Name, (
                    Value: prop.GetValue(obj),
                    prop.PropertyType.IsArray
                ));
            }
            catch
            { }
        }

        foreach (var prop in type.GetFields(BindingFlags.Public | BindingFlags.Instance | BindingFlags.NonPublic))
        {
            try
            {
                dict.TryAdd(prop.Name, (
                    Value: prop.GetValue(obj),
                    prop.FieldType.IsArray
                ));
            }
            catch
            { }
        }

        return dict;
    }

    private static void LogDifference(string name, object? val1, object? val2)
    {
        Log.Debug($"[Compare] {name}: {val1} / {val2}");
    }

    private static bool AreArraysEqual(Array? arr1, Array? arr2)
    {
        arr1 ??= Array.Empty<object>();
        arr2 ??= Array.Empty<object>();

        if (arr1.Length != arr2.Length) return false;

        for (int i = 0; i < arr1.Length; i++)
        {
            var item1 = arr1.GetValue(i);
            var item2 = arr2.GetValue(i);
            if (!IsValuesEqual(item1, item2))
                return false;
        }
        return true;
    }

    private static bool IsValuesEqual(object? v1, object? v2)
    {
        if (v1 == v2)
            return true;

        var t = v1?.GetType() ?? v2!.GetType();
        var value1NonNull = v1 ?? GetDefaultValue(t);
        var value2NonNull = v2 ?? GetDefaultValue(t);

        return Equals(value1NonNull, value2NonNull)
            || Equals(FormatPrimitive(value1NonNull), FormatPrimitive(value2NonNull));
    }

    private static object? GetDefaultValue(Type t)
    {
        if (t == typeof(string)) return "";
        return Activator.CreateInstance(t);
    }

    private static string FormatPrimitive(object? value)
    {
        if (value == null) return "null";
        return $"{value}";
    }

    private static string FormatArray(Array? arr)
    {
        if (arr == null) return "null";
        var items = arr.Cast<object>().Select(x => x?.ToString() ?? "null");
        return $"[{string.Join(", ", items)}]";
    }
}
