using Android.Content;
using Uri = Android.Net.Uri;

namespace PKVault.Mobile;

public class AndroidDirectoryPicker(SafTreeMapper safTreeMapper) : IDirectoryPicker
{
    public static TaskCompletionSource<Uri?>? PendingPickTask = null;
    public const int DirectoryPickerRequestCode = 20202;
    public const int FilePickerRequestCode = 20303;

    public async Task<string?> PickFileAsync(string mimeType = "*/*")
    {
        var activity = Platform.CurrentActivity
            ?? throw new InvalidOperationException("No current Activity");

        PendingPickTask?.TrySetResult(null);
        var tcs = new TaskCompletionSource<Uri?>();
        PendingPickTask = tcs;

        var intent = new Intent(Intent.ActionOpenDocument);
        intent.AddCategory(Intent.CategoryOpenable);
        intent.SetType(mimeType);
        intent.AddFlags(
            ActivityFlags.GrantReadUriPermission |
            ActivityFlags.GrantWriteUriPermission |
            ActivityFlags.GrantPersistableUriPermission
        );

        activity.StartActivityForResult(intent, FilePickerRequestCode);

        var uri = await tcs.Task;
        if (uri is null) return null;

        // Persist permission
        activity.ContentResolver!.TakePersistableUriPermission(uri,
            ActivityFlags.GrantReadUriPermission | ActivityFlags.GrantWriteUriPermission
        );
        safTreeMapper.InvalidateCache();

        if (!safTreeMapper.TryGetLocalPath(uri, out var localPath))
        {
            activity.ContentResolver!.ReleasePersistableUriPermission(uri,
                ActivityFlags.GrantReadUriPermission | ActivityFlags.GrantWriteUriPermission
            );
            throw new NotSupportedException("Only files from local storage (internal/SD) are supported.");
        }

        return localPath;
    }

    public async Task<string?> PickDirectoryAsync()
    {
        var activity = Platform.CurrentActivity
            ?? throw new InvalidOperationException("No current Activity");

        PendingPickTask?.TrySetResult(null);
        var tcs = new TaskCompletionSource<Uri?>();
        PendingPickTask = tcs;

        var intent = new Intent(Intent.ActionOpenDocumentTree);
        intent.AddFlags(
            ActivityFlags.GrantReadUriPermission |
            ActivityFlags.GrantWriteUriPermission |
            ActivityFlags.GrantPersistableUriPermission
        );

        activity.StartActivityForResult(intent, DirectoryPickerRequestCode);

        var treeUri = await tcs.Task;
        if (treeUri is null)
            return null;

        // Persist permission
        activity.ContentResolver!.TakePersistableUriPermission(
            treeUri,
            ActivityFlags.GrantReadUriPermission | ActivityFlags.GrantWriteUriPermission
        );
        safTreeMapper.InvalidateCache();

        if (!safTreeMapper.TryGetLocalPath(treeUri, out var localPath))
        {
            activity.ContentResolver!.ReleasePersistableUriPermission(treeUri,
                ActivityFlags.GrantReadUriPermission | ActivityFlags.GrantWriteUriPermission
            );
            throw new NotSupportedException("Only folders from local storage (internal/SD) are supported.");
        }

        return localPath;
    }

    public IReadOnlyList<string> GetPersistedDirectories()
    {
        var activity = Platform.CurrentActivity!;
        return activity.ContentResolver!.PersistedUriPermissions
            .Where(p => p.IsReadPermission)
            .Select(p =>
            {
                return p.Uri!.ToString()!;
                // var doc = DocumentFile.FromTreeUri(activity, p.Uri);
                // return new PickedDirectory(
                //     p.Uri!.ToString()!,
                //     doc?.Name ?? p.Uri.LastPathSegment ?? "Unknown"
                // );
            })
            .ToList();
    }

    public void ReleasePersistedDirectory(string uriString)
    {
        var activity = Platform.CurrentActivity!;
        var uri = Uri.Parse(uriString)!;
        activity.ContentResolver!.ReleasePersistableUriPermission(
            uri,
            ActivityFlags.GrantReadUriPermission | ActivityFlags.GrantWriteUriPermission
        );
    }
}
