
using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;

/**
 * SaveFile wrapper for control & conveniance.
 * Not immutable for clone performance constraints.
 */
public class SaveWrapper(SaveFile Save, string path)
{
    public uint Id
    {
        get
        {
            if (Save.ID32 == default)
            {
                // var encodeBase = $"{(byte)Save.Version}-{Save.Generation}-{Save.TID16}-{Save.Metadata.FilePath}";
                byte[] bytes = Encoding.UTF8.GetBytes(path);
                byte[] hash = SHA1.HashData(bytes);
                return BitConverter.ToUInt32(hash, 0);
            }
            return Save.ID32;
        }
    }

    public SaveFileState State => Save.State;
    public SaveFileMetadata Metadata => Save.Metadata;

    public string Extension => Save.Extension;

    public string PlayTimeString => Save.PlayTimeString;

    #region Metadata & Limits
    public GameVersion Version => Save.Version;
    public bool ChecksumsValid => Save.ChecksumsValid;
    public string ChecksumInfo => Save.ChecksumInfo;
    public byte Generation => Save.Generation;
    public EntityContext Context => Save.Context;
    #endregion

    // Offsets

    #region Stored PKM Limits
    public IPersonalTable Personal => Save.Personal;
    public int MaxStringLengthTrainer => Save.MaxStringLengthTrainer;
    public int MaxStringLengthNickname => Save.MaxStringLengthNickname;
    public ushort MaxMoveID => Save.MaxMoveID;
    public ushort MaxSpeciesID => Save.MaxSpeciesID;
    public int MaxAbilityID => Save.MaxAbilityID;
    public int MaxItemID => Save.MaxItemID;
    public int MaxBallID => Save.MaxBallID;
    public GameVersion MaxGameID => Save.MaxGameID;
    public GameVersion MinGameID => Save.MinGameID;
    #endregion

    // public bool GetFlag(int offset, int bitIndex)
    // public void SetFlag(int offset, int bitIndex, bool value)
    // public bool GetFlag(Span<byte> data, int offset, int bitIndex)
    // public void SetFlag(Span<byte> data, int offset, int bitIndex, bool value)

    #region Player Info
    public byte Gender => Save.Gender;
    public int Language => Save.Language;
    public ushort TID16 => Save.TID16;
    public ushort SID16 => Save.SID16;
    public string OT => Save.OT;
    public int PlayedHours => Save.PlayedHours;
    public int PlayedMinutes => Save.PlayedMinutes;
    public int PlayedSeconds => Save.PlayedSeconds;
    public uint SecondsToStart => Save.SecondsToStart;
    public uint SecondsToFame => Save.SecondsToFame;
    public uint Money => Save.Money;
    public int BoxCount => Save.BoxCount;
    public int SlotCount => Save.SlotCount;
    public int MaxMoney => Save.MaxMoney;
    public int MaxCoins => Save.MaxCoins;

    public TrainerIDFormat TrainerIDDisplayFormat => Save.TrainerIDDisplayFormat;
    public uint TrainerTID7 => Save.TrainerTID7;
    public uint TrainerSID7 => Save.TrainerSID7;
    public uint DisplayTID => Save.DisplayTID;
    public uint DisplaySID => Save.DisplaySID;

    #endregion

    #region Party
    public int PartyCount => Save.PartyCount;
    public bool HasParty => Save.HasParty;
    // public IList<PKM> PartyData => Save.PartyData;

    public void SetPartySlotAtIndex(ImmutablePKM pk, int index, EntityImportSettings settings = default) =>
        Save.SetPartySlotAtIndex(pk.GetPkm(), index, settings);
    #endregion

    #region Slot Storing
    public Type PKMType => Save.PKMType;
    // protected PKM GetPKM(byte[] data)
    // protected byte[] DecryptPKM(byte[] data)
    // public PKM BlankPKM => Save.BlankPKM;
    // protected int SIZE_STORED
    // protected int SIZE_PARTY
    // public int SIZE_BOXSLOT
    // public int MaxEV
    // public int MaxIV
    // public ReadOnlySpan<ushort> HeldItems
    // protected Span<byte> BoxBuffer
    // protected Span<byte> PartyBuffer
    // public bool IsPKMPresent(ReadOnlySpan<byte> data)
    // public PKM GetDecryptedPKM(byte[] data)
    // public PKM GetPartySlot(ReadOnlySpan<byte> data)
    // public PKM GetStoredSlot(ReadOnlySpan<byte> data)
    // public PKM GetBoxSlot(int offset)

