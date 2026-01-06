using PKHeX.Core;

public class DexMainService(DataEntityLoaders loaders) : DexGenService(FakeSaveFile.Default)
{
    public override bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData)
    {
        var ownedPkmsBySpecies = loaders.pkmVersionLoader.GetAllDtos()
            .GroupBy(dto => dto.Species)
            .ToDictionary(dtos => dtos.First().Species, dtos => dtos.ToList());

        loaders.dexLoader.GetAllEntities().Values.ToList().ForEach(entity =>
        {
            ownedPkmsBySpecies.TryGetValue(entity.Species, out var pkmForms);

            var item = new DexItemDTO()
            {
                Id = GetDexItemID(entity.Species),
                Species = entity.Species,
                SaveId = FakeSaveFile.Default.ID32,
                Forms = [.. entity.Forms.Select(form =>
                {
                    var pkmFormsFiltered = pkmForms?.FindAll(f => f.Form == form.Form
                        && f.Gender == form.Gender
                    ) ?? [];

                    var saveVersion = PkmVersionDTO.GetSingleVersion(form.Version);
                    var save = saveVersion == default
                        ? new SAV9ZA()
                        : BlankSaveFile.Get(saveVersion);

                    var saveDexService = DexService.GetDexService(save, loaders);
                    var commonForm = saveDexService!.GetDexItemFormComplete(
                        entity.Species,
                        [.. pkmFormsFiltered.Select(pkmVersion => pkmVersion.Pkm)],
                        form.Form,
                        form.Gender
                    );

                    return new DexItemForm()
                    {
                        Form = form.Form,
                        Context = commonForm.Context,
                        Generation = commonForm.Generation,
                        Gender = form.Gender,
                        Types = commonForm.Types,
                        Abilities = commonForm.Abilities,
                        BaseStats = commonForm.BaseStats,
                        IsSeen = form.IsCaught,
                        IsSeenShiny = form.IsCaughtShiny,
                        IsCaught = form.IsCaught,
                        IsOwned = commonForm.IsOwned,
                        IsOwnedShiny = commonForm.IsOwnedShiny,
                    };
                })]
            };

            if (!dex.TryGetValue(entity.Species, out var arr))
            {
                arr = [];
                dex.Add(entity.Species, arr);
            }
            arr[FakeSaveFile.Default.ID32] = item;
        });

        return true;
    }

    protected override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender) => throw new NotImplementedException($"Should not be used");

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        EnableSpeciesForm(
            default,
            species, form, gender, isCaught, false,
            createOnly: false
        );
    }

    public void EnablePKM(PKM pk, SaveFile? save = null, bool createOnly = false)
    {
        var version = save?.Version ?? pk.Version;

        EnableSpeciesForm(
            version,
            pk.Species, pk.Form, (Gender)pk.Gender, true, pk.IsShiny,
            createOnly
        );
    }

    private void EnableSpeciesForm(
        GameVersion version,
        ushort species, byte form, Gender gender,
        bool isCaught, bool isCaughtShiny,
        bool createOnly
    )
    {
        DexEntity entity = loaders.dexLoader.GetEntity(species.ToString()) ?? new()
        {
            SchemaVersion = loaders.dexLoader.GetLastSchemaVersion(),
            Id = species.ToString(),
            Species = species,
            Forms = []
        };

        var entityForm = entity?.Forms.Find(f => f.Form == form && f.Gender == gender);

        if (createOnly && entityForm != null)
        {
            return;
        }

        if (entityForm == null)
        {
            entityForm = new()
            {
                Form = form,
                Version = default,
                Gender = gender,
                IsCaught = false,
                IsCaughtShiny = false,
            };
            entity.Forms.Add(entityForm);
        }

        if (version != default)
        {
            entityForm.Version = version;
        }

        if (isCaught)
            entityForm.IsCaught = true;

        if (isCaughtShiny)
            entityForm.IsCaughtShiny = true;

        // write if caught only
        if (!entityForm.IsCaught)
        {
            return;
        }

        loaders.dexLoader.WriteEntity(entity);
    }
}
