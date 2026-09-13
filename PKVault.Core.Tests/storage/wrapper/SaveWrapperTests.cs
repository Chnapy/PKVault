
using Moq;
using PKHeX.Core;
using PKVault.Core;

public class SaveWrapperTests
{
    public SaveWrapperTests()
    {
        Program.Initialize();
    }

    public static Mock<SaveWrapper> GetMockSave(
        string path,
        byte[] content
    )
    {
        var saveData = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/Pokemon - Version Saphir (France).srm"));
        SaveUtil.TryGetSaveFile(saveData, out var save);
        ArgumentNullException.ThrowIfNull(save);
        save.Metadata.SetExtraInfo(path);

        Mock<SaveWrapper> saveWrapper = new(save);
        saveWrapper.Setup(x => x.GetSaveFileData()).Returns(content);

        return saveWrapper;
    }
}
