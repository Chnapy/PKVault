
using PKHeX.Core;

public class PkmConvertService
{
    public static PKM GetConvertedPkm(PKM sourcePkm, PkmEntity pkmEntity, uint generation, uint? intermediatePid)
    {
        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;

        PKM? blankPkm = generation switch
        {
            1 => new PK1(),
            2 => new PK2(),
            3 => new PK3(),
            4 => new PK4(),
            5 => new PK5(),
            7 => new PK7(),
            _ => default
        };
        if (blankPkm == default)
        {
            throw new Exception($"PKM case not found for generation={generation}");
        }

        if (!EntityConverter.IsCompatibleWithModifications(sourcePkm, blankPkm))
        {
            throw new Exception($"PKM conversion not possible, origin PKM not compatible with generation={generation}");
        }

        // if (target.Generation != generation)
        // {
        //     throw new Exception($"2.PKM target generation inconsistency, expected generation={generation} pkm.generation={target.Generation}");
        // }

        var intermediatePkm = GetIntermediatePkmConvert(sourcePkm, pkmEntity, generation, intermediatePid);

        // if (pkmOrigin.Generation <= 2 && generation > 2)
        // {
        //     pkmIntermediate = EntityConverter.ConvertToType(pkmOrigin, new PK3().GetType(), out var intermediateResult);
        //     Console.WriteLine($"Convert-intermediate result={intermediateResult}");
        // }

        var converted = EntityConverter.TryMakePKMCompatible(
            intermediatePkm,
            blankPkm,
            out var result,
            out var destPkm
        );

        if (destPkm.Species != sourcePkm.Species)
        {
            throw new Exception($"PKM converted broken, species={destPkm.Species} original.species={sourcePkm.Species}");
        }

        Console.WriteLine($"Convert result={result}");

        if (result == EntityConverterResult.None)
        {
            return destPkm;
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

        // pkmConverted.Language = (int)LanguageID.French;

        // destPkm.OriginalTrainerName = pkmEntity.OTName;
        // destPkm.IsNicknamed = sourcePkm.IsNicknamed;
        // destPkm.Nickname = pkmEntity.Nickname;

        // if (generation <= 2)
        // {
        //     StringConverter.SetString(
        //         destPkm.OriginalTrainerTrash,
        //         (ReadOnlySpan<char>)pkmEntity.OTName,
        //         destPkm.TrashCharCountTrainer,
        //         StringConverterOption.None,
        //         (byte)generation,
        //         false,
        //         false,
        //         (int)LanguageID.French
        //     );

        //     StringConverter.SetString(
        //         destPkm.NicknameTrash,
        //         (ReadOnlySpan<char>)pkmEntity.Nickname,
        //         destPkm.TrashCharCountNickname,
        //         StringConverterOption.None,
        //         (byte)generation,
        //         false,
        //         false,
        //         (int)LanguageID.French
        //     );
        // }

        // // if (pkmConverted.PID == 0)
        // // {
        // //     if (pkmOrigin.IsShiny)
        // //     {
        // //         CommonEdits.SetShiny(pkmConverted, Shiny.Random);
        // //     }
        // //     else
        // //     {
        // //         pkmConverted.SetPIDGender(pkmOrigin.Gender);
        // //     }
        // // }

        // // pkmConverted.SetTrainerData()
        // // pkmConverted.SetNickname(pkmOrigin.Nickname);
        // // pkmConverted.PersonalInfo.Write();
        // // var pk2 = (PK2)pkmConverted;
        // // pk2

        // // pkmOrigin.OriginalTrainerTrash
        // // .Slice(0, pkmConverted.OriginalTrainerTrash.Length)
        // // foobar
        // // .CopyTo(pkmConverted.OriginalTrainerTrash);
        // // pkmConverted.HandlingTrainerName = pkmOrigin.HandlingTrainerName;
        // // pkmConverted.OriginalTrainerGender = pkmOrigin.OriginalTrainerGender;

        // // Span<char> trainer2 = stackalloc char[pkmConverted.TrashCharCountTrainer];
        // // int len = pkmConverted.LoadString(pkmConverted.OriginalTrainerTrash, trainer2);
        // // if (len == 0)
        // // {
        // //     throw new Exception("OT NAME EMPTY 0/" + pkmConverted.TrashCharCountTrainer);
        // // }
        // // trainer2 = trainer2[..len];

        // // Span<char> trainer3 = stackalloc char[pkmConverted.TrashCharCountNickname];
        // // int len2 = pkmConverted.LoadString(pkmConverted.NicknameTrash, trainer3);
        // // if (len2 == 0)
        // // {
        // //     throw new Exception("NICKNAME EMPTY 0/" + pkmConverted.TrashCharCountNickname);
        // // }
        // // trainer3 = trainer3[..len2];

        // // pkmOrigin.NicknameTrash
        // // .Slice(0, pkmConverted.NicknameTrash.Length)
        // // .CopyTo(pkmConverted.NicknameTrash);

        // destPkm.MetDate = sourcePkm.MetDate;
        // // pkmConverted.MetLocation = pkmOrigin.MetLocation;
        // if (destPkm is PK2 pkmConvertedPK2)
        // {
        //     pkmConvertedPK2.MetTimeOfDay = EncounterSuggestion.GetSuggestedMetInfo(pkmConvertedPK2)?.GetSuggestedMetTimeOfDay() ?? 1;
        // }
        // pkmConverted.Language = pkmOrigin.Language;
        // if location is wrong only
        // pkmConverted.MetLevel = 1;

        PassStaticsToPkm(sourcePkm, destPkm, pkmEntity, generation);
        PassDynamicsToPkm(sourcePkm, destPkm, pkmEntity, generation);
        PassHeldItemToPkm(sourcePkm, destPkm);

        destPkm.RefreshChecksum();

        return destPkm;
    }

    private static PKM GetIntermediatePkmConvert(PKM sourcePkm, PkmEntity pkmEntity, uint generation, uint? intermediatePid)
    {
        // G1-2 to G3+
        if (sourcePkm.Generation <= 2 && generation > 2)
        {
            return GetIntermediateConvertG2ToG3(sourcePkm, pkmEntity, generation, intermediatePid);
        }

        return sourcePkm;
    }

    private static PKM GetIntermediateConvertG2ToG3(PKM sourcePkm, PkmEntity pkmEntity, uint generation, uint? intermediatePid)
    {
        var pkmIntermediate = EntityConverter.ConvertToType(sourcePkm, new PK3().GetType(), out var intermediateResult);
        Console.WriteLine($"Convert-intermediate result={intermediateResult}");

        if (pkmIntermediate == default)
        {
            throw new Exception($"Convert-intermediate failed, result={intermediateResult}");
        }

        // pkmIntermediate.Language = (int)LanguageID.French; //pkmOrigin.Language;
        // if (pkmIntermediate is IHandlerLanguage pkmIntermediateHLang)
        // {
        //     pkmIntermediateHLang.HandlingTrainerLanguage = (byte)LanguageID.French;
        // }

        // allow to keep same generated PID between memory => file loaders
        // because PID is randomly generated
        if (intermediatePid != null)
        {
            pkmIntermediate.PID = (uint)intermediatePid;
        }
        else
        {
            if (sourcePkm.IsShiny)
            {
                CommonEdits.SetShiny(pkmIntermediate, Shiny.Random);
            }
            else
            {
                pkmIntermediate.SetPIDGender(sourcePkm.Gender);
            }
        }

        // var convertIV = (int ivValue) => ivValue * 2 + (ivValue % 2);
        // Span<int> ivs = [
        //     convertIV(sourcePkm.IV_HP),
        //     convertIV(sourcePkm.IV_ATK),
        //     convertIV(sourcePkm.IV_DEF),
        //     convertIV(sourcePkm.IV_SPA),
        //     convertIV(sourcePkm.IV_SPD),
        //     convertIV(sourcePkm.IV_SPE),
        // ];
        // pkmIntermediate.SetIVs(ivs);

        // var convertEV = ConvertEVG2ToG3;
        // Span<int> evs = [
        //     convertEV(sourcePkm.EV_HP),
        //     convertEV(sourcePkm.EV_ATK),
        //     convertEV(sourcePkm.EV_DEF),
        //     convertEV(sourcePkm.EV_SPA),
        //     convertEV(sourcePkm.EV_SPD),
        //     convertEV(sourcePkm.EV_SPE),
        // ];
        // pkmIntermediate.SetEVs(evs);

        // pkmIntermediate.Origin
        // pkmIntermediate.Version = GameVersion.E;
        // pkmIntermediate.FatefulEncounter = false;
        // pkmIntermediate.MetLocation = 0;
        // pkmIntermediate.MetLevel = 0;
        // pkmIntermediate.Ball = (byte)Ball.Poke; //pkmOrigin.Ball;

        PassStaticsToPkm(sourcePkm, pkmIntermediate, pkmEntity, generation);
        PassDynamicsToPkm(sourcePkm, pkmIntermediate, pkmEntity, generation);
        PassHeldItemToPkm(sourcePkm, pkmIntermediate);

        pkmIntermediate.RefreshChecksum();

        Console.WriteLine($"[convert] pkm-intermediate G3, PID={pkmIntermediate.PID} Gender={pkmIntermediate.Gender} IsShiny={pkmIntermediate.IsShiny} Language={pkmIntermediate.Language} ");
        Console.WriteLine($"\tVersion={pkmIntermediate.Version} MetLocation={pkmIntermediate.MetLocation} MetLevel={pkmIntermediate.MetLevel} Ball={pkmIntermediate.Ball} FatefulEncounter={pkmIntermediate.FatefulEncounter}");

        return pkmIntermediate;
    }

    private static void PassStaticsToPkm(PKM sourcePkm, PKM destPkm, PkmEntity pkmEntity, uint generation)
    {
        destPkm.Language = (int)LanguageID.French; //pkmOrigin.Language;
        if (destPkm is IHandlerLanguage pkmIntermediateHLang)
        {
            pkmIntermediateHLang.HandlingTrainerLanguage = (byte)LanguageID.French;
        }

        destPkm.OriginalTrainerName = pkmEntity.OTName;

        Func<int, int> convertIVFn = (int value) => value;
        if (sourcePkm.Generation <= 2 && generation > 2)
        {
            convertIVFn = ConvertIVG2ToG3;
        }
        else if (generation <= 2 && sourcePkm.Generation > 2)
        {
            convertIVFn = ConvertIVG3ToG2;
        }

        Span<int> ivs = [
            convertIVFn(sourcePkm.IV_HP),
            convertIVFn(sourcePkm.IV_ATK),
            convertIVFn(sourcePkm.IV_DEF),
            convertIVFn(sourcePkm.IV_SPE),
            convertIVFn(sourcePkm.IV_SPA),
            convertIVFn(sourcePkm.IV_SPD),
        ];
        destPkm.SetIVs(ivs);

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

        destPkm.MetDate = sourcePkm.MetDate;
        // pkmConverted.MetLocation = pkmOrigin.MetLocation;

        if (generation == 3)
        {
            // pkmIntermediate.Origin
            destPkm.Version = GameVersion.E;
            destPkm.FatefulEncounter = false;
            destPkm.MetLocation = 0;
            destPkm.MetLevel = 0;
            destPkm.Ball = (byte)Ball.Poke; //pkmOrigin.Ball;
        }
        else if (generation <= 2)
        {
            StringConverter.SetString(
                destPkm.OriginalTrainerTrash,
                (ReadOnlySpan<char>)pkmEntity.OTName,
                destPkm.TrashCharCountTrainer,
                StringConverterOption.None,
                (byte)generation,
                false,
                false,
                (int)LanguageID.French
            );

            destPkm.MetLocation = 0;
            destPkm.MetLevel = 0;

            if (destPkm is PK2 destPkmG2)
            {
                destPkmG2.MetTimeOfDay = 0;
            }
        }
    }

    public static void PassDynamicsToPkm(PKM sourcePkm, PKM destPkm, PkmEntity pkmEntity, uint generation)
    {
        ApplyNicknameToPkm(destPkm, generation, pkmEntity.Nickname);

        destPkm.CurrentLevel = sourcePkm.CurrentLevel;
        destPkm.EXP = sourcePkm.EXP;

        Func<float, int> convertEVFn = (float value) => (int)value;
        if (sourcePkm.Generation <= 2 && generation > 2)
        {
            convertEVFn = ConvertEVG2ToG3;
        }
        else if (generation <= 2 && sourcePkm.Generation > 2)
        {
            convertEVFn = ConvertEVG3ToG2;
        }

        Span<int> evs = [
            convertEVFn(sourcePkm.EV_HP),
            convertEVFn(sourcePkm.EV_ATK),
            convertEVFn(sourcePkm.EV_DEF),
            convertEVFn(sourcePkm.EV_SPE),
            convertEVFn(sourcePkm.EV_SPA),
            convertEVFn(sourcePkm.EV_SPD),
        ];

        ApplyEVsToPkm(destPkm, evs);
    }

    public static void PassHeldItemToPkm(PKM sourcePkm, PKM destPkm)
    {
        // if (sourcePkm.HeldItem == 0)
        // {
        //     return;
        // }

        // int GetHeldItem()
        // {
        //     var item = ItemConverter.GetItemForFormat(sourcePkm.HeldItem, sourcePkm.Context, destPkm.Context);
        //     if (item > 0)
        //     {
        //         return item;
        //     }

        //     var originSrc = GameInfo.Sources.GetItemDataSource(sourcePkm.Version, sourcePkm.Context, [], true)
        //     .Find(item => item.Value == sourcePkm.HeldItem);
        //     if (originSrc == default)
        //     {
        //         return 0;
        //     }

        //     var intermediateSrc = GameInfo.Sources.GetItemDataSource(destPkm.Version, destPkm.Context, [], true)
        //     .Find(item => item.Text == originSrc.Text);
        //     if (intermediateSrc == default)
        //     {
        //         return 0;
        //     }

        //     return intermediateSrc.Value;
        // }

        // var heldItem = GetHeldItem();

        // var stringsFr = GameInfo.GetStrings("fr");
        // var txtExists = stringsFr.GetItemStrings(destPkm.Context, destPkm.Version).Length > heldItem;

        destPkm.ApplyHeldItem(sourcePkm.HeldItem, sourcePkm.Context);

        // destPkm.HeldItem = txtExists ? heldItem : 0;

        Console.WriteLine($"HELD-ITEM = {destPkm.HeldItem}");
    }

    public static void ApplyNicknameToPkm(PKM pkm, uint generation, string nickname)
    {
        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            nickname = nickname[..pkm.MaxStringLengthNickname];
        }

        pkm.IsNicknamed = SpeciesName.IsNicknamed(pkm.Species, nickname, pkm.Language, (byte)generation);
        pkm.Nickname = nickname;

        if (generation <= 2)
        {
            // TODO nickname update not working for G2
            StringConverter.SetString(
                pkm.NicknameTrash,
                (ReadOnlySpan<char>)nickname,
                pkm.TrashCharCountNickname,
                StringConverterOption.None,
                (byte)generation,
                false,
                false,
                (int)LanguageID.French
            );
        }

        Console.WriteLine($"NICKNAME: {pkm.Nickname}");
    }

    public static void ApplyEVsToPkm(PKM pkm, Span<int> evs)
    {
        pkm.SetEVs(evs);
    }

    public static void ApplyMovesToPkm(PKM pkm, Span<ushort> moves)
    {
        pkm.SetMoves(moves);
    }

    private static int ConvertEVG2ToG3(float evValue)
    {
        return (int)(evValue / 65535 * 255);
    }

    private static int ConvertEVG3ToG2(float evValue)
    {
        return (int)(evValue * 65535 / 255);
    }

    private static int ConvertIVG2ToG3(int ivValue)
    {
        return ivValue * 2 + (ivValue % 2);
    }

    private static int ConvertIVG3ToG2(int ivValue)
    {
        return ivValue / 2;
    }
}
