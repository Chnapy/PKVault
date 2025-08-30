namespace PKVault.WinForm;

public static class Program
{
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
                LogUtil.Initialize();

                // To customize application configuration such as set high DPI settings or default font,
                // see https://aka.ms/applicationconfiguration.
                ApplicationConfiguration.Initialize();

#if DEBUG
                NativeMethods.AllocConsole();
                Console.WriteLine("Debug Console");
#endif

                Application.Run(new MainForm(args));

#if DEBUG
                NativeMethods.FreeConsole();
#endif
        }
}