
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
            cursor.Close();
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
        foreach (var segment in relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries))
            docId = ChildDocId(docId!, segment);

        var uri = DocumentsContract.BuildDocumentUriUsingTree(treeUri, docId)!;
        return QueryMime(resolver, uri) is null ? null : uri;
    }

    static string ChildDocId(string parentDocId, string name)
        => parentDocId.EndsWith(':') ? parentDocId + name : $"{parentDocId}/{name}";

    static string? QueryMime(ContentResolver resolver, Uri documentUri)
    {
        try
        {
            using var c = resolver.Query(documentUri, [DocumentsContract.Document.ColumnMimeType], null, null, null);
            var result = c != null && c.MoveToFirst() ? c.GetString(0) : null;
            c?.Close();
            return result;
        }
        catch
        {
            return null;
        }
    }

    public static long? GetSize(ContentResolver resolver, Uri documentUri)
    {
        using var cursor = resolver.Query(documentUri, [DocumentsContract.Document.ColumnSize], null, null, null);
        if (cursor is null || !cursor.MoveToFirst() || cursor.IsNull(0))
        {
            cursor?.Close();
            return null;
        }

        var value = cursor.GetLong(0);
        cursor.Close();
        return value;
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
        cursor.Close();

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
        {
            cursor?.Close();
            return null;
        }

        var value = (cursor.GetString(0) ?? "unknown",
                 cursor.IsNull(1) ? 0L : cursor.GetLong(1));
        cursor.Close();
        return value;
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
            return asDirectory
                ? currentUri
                : throw new IOException("Cannot create a file at the tree root");
        }

        for (var i = 0; i < segments.Length; i++)
        {
            var expectDirectory = i < segments.Length - 1 || asDirectory;
            var name = segments[i];

            var childDocId = ChildDocId(docId!, name);
            var childUri = DocumentsContract.BuildDocumentUriUsingTree(treeUri, childDocId)!;
            var mime = QueryMime(resolver, childUri);

            if (mime is not null)
            {
                if (mime == DocumentsContract.Document.MimeTypeDir != expectDirectory)
                    throw new IOException(expectDirectory
                        ? $"'{name}' exists and is a file"
                        : $"'{name}' exists and is a directory");

                currentUri = childUri;
                docId = childDocId;
            }
            else
            {
                var newMime = expectDirectory ? DocumentsContract.Document.MimeTypeDir! : GetMimeType(name);
                currentUri = DocumentsContract.CreateDocument(resolver, currentUri, newMime, name)
                    ?? throw new IOException(
                        $"CreateDocument returned null (name={name}, parent={currentUri}, mime={newMime})");
                docId = DocumentsContract.GetDocumentId(currentUri);
            }
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
