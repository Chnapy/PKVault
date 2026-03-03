
using PKHeX.Core;

public static class PK2Extensions
{
    public static PK3 ConvertToPK3(this PK2 pk2, LanguageID fallbackLang)
    {
        // Inspired by PK2.ConvertToPK7

        var rnd = Util.Rand;

        var pi = PersonalTable.RS[pk2.Species];
        int ability = 0; // Hidden
        var language = pk2.Japanese
            ? (byte)LanguageID.Japanese
            : (byte)fallbackLang;

        var pk3 = new PK3()
        {
            EncryptionConstant = rnd.Rand32(),
            Species = pk2.Species,
            TID16 = pk2.TID16,
            CurrentLevel = pk2.CurrentLevel,
            EXP = pk2.EXP,
            Nature = Experience.GetNatureVC(pk2.EXP),
            PID = rnd.Rand32(),
            Ball = 4,

            MetLocation = 0,
            MetDate = pk2.MetDate,
            MetLevel = 0,

            Version = GameVersion.S,
            Gender = pk2.Gender,
            IsNicknamed = pk2.IsNicknamed,
            Form = pk2.Form,

            Language = language,
            Nickname = pk2.IsNicknamed
                ? pk2.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk2.Species, language, 3),

            CurrentHandler = 1,
            OriginalTrainerName = pk2.GetTransferTrainerName(language),
            OriginalTrainerGender = pk2.OriginalTrainerGender, // Crystal
            OriginalTrainerFriendship = pk2.CurrentFriendship,
            HandlingTrainerName = pk2.OriginalTrainerName,
            HandlingTrainerGender = pk2.OriginalTrainerGender,
            HandlingTrainerFriendship = pk2.CurrentFriendship,

            Ability = pi.GetAbilityAtIndex(ability),
            AbilityNumber = 1 << ability,
        };

        pk3.FixSID();

        pk3.PassHeldItem(pk2.HeldItem, pk2.Context, pk2.Version);

        pk3.FixMetLocation([GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD]);

        if (pk2.Species is 151 or 251)
        {
            pk3.FatefulEncounter = true;
        }
        else if (pk2.IsNicknamedBank())
        {
            pk3.IsNicknamed = true;
            pk3.Nickname = pk2.Korean ? pk2.Nickname : StringConverter12Transporter.GetString(pk2.NicknameTrash, pk2.Japanese);
        }

        Span<int> ivs = [
            ConvertIVG2ToG3(pk2.IV_HP),
            ConvertIVG2ToG3(pk2.IV_ATK),
            ConvertIVG2ToG3(pk2.IV_DEF),
            ConvertIVG2ToG3(pk2.IV_SPE),
            ConvertIVG2ToG3(pk2.IV_SPA),
            ConvertIVG2ToG3(pk2.IV_SPD),
        ];
        pk3.SetIVs(ivs);

        Span<int> evs = [
            ConvertEVG2ToG3(pk2.EV_HP),
            ConvertEVG2ToG3(pk2.EV_ATK),
            ConvertEVG2ToG3(pk2.EV_DEF),
            ConvertEVG2ToG3(pk2.EV_SPE),
            ConvertEVG2ToG3(pk2.EV_SPA),
            ConvertEVG2ToG3(pk2.EV_SPD),
        ];
        var totalEvs = evs.ToArray().Sum();
        if (totalEvs > EffortValues.Max510)
        {
            for (var i = 0; i < evs.Length; i++)
            {
                evs[i] = (int)(evs[i] * ((decimal)EffortValues.Max510 / totalEvs));
            }
        }
        pk3.SetEVs(evs);

        pk3.FixPID(pk2.IsShiny, pk2.Form, pk2.Gender, pk3.Nature);

        pk3.PassMoves(pk2);

        return pk3;
    }

    private static string GetTransferTrainerName(this PK2 pk2, int lang)
    {
        if (pk2.OriginalTrainerTrash[0] == StringConverter1.TradeOTCode) // In-game Trade
            return StringConverter12Transporter.GetTradeNameGen1(lang);
        if (pk2.Korean)
            return pk2.OriginalTrainerName;
        return StringConverter12Transporter.GetString(pk2.OriginalTrainerTrash, pk2.Japanese);
    }

    private static bool GetIsNicknamedLength(this PK2 pk2, int language)
    {
        // Verify that only the displayed nickname bytes match the expected nickname.
        var current = pk2.NicknameTrash;
        Span<byte> expect = stackalloc byte[current.Length];
        int length = pk2.GetNonNickname(language, expect);
        return !current[..length].SequenceEqual(expect[..length]);
    }

    public static bool IsNicknamedBank(this PK2 pk2) => pk2.GetIsNicknamedLength(pk2.GuessedLanguage());

    public static int GuessedLanguage(this PK2 pk2, int fallback = (int)LanguageID.English)
    {
        int lang = pk2.Language;
        if (lang > 0)
            return lang;
        if (fallback is (int)LanguageID.French or (int)LanguageID.German or (int)LanguageID.Italian or (int)LanguageID.Spanish) // only other permitted besides English
            return fallback;
        return (int)LanguageID.English;
    }

    public static int GetNonNickname(this PK2 pk2, int language, Span<byte> data)
    {
        var name = SpeciesName.GetSpeciesNameGeneration(pk2.Species, language, pk2.Format);
        int length = pk2.SetString(data, name, data.Length, StringConverterOption.Clear50);
        if (!pk2.Korean) // Decimal point<->period fix
            data.Replace<byte>(0xF2, 0xE8);
        return length;
    }

    private static int ConvertEVG2ToG3(float evValue)
    {
        return (int)(evValue / ushort.MaxValue * EffortValues.Max255);
    }

    private static int ConvertIVG2ToG3(int ivValue)
    {
        return ivValue * 2 + (ivValue % 2);
    }
}
