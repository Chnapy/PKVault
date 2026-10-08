
using Android.Content;
using Android.Provider;
using Uri = Android.Net.Uri;

namespace PKVault.Mobile;

public class SafDocument
{
    public record SafFileEntry(string RelativePath, bool IsDirectory);

    public record PickedDirectory(string Uri, string DisplayName);

    public record PickedDirectoryEntry(string Uri, string Name, bool IsDirectory, long Size, DateTime LastModified);

    public static IEnumerable<SafFileEntry> ListRecursiveRelative(
        ContentResolver resolver, Uri treeUri, string? parentDocumentId, string relativePrefix)
    {
        var docId = parentDocumentId ?? DocumentsContract.GetTreeDocumentId(treeUri);
        var childrenUri = DocumentsContract.BuildChildDocumentsUriUsingTree(treeUri, docId);

        var projection = new[]
        {
            DocumentsContract.Document.ColumnDocumentId,
            DocumentsContract.Document.ColumnDisplayName,
            DocumentsContract.Document.ColumnMimeType,
        };

        var children = new List<(string Id, string Name, bool IsDirectory)>();
        using (var cursor = resolver.Query(childrenUri!, projection, null, null, null))
        {
            if (cursor is null)
                yield break;
            while (cursor.MoveToNext())
            {
                children.Add((
                    cursor.GetString(0)!,
                    cursor.GetString(1) ?? "",
                    cursor.GetString(2) == DocumentsContract.Document.MimeTypeDir));
            }
        }

        foreach (var (id, name, isDirectory) in children)
        {
            var relPath = string.IsNullOrEmpty(relativePrefix) ? name : $"{relativePrefix}/{name}";
            yield return new SafFileEntry(relPath, isDirectory);

            if (isDirectory)
            {
                foreach (var sub in ListRecursiveRelative(resolver, treeUri, id, relPath))
                    yield return sub;
            }
        }
    }

