using PKHeX.Core;

public abstract class DexGenService(SaveFile save) //where Save : SaveFile
{
    public virtual bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData)
    {
        // var logtime = LogUtil.Time($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");

        var pkmBySpecies = new Dictionary<ushort, List<ImmutablePKM>>();

        save.GetAllPKM()
            .Select(pkm => new ImmutablePKM(pkm)).ToList()
            .ForEach(pkm =>
            {
                if (pkm.IsEgg)
                {
                    return;
                }

                pkmBySpecies.TryGetValue(pkm.Species, out var pkmList);
                if (pkmList == null)
                {
                    pkmList ??= [];
                    pkmBySpecies.TryAdd(pkm.Species, pkmList);
                }
                pkmList.Add(pkm);
            });

        // var pkmLoader = StorageService.memoryLoader.loaders.pkmLoader;
        // var saveLoader = StorageService.memoryLoader.loaders.saveLoadersDict[save.ID32];

        // List<Task> tasks = [];

        for (ushort species = 1; species < save.MaxSpeciesID + 1; species++)
        {
            pkmBySpecies.TryGetValue(species, out var pkmList);
            var item = CreateDexItem(species, pkmList ?? [], staticData);
            if (!dex.TryGetValue(species, out var arr))
            {
                arr = [];
                dex.Add(species, arr);
            }
            arr[save.ID32] = item;
        }

        // logtime();

        return true;
    }

    private DexItemDTO CreateDexItem(ushort species, List<ImmutablePKM> pkmList, StaticDataDTO staticData)
    {
        var forms = new List<DexItemForm>();

        // if (species == 201)
        // {
        //     Console.WriteLine($"FOOOOOOOOOO {pi.FormCount} {save.ID32} {save.Generation} {foo.Length}");
        // }
        // var strings = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage());
        // var formList = FormConverter.GetFormList(species, strings.types, strings.forms, GameInfo.GenderSymbolUnicode, save.Context);

        var staticSpecies = staticData.Species[species];
        var staticForms = staticSpecies.Forms[save.Generation];

        for (byte form = 0; form < staticForms.Length; form++)
        {
            var pi = save.Personal.GetFormEntry(species, form);

            List<Gender> getGenders()
            {
                if (pi.OnlyMale)
                {
                    return [Gender.Male];
                }

                if (pi.OnlyFemale)
                {
                    return [Gender.Female];
                }

                if (pi.Genderless)
                {
                    return [Gender.Genderless];
                }

                return [Gender.Male, Gender.Female];
            }

            getGenders().ForEach(gender =>
            {
                var ownedPkms = pkmList.FindAll(pkm =>
                {
                    if (pkm.Gender != gender)
                    {
                        return false;
                    }

                    return pkm.Form == form;
                });

                var itemForm = GetDexItemFormComplete(species, ownedPkms, form, gender);
                forms.Add(itemForm);
            });
        }

        return new DexItemDTO(
            Id: GetDexItemID(species),
            Species: species,
            SaveId: save.ID32,
            Forms: forms
        );
    }

    protected string GetDexItemID(ushort species) => $"{species}_{save.ID32}";

    public List<byte> GetTypes(PersonalInfo pi) => GetTypes(save.Generation, pi);

    public static List<byte> GetTypes(byte generation, PersonalInfo pi)
    {
        byte[] types = [
            generation <= 2 ? GetG12Type(pi.Type1) : pi.Type1,
            generation <= 2 ? GetG12Type(pi.Type2) : pi.Type2
        ];

        return [.. types.Distinct().Select(type => (byte)(type + 1))];
    }

    private static byte GetG12Type(byte type)
    {
        return type switch
        {
            7 => 6,
            8 => 7,
            9 => 8,
            20 => 9,
            21 => 10,
            22 => 11,
            23 => 12,
            24 => 13,
            25 => 14,
            26 => 15,
            27 => 16,
            _ => type,
        };
    }

    protected int[] GetAbilities(PersonalInfo pi)
    {
        Span<int> abilities = stackalloc int[pi.AbilityCount];
        pi.GetAbilities(abilities);
        return [.. abilities.ToArray().Distinct()];
    }

    protected int[] GetBaseStats(PersonalInfo pi)
    {
        return [
            pi.GetBaseStatValue(0),
            pi.GetBaseStatValue(1),
            pi.GetBaseStatValue(2),
            pi.GetBaseStatValue(4),
            pi.GetBaseStatValue(5),
            pi.GetBaseStatValue(3),
        ];
    }

    public DexItemForm GetDexItemFormComplete(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        return GetDexItemForm(species, ownedPkms, form, gender) with
        {
            Context = save.Context,
            Generation = save.Generation
        };
    }

    protected abstract DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender);

    public abstract void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught);
}
