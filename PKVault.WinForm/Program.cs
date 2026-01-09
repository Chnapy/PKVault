using System.Runtime.InteropServices;

namespace PKVault.WinForm;

public static class Program
{
#if DEBUG
        [DllImport("kernel32.dll")]
        static extern bool AttachConsole(int dwProcessId);
#endif

        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
#if DEBUG
                AttachConsole(-1);
                Console.WriteLine("Debug Console");
#endif

                LogUtil.Initialize();

                var fullStartupTime = LogUtil.Time($"Setup WinForm full startup until frontend data setup");
                var partialStartupTime = LogUtil.Time($"Setup WinForm partial startup until WebView2 navigate completed");

                // To customize application configuration such as set high DPI settings or default font,
                // see https://aka.ms/applicationconfiguration.
                ApplicationConfiguration.Initialize();


                Backend.Program.Copyright();
                Application.Run(new MainForm(args, fullStartupTime, partialStartupTime));

                LogUtil.Dispose();
        }
}