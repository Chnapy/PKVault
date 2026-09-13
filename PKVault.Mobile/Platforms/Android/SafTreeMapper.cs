using Android.Content;
using Android.OS.Storage;
using Android.Provider;
using Uri = Android.Net.Uri;

namespace PKVault.Mobile;

public class SafTreeMapper(Context appContext)
{
    public record MappedEntry(string LocalPath, Uri Uri, bool IsTree);

    public ContentResolver Resolver => appContext.ContentResolver!;

    List<MappedEntry>? _entryCache;
    Dictionary<string, string>? _volumeCache;

    public void InvalidateCache()
    {
        _entryCache = null;
        _volumeCache = null;
    }

    Dictionary<string, string> GetVolumeMountPoints()
    {
        if (_volumeCache is not null) return _volumeCache;

        var storageManager = (StorageManager)appContext.GetSystemService(Context.StorageService)!;
        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var volume in storageManager.StorageVolumes)
        {
            var volumeId = volume.IsPrimary ? "primary" : volume.Uuid;
            if (volumeId is null) continue;

            var mountPath = OperatingSystem.IsAndroidVersionAtLeast(30)
                ? volume.Directory?.AbsolutePath
                : null;

            if (mountPath is not null)
                map[volumeId] = mountPath;
        }

        _volumeCache = map;
        return map;
    }

    // Conversion générique docId -> chemin réel, utilisable pour un tree OU un document unique
    public bool TryGetLocalPath(Uri uri, out string localPath)
    {
        localPath = "";
        string? docId;
        try
        {
            docId = DocumentsContract.IsTreeUri(uri)
                ? DocumentsContract.GetTreeDocumentId(uri)
                : DocumentsContract.GetDocumentId(uri);
        }
        catch
        {
            return false; // provider qui ne suit pas le schéma docId standard (ex. cloud)
        }

        var parts = docId?.Split(':', 2);
        if (parts is not { Length: 2 }) return false;

        var volumes = GetVolumeMountPoints();
        if (!volumes.TryGetValue(parts[0], out var mount)) return false;

        localPath = string.IsNullOrEmpty(parts[1]) ? mount : Path.Combine(mount, parts[1]);
        return true;
    }

    List<MappedEntry> GetMappedEntries()
    {
        if (_entryCache is not null) return _entryCache;

        Serilog.Log.Debug($"[SafTreeMapper] {Resolver.PersistedUriPermissions.Count} persisted permissions");
        foreach (var p in Resolver.PersistedUriPermissions)
            Serilog.Log.Debug($"  -> {p.Uri} (read={p.IsReadPermission} write={p.IsWritePermission})");

        _entryCache = Resolver.PersistedUriPermissions
            .Where(p => p.IsReadPermission)
            .Select(p =>
            {
                if (!TryGetLocalPath(p.Uri, out var localPath)) return null;
                return new MappedEntry(localPath, p.Uri, DocumentsContract.IsTreeUri(p.Uri));
            })
            .Where(e => e is not null)
            .Select(e => e!)
            .ToList();

        return _entryCache;
    }

    public bool TryResolveExactFile(string fullPath, out Uri uri)
    {
        var match = GetMappedEntries().FirstOrDefault(e => !e.IsTree && e.LocalPath == fullPath);
        uri = match?.Uri!;
        return match is not null;
    }

    public bool TryResolve(string path, out Uri uri, out bool isTree, out string relativePath)
    {
        uri = default!;
        isTree = false;
        relativePath = "";

        if (path.Contains("/Android/data/") || path.Contains("/Android/obb/"))
            return false; // toujours géré par System.IO classique

        var entries = GetMappedEntries();

        // 1. Correspondance exacte prioritaire (document unique)
        var exact = entries.FirstOrDefault(e => !e.IsTree && e.LocalPath == path);
        if (exact is not null)
        {
            uri = exact.Uri;
            isTree = false;
            return true;
        }

        // 2. Sinon, tree englobant le plus spécifique
        var treeMatch = entries
            .Where(e => e.IsTree && (
                path == e.LocalPath ||
                path.StartsWith(e.LocalPath + "/", StringComparison.Ordinal)))
            .OrderByDescending(e => e.LocalPath.Length)
            .FirstOrDefault();

        if (treeMatch is null) return false;

        uri = treeMatch.Uri;
        isTree = true;
        relativePath = path[treeMatch.LocalPath.Length..].TrimStart('/', '\\');
        return true;
    }
}
