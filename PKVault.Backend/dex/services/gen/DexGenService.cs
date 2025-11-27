using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, Save save, StaticDataDTO staticData)
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
            var item = CreateDexItem(species, save, pkmList ?? [], staticData);
            dex[species][save.ID32] = item;

            // tasks.Add(Task.Run(async () =>
            // {
            //     var pkmDtos = await saveLoader.Pkms.GetDtos(i);
            // }));
        }

        // await Task.WhenAll(tasks);

        // logtime();

        return true;
    }

    private DexItemDTO CreateDexItem(ushort species, Save save, List<PKM> pkmList, StaticDataDTO staticData)
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

                var itemForm = GetDexItemForm(species, save, ownedPkms, form, gender);
                // itemForm.FormName = formList[form];
                itemForm.Context = save.Context;
                itemForm.Generation = save.Generation;
                itemForm.Types = [.. itemForm.Types.Distinct().Select(type => (byte)(type + 1))];
                forms.Add(itemForm);
            });
        }

        return new DexItemDTO
        {
            Id = $"{species}_{save.ID32}",
            Species = species,
            SaveId = save.ID32,
            Forms = forms,
        };
    }

    protected abstract DexItemForm GetDexItemForm(ushort species, Save save, List<PKM> pkmList, byte form, Gender gender);
}
