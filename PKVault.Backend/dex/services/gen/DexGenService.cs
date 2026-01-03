using PKHeX.Core;

public abstract class DexGenService(SaveFile save) //where Save : SaveFile
{
    // protected readonly SaveFile save = _save;

    public virtual bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData)
    {
        // var logtime = LogUtil.Time($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");

        var pkmBySpecies = new Dictionary<ushort, List<PKM>>();

        save.GetAllPKM().ForEach(pkm =>
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

            // tasks.Add(Task.Run(async () =>
            // {
            //     var pkmDtos = await saveLoader.Pkms.GetDtos(i);
            // }));
        }

        // await Task.WhenAll(tasks);

        // logtime();

        return true;
    }

    private DexItemDTO CreateDexItem(ushort species, List<PKM> pkmList, StaticDataDTO staticData)
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
                    if (pkm.Gender != (byte)gender)
                    {
                        return false;
                    }

                    return BasePkmVersionDTO.GetForm(pkm) == form;
                });

                var itemForm = GetDexItemFormComplete(species, ownedPkms, form, gender);
                forms.Add(itemForm);
            });
        }

        return new DexItemDTO
        {
            Id = GetDexItemID(species),
            Species = species,
            SaveId = save.ID32,
            Forms = forms,
        };
    }

    protected string GetDexItemID(ushort species) => $"{species}_{save.ID32}";

    public DexItemForm GetDexItemFormComplete(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var itemForm = GetDexItemForm(species, ownedPkms, form, gender);
        itemForm.Context = save.Context;
        itemForm.Generation = save.Generation;
        itemForm.Types = [.. itemForm.Types.Distinct().Select(type => (byte)(type + 1))];
        return itemForm;
    }

    protected abstract DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender);

    public abstract void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught);
}