    public static Uri? ResolveExisting(ContentResolver resolver, Uri treeUri, string relativePath)
    {
        var docId = DocumentsContract.GetTreeDocumentId(treeUri);

        if (string.IsNullOrEmpty(relativePath))
            return DocumentsContract.BuildDocumentUriUsingTree(treeUri, docId);

        Uri? currentUri = null;
        foreach (var segment in relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries))
        {
            var children = ListChildren(resolver, treeUri, docId);
            var match = children.FirstOrDefault(c => c.Name == segment);
            if (match is null)
                return null;

            currentUri = Uri.Parse(match.Uri)!;
            docId = DocumentsContract.GetDocumentId(currentUri);
        }
        return currentUri;
    }

    public static long? GetSize(ContentResolver resolver, Uri documentUri)
    {
        using var cursor = resolver.Query(documentUri, [DocumentsContract.Document.ColumnSize], null, null, null);
        if (cursor is null || !cursor.MoveToFirst() || cursor.IsNull(0))
            return null;
        return cursor.GetLong(0);
    }

    // public static IReadOnlyList<PickedDirectoryEntry> ListEntries(string treeUriString, bool recursive = true)
    // {
    //     var activity = Platform.CurrentActivity!;
    //     var treeUri = Uri.Parse(treeUriString)!;
    //     return recursive
    //         ? ListRecursive(activity.ContentResolver!, treeUri)
    //         : ListChildren(activity.ContentResolver!, treeUri);
    // }

    public static IReadOnlyList<PickedDirectoryEntry> ListChildren(
        ContentResolver resolver, Uri treeUri, string? parentDocumentId = null
    )
    {
        var docId = parentDocumentId ?? DocumentsContract.GetTreeDocumentId(treeUri);
        var childrenUri = DocumentsContract.BuildChildDocumentsUriUsingTree(treeUri, docId);

        var projection = new[]
        {
            DocumentsContract.Document.ColumnDocumentId,
            DocumentsContract.Document.ColumnDisplayName,
            DocumentsContract.Document.ColumnMimeType,
            DocumentsContract.Document.ColumnSize,
            DocumentsContract.Document.ColumnLastModified,
        };

        var results = new List<PickedDirectoryEntry>();
        using var cursor = resolver.Query(childrenUri!, projection, null, null, null);
        if (cursor is null)
            return results;

        while (cursor.MoveToNext())
        {
            var id = cursor.GetString(0);
            var name = cursor.GetString(1) ?? "";
            var mime = cursor.GetString(2) ?? "";
            var size = cursor.IsNull(3) ? 0L : cursor.GetLong(3);
            var lastModified = cursor.IsNull(4) ? 0L : cursor.GetLong(4);
            var isDirectory = mime == DocumentsContract.Document.MimeTypeDir;
            var entryUri = DocumentsContract.BuildDocumentUriUsingTree(treeUri, id);

            results.Add(new PickedDirectoryEntry(
                entryUri!.ToString()!, name, isDirectory, size,
                DateTimeOffset.FromUnixTimeMilliseconds(lastModified).DateTime)
            );
        }
        return results;
    }

    // public static IReadOnlyList<PickedDirectoryEntry> ListRecursive(
    //     ContentResolver resolver, Uri treeUri, string? parentDocumentId = null
    // )
    // {
    //     var all = new List<PickedDirectoryEntry>();
    //     var direct = ListChildren(resolver, treeUri, parentDocumentId);
    //     all.AddRange(direct);

    //     foreach (var dir in direct.Where(e => e.IsDirectory))
    //     {
    //         var childId = DocumentsContract.GetDocumentId(Uri.Parse(dir.Uri)!);
    //         all.AddRange(ListRecursive(resolver, treeUri, childId));
    //     }
    //     return all;
    // }

    public static (string Name, long LastModifiedMs)? GetSingleDocumentMeta(
        ContentResolver resolver, Uri documentUri)
    {
        var projection = new[]
        {
            DocumentsContract.Document.ColumnDisplayName,
            DocumentsContract.Document.ColumnLastModified,
        };
        using var cursor = resolver.Query(documentUri, projection, null, null, null);
        if (cursor is null || !cursor.MoveToFirst())
            return null;

        return (cursor.GetString(0) ?? "unknown",
                 cursor.IsNull(1) ? 0L : cursor.GetLong(1));
    }

    public static Uri ResolveOrCreateFile(ContentResolver resolver, Uri treeUri, string relativePath)
        => ResolveOrCreate(resolver, treeUri, relativePath, asDirectory: false);

    public static Uri ResolveOrCreateDirectory(ContentResolver resolver, Uri treeUri, string relativePath)
        => ResolveOrCreate(resolver, treeUri, relativePath, asDirectory: true);

    private static Uri ResolveOrCreate(ContentResolver resolver, Uri treeUri, string relativePath, bool asDirectory)
    {
        var segments = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        var docId = DocumentsContract.GetTreeDocumentId(treeUri);
        var currentUri = DocumentsContract.BuildDocumentUriUsingTree(treeUri, docId)!;

        if (segments.Length == 0)
        {
            // La racine du tree existe forcément
            return asDirectory
                ? currentUri
                : throw new IOException("Cannot create a file at the tree root");
        }

        for (var i = 0; i < segments.Length; i++)
        {
            var isLast = i == segments.Length - 1;
            var expectDirectory = !isLast || asDirectory;
            var name = segments[i];

            var match = ListChildren(resolver, treeUri, docId)
                .FirstOrDefault(c => c.Name == name);

            if (match is not null)
            {
                if (match.IsDirectory != expectDirectory)
                    throw new IOException(expectDirectory
                        ? $"'{name}' exists and is a file"
                        : $"'{name}' exists and is a directory");

                currentUri = Uri.Parse(match.Uri)!;
            }
            else
            {
                var mime = expectDirectory ? DocumentsContract.Document.MimeTypeDir! : GetMimeType(name);
                currentUri = DocumentsContract.CreateDocument(resolver, currentUri, mime, name)
                    ?? throw new IOException(
                        $"CreateDocument returned null (name={name}, parent={currentUri}, mime={mime})");
            }

            docId = DocumentsContract.GetDocumentId(currentUri);
        }

        return currentUri;
    }

    private static string GetMimeType(string fileName)
    {
        var ext = Path.GetExtension(fileName).TrimStart('.').ToLowerInvariant();
        return Android.Webkit.MimeTypeMap.Singleton?.GetMimeTypeFromExtension(ext)
            ?? "application/octet-stream";
    }
}