    // public byte[] GetDataForFormatStored(PKM pk)
    // public byte[] GetDataForFormatParty(PKM pk)
    // public byte[] GetDataForParty(PKM pk)
    // public byte[] GetDataForBox(PKM pk)

    // public void WriteSlotFormatStored(PKM pk, Span<byte> data)
    // public void WriteSlotFormatParty(PKM pk, Span<byte> data)
    // public void WritePartySlot(PKM pk, Span<byte> data)
    // public void WriteBoxSlot(PKM pk, Span<byte> data)

    /// <summary>
    /// Conditions a <see cref="pk"/> for this save file as if it was traded to it.
    /// </summary>
    /// <param name="pk">Entity to adapt</param>
    /// <param name="isParty">Entity exists in party format</param>
    /// <param name="option">Setting on whether to adapt</param>
    // public void AdaptToSaveFile(PKM pk, bool isParty = true, EntityImportOption option = EntityImportOption.UseDefault)
    #endregion

    #region Pokédex
    public bool HasPokeDex => Save.HasPokeDex;
    // public bool GetSeen(ushort species)
    // public void SetSeen(ushort species, bool seen)
    // public bool GetCaught(ushort species)
    // public void SetCaught(ushort species, bool caught)
    public int SeenCount => Save.SeenCount;

    /// <summary> Count of unique Species Caught (Owned) </summary>
    public int CaughtCount => Save.CaughtCount;
    public decimal PercentSeen => Save.PercentSeen;
    public decimal PercentCaught => Save.PercentCaught;
    #endregion

    public bool HasBox => Save.HasBox;
    public int BoxSlotCount => Save.BoxSlotCount;
    public int BoxesUnlocked => Save.BoxesUnlocked;
    public byte[] BoxFlags => Save.BoxFlags;
    public int CurrentBox => Save.CurrentBox;

    #region BoxData
    protected int Box { get; set; } = int.MinValue;
    #endregion

    #region Storage Health & Metadata
    public StorageSlotSource GetBoxSlotFlags(int box, int slot) => Save.GetBoxSlotFlags(box, slot);
    #endregion

    #region Storage Offsets and Indexing
    // public int GetBoxOffset(int box)
    // public int GetBoxSlotOffset(int box, int slot)
    // public ImmutablePKM GetBoxSlotAtIndex(int box, int slot)
    // public void GetBoxSlotFromIndex(int index, out int box, out int slot)
    // public ImmutablePKM GetBoxSlotAtIndex(int index)
    // public int GetBoxSlotOffset(int index)
    public void SetBoxSlotAtIndex(ImmutablePKM pk, int box, int slot, EntityImportSettings settings = default) =>
        Save.SetBoxSlotAtIndex(pk.GetPkm(), box, slot, settings);
    public void SetBoxSlotAtIndex(ImmutablePKM pk, int index, EntityImportSettings settings = default) =>
        Save.SetBoxSlotAtIndex(pk.GetPkm(), index, settings);
    #endregion

    public List<SlotInfoMisc> GetExtraSlots(bool all = false) => Save.GetExtraSlots(all);

    public SaveFile GetSave() => Save;

    public ImmutablePKM GetBlankPKM() => new(Save.BlankPKM);

    public List<ImmutablePKM> GetAllPKM() => [.. Save.GetAllPKM().Select(pkm => new ImmutablePKM(pkm))];

    public byte[] GetSaveFileData()
    {
        return Save.Write().ToArray();
    }

    public List<ImmutablePKM> GetPartyData() => [.. Save.PartyData.Select(pkm => new ImmutablePKM(pkm))];

    public List<ImmutablePKM> GetBoxData(int box) => [.. Save.GetBoxData(box).Select(pkm => new ImmutablePKM(pkm))];

    public List<string> GetBoxNames() => [.. BoxUtil.GetBoxNames(Save)];

    public bool IsSpeciesAllowed(ushort species)
    {
        if (Save is SAV7b)
        {
            return species <= 151
                || species == 808
                || species == 809;
        }

        return species <= Save.MaxSpeciesID;
    }

    // public ImmutableSave Update(Action<SaveFile> mutator)
    // {
    //     var clone = Save.Clone();

    //     mutator(clone);

    //     return new(clone, path);
    // }

    /**
     * Clone SaveFile and all its PKM.
     * May be slow.
     */
    public SaveWrapper Clone() => new(Save.Clone(), path);
}
