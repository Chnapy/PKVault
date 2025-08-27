
using System.Runtime.InteropServices;

namespace PKVault.WinForm;

internal static class NativeMethods
{
    // http://msdn.microsoft.com/en-us/library/ms681944(VS.85).aspx
    /// <summary>
    /// Allocates a new console for the calling process.
    /// </summary>
    /// <returns>nonzero if the function succeeds; otherwise, zero.</returns>
    /// <remarks>
    /// A process can be associated with only one console,
    /// so the function fails if the calling process already has a console.
    /// </remarks>
    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern int AllocConsole();

    // http://msdn.microsoft.com/en-us/library/ms683150(VS.85).aspx
    /// <summary>
    /// Detaches the calling process from its console.
    /// </summary>
    /// <returns>nonzero if the function succeeds; otherwise, zero.</returns>
    /// <remarks>
    /// If the calling process is not already attached to a console,
    /// the error code returned is ERROR_INVALID_PARAMETER (87).
    /// </remarks>
    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern int FreeConsole();
}
