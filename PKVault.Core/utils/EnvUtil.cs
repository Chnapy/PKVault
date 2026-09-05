public class EnvUtil
{
    // expected in Docker monolith context
    public static string? PKVAULT_PATH => Environment.GetEnvironmentVariable("PKVAULT_PATH");

    // expected in flatpak context
    public static string? XDG_DATA_HOME => Environment.GetEnvironmentVariable("XDG_DATA_HOME");

    public static int? LOG_FILE_COUNT_LIMIT => ToInt(Environment.GetEnvironmentVariable("LOG_FILE_COUNT_LIMIT"));
    public static int? BACKUP_FILE_COUNT_LIMIT => ToInt(Environment.GetEnvironmentVariable("BACKUP_FILE_COUNT_LIMIT"));
    public static bool DEMO_MODE => ToBool(Environment.GetEnvironmentVariable("PKVAULT_DEMO_MODE"));

    private static int? ToInt(string? value)
    {
        if (value == null) return null;

        return int.TryParse(value, out var result) ? result : null;
    }

    private static bool ToBool(string? value)
    {
        return value != null && bool.TryParse(value, out var result) && result;
    }
}