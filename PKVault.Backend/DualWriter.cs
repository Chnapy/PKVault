using System.Text;

public class DualWriter(TextWriter consoleOut, TextWriter fileWriter) : TextWriter
{
    public override Encoding Encoding => consoleOut.Encoding;

    public override void Write(char value)
    {
        consoleOut.Write(value);
        fileWriter.Write(value);
    }

    public override void WriteLine(string? value)
    {
        consoleOut.WriteLine(value);
        fileWriter.WriteLine(value);
        fileWriter.Flush();
    }
}
