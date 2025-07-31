
using PKHeX.Core;

public class MainCreatePkmVersionAction : DataAction
{
    private readonly string pkmId;
    private readonly uint generation;

    public MainCreatePkmVersionAction(string _pkmId, uint _generation)
    {
        pkmId = _pkmId;
        generation = _generation;
    }

    public override void Execute(DataEntityLoaders loaders)
    {
        var pkmEntity = loaders.pkmLoader.GetEntity(pkmId);
        if (pkmEntity == default)
        {
            throw new Exception($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = loaders.pkmVersionLoader.GetAllEntities().FindAll(pkmVersion => pkmVersion.PkmId == pkmId);

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new Exception($"Pkm-version already exists, pkm.id={pkmId} generation={generation}");
        }

        var pkmVersionOrigin = pkmVersions.Find(pkmVersion => pkmVersion.Id == pkmId);
        if (pkmVersionOrigin == default)
        {
            throw new Exception($"Pkm-version original not found, pkm.id={pkmId} generation={generation}");
        }

        var pkmOriginBytes = loaders.pkmFileLoader.GetEntity(pkmVersionOrigin);
        var pkmOrigin = PKMLoader.CreatePKM(pkmOriginBytes, pkmVersionOrigin, pkmEntity);

        PKM? target = generation switch
        {
            1 => new PK1(),
            2 => new PK2(),
            3 => new PK3(),
            4 => new PK4(),
            5 => new PK5(),
            _ => default
        };
        if (target == default)
        {
            throw new Exception($"PKM case not found for generation={generation}");
        }

        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;

        // if (target.Generation != generation)
        // {
        //     throw new Exception($"1.PKM target generation inconsistency, expected generation={generation} pkm.generation={target.Generation} {new PK2().Generation}");
        // }

        if (!EntityConverter.IsCompatibleWithModifications(pkmOrigin, target))
        {
            throw new Exception($"PKM conversion not possible, origin PKM not compatible with generation={generation}");
        }

        // if (target.Generation != generation)
        // {
        //     throw new Exception($"2.PKM target generation inconsistency, expected generation={generation} pkm.generation={target.Generation}");
        // }

        var converted = EntityConverter.TryMakePKMCompatible(
            pkmOrigin,
            target,
            out var result,
            out var pkmConverted
        );

        if (pkmConverted.Species != pkmOrigin.Species)
        {
            throw new Exception($"PKM converted broken, species={pkmConverted.Species} original.species={pkmOrigin.Species}");
        }

        // if (pkmConverted.Generation != generation)
        // {
        //     throw new Exception($"PKM converted generation inconsistency, expected generation={generation} pkm.generation={pkmConverted.Generation}");
        // }

        // Console.WriteLine($"OT TRASH length: origin={pkmOrigin.OriginalTrainerTrash.Length}/{pkmOrigin.TrashCharCountTrainer} converted={pkmConverted.OriginalTrainerTrash.Length}/{pkmConverted.TrashCharCountTrainer}");

        // Span<char> trainer = stackalloc char[pkmOrigin.TrashCharCountTrainer];
        // pkmOrigin.SetString(
        //     pkmOrigin.OriginalTrainerTrash,
        //     trainer[..pkmConverted.MaxStringLengthTrainer],
        //     pkmConverted.MaxStringLengthTrainer,
        //     StringConverterOption.None
        // );

        pkmConverted.OriginalTrainerName = pkmEntity.OTName;
        pkmConverted.IsNicknamed = pkmOrigin.IsNicknamed;
        pkmConverted.Nickname = pkmEntity.Nickname;

        if (generation <= 2)
        {
            StringConverter.SetString(
                pkmConverted.OriginalTrainerTrash,
                (ReadOnlySpan<char>)pkmEntity.OTName,
                pkmConverted.TrashCharCountTrainer,
                StringConverterOption.None,
                (byte)generation,
                false,
                false,
                pkmOrigin.Language
            );

            StringConverter.SetString(
                pkmConverted.NicknameTrash,
                (ReadOnlySpan<char>)pkmEntity.Nickname,
                pkmConverted.TrashCharCountNickname,
                StringConverterOption.None,
                (byte)generation,
                false,
                false,
                pkmOrigin.Language
            );

            DebugOT(pkmConverted);
        }

        // pkmConverted.SetTrainerData()
        // pkmConverted.SetNickname(pkmOrigin.Nickname);
        // pkmConverted.PersonalInfo.Write();
        // var pk2 = (PK2)pkmConverted;
        // pk2

        // pkmOrigin.OriginalTrainerTrash
        // .Slice(0, pkmConverted.OriginalTrainerTrash.Length)
        // foobar
        // .CopyTo(pkmConverted.OriginalTrainerTrash);
        // pkmConverted.HandlingTrainerName = pkmOrigin.HandlingTrainerName;
        // pkmConverted.OriginalTrainerGender = pkmOrigin.OriginalTrainerGender;

        // Span<char> trainer2 = stackalloc char[pkmConverted.TrashCharCountTrainer];
        // int len = pkmConverted.LoadString(pkmConverted.OriginalTrainerTrash, trainer2);
        // if (len == 0)
        // {
        //     throw new Exception("OT NAME EMPTY 0/" + pkmConverted.TrashCharCountTrainer);
        // }
        // trainer2 = trainer2[..len];

        // Span<char> trainer3 = stackalloc char[pkmConverted.TrashCharCountNickname];
        // int len2 = pkmConverted.LoadString(pkmConverted.NicknameTrash, trainer3);
        // if (len2 == 0)
        // {
        //     throw new Exception("NICKNAME EMPTY 0/" + pkmConverted.TrashCharCountNickname);
        // }
        // trainer3 = trainer3[..len2];

        // pkmOrigin.NicknameTrash
        // .Slice(0, pkmConverted.NicknameTrash.Length)
        // .CopyTo(pkmConverted.NicknameTrash);

        pkmConverted.MetDate = pkmOrigin.MetDate;
        pkmConverted.MetLocation = pkmOrigin.MetLocation;
        if (pkmConverted is PK2 pkmConvertedPK2)
        {
            pkmConvertedPK2.MetTimeOfDay = EncounterSuggestion.GetSuggestedMetInfo(pkmConvertedPK2)?.GetSuggestedMetTimeOfDay() ?? 1;
        }
        pkmConverted.Language = pkmOrigin.Language;
        // if location is wrong only
        pkmConverted.MetLevel = 1;

        pkmConverted.RefreshChecksum();

        // DebugOT(pkmConverted);

        Console.WriteLine($"CONVERT: OriginalTrainerName={pkmConverted.OriginalTrainerName} HandlingTrainerName={pkmConverted.HandlingTrainerName}");
        Console.WriteLine($" IsNicknamed={pkmConverted.IsNicknamed} Nickname={pkmConverted.Nickname} MetLocation={pkmConverted.MetLocation}");
        Console.WriteLine($" Language={pkmConverted.Language} LanguageCode={GameLanguage.LanguageCode(pkmConverted.Language)} RealLanguage={GameLanguage.GetLanguageIndex(GameLanguage.LanguageCode(pkmConverted.Language))}");
        Console.WriteLine($" Language={pkmOrigin.Language} LanguageCode={GameLanguage.LanguageCode(pkmOrigin.Language)} RealLanguage={GameLanguage.GetLanguageIndex(GameLanguage.LanguageCode(pkmOrigin.Language))}");

        var filepath = loaders.pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(pkmConverted), pkmConverted, generation, null);

        var pkmVersionCreated = new PkmVersionEntity
        {
            Id = PkmSaveDTO.GetPKMId(pkmConverted, generation),
            PkmId = pkmId,
            Generation = generation,
            Filepath = filepath,
        };

        loaders.pkmVersionLoader.WriteEntity(pkmVersionCreated);
    }

    public static void DebugOT(PKM pkm)
    {
        Span<char> trainer2 = stackalloc char[pkm.TrashCharCountTrainer];
        int len = pkm.LoadString(pkm.OriginalTrainerTrash, trainer2);
        trainer2 = trainer2[..len];

        Span<char> trainer3 = stackalloc char[pkm.TrashCharCountNickname];
        int len2 = pkm.LoadString(pkm.NicknameTrash, trainer3);
        trainer3 = trainer3[..len2];

        var msg = $"TEST species={pkm.Species} OTName={trainer2} Nickname={trainer3} OTName2={pkm.OriginalTrainerName}";

        Console.WriteLine(msg);
        if (len == 0 || len2 == 0)
        {
            throw new Exception(msg);
        }
    }
}
