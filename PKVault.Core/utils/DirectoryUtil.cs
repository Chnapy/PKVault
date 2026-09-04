using Serilog;

public record DirectoryContent(
    string SourcePath,
    IEnumerable<string> DirectoryPaths,
    IEnumerable<string> FilePaths
);

public class DirectoryUtil
{
    public static DirectoryContent Ls(string sourcePath)
    {
        try
        {
            var dirPaths = Directory.EnumerateDirectories(sourcePath).Select(MatcherUtil.NormalizePath).Order();
            var filePaths = Directory.EnumerateFiles(sourcePath).Select(MatcherUtil.NormalizePath).Order();

            return new(
                SourcePath: sourcePath,
                DirectoryPaths: dirPaths,
                FilePaths: filePaths
            );
        }
        catch (IOException)
        {
            return new(
                SourcePath: sourcePath,
                DirectoryPaths: [],
                FilePaths: []
            );
        }
    }

    public static void CopyDirectoryRecursive(string sourceDir, string destDir)
    {
        try
        {
            Directory.CreateDirectory(destDir);
        }
        catch (Exception ex)
        {
            Log.Logger.Error(ex, $"Directory create failed: {destDir}");
        }

        foreach (var file in Directory.EnumerateFiles(sourceDir))
        {
            var destFile = Path.Combine(destDir, Path.GetFileName(file));
            try
            {
                Log.Logger.Debug($"Copy file: {file} -> {destFile}");
                File.Copy(file, destFile, overwrite: true);
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, $"File copy failed: {file} -> {destFile}");
            }
        }

        foreach (var subDir in Directory.EnumerateDirectories(sourceDir))
        {
            var destSubDir = Path.Combine(destDir, Path.GetFileName(subDir));
            try
            {
                Log.Logger.Debug($"Copy directory: {subDir} -> {destSubDir}");
                CopyDirectoryRecursive(subDir, destSubDir);
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, $"Directory copy failed: {subDir} -> {destSubDir}");
            }
        }
    }

}
