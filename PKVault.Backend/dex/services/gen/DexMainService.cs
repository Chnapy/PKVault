using PKHeX.Core;

public class DexMainService(
    IServiceProvider sp
) : DexGenService(FakeSaveFile.Default)
{
    public override async Task<bool> UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData)
    {
        using var scope = sp.CreateScope();

        var dexService = scope.ServiceProvider.GetRequiredService<DexService>();
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();
        var dexLoader = scope.ServiceProvider.GetRequiredService<IDexLoader>();

        var ownedPkmsBySpecies = (await pkmVersionLoader.GetAllDtos())
            .GroupBy(dto => dto.Species)
            .ToDictionary(dtos => dtos.First().Species, dtos => dtos.ToList());

        Dictionary<GameVersion, SaveWrapper> savesByVersion = [];

        (await dexLoader.GetAllEntities()).Values.ToList().ForEach(entity =>
        {
            ownedPkmsBySpecies.TryGetValue(entity.Species, out var pkmForms);

            var item = new DexItemDTO(
                Id: GetDexItemID(entity.Species),
                Species: entity.Species,
                SaveId: FakeSaveFile.Default.ID32,
                Forms: [.. entity.Forms.Select(form =>
                {
                    var pkmFormsFiltered = pkmForms?.FindAll(f => f.Form == form.Form
                        && f.Gender == form.Gender
                    ) ?? [];

                    var saveVersion = StaticDataService.GetSingleVersion(form.Version);
                    if (!savesByVersion.TryGetValue(saveVersion, out var save))
                    {
                        save = new(saveVersion == default
                            ? new SAV9ZA()
                            : BlankSaveFile.Get(saveVersion));
                        savesByVersion.Add(saveVersion, save);
                    }

                    var saveDexService = dexService.GetDexService(save);
                    var commonForm = saveDexService!.GetDexItemFormComplete(
                        entity.Species,
                        [.. pkmFormsFiltered.Select(pkmVersion => pkmVersion.Pkm)],
                        form.Form,
                        form.Gender
                    );

                    return new DexItemForm(
                        Form: form.Form,
                        Context: commonForm.Context,
                        Generation: commonForm.Generation,
                        Gender: form.Gender,
                        Types: commonForm.Types,
                        Abilities: commonForm.Abilities,
                        BaseStats: commonForm.BaseStats,
                        IsSeen: form.IsCaught,
                        IsSeenShiny: form.IsCaughtShiny,
                        IsCaught: form.IsCaught,
                        IsOwned: commonForm.IsOwned,
                        IsOwnedShiny: commonForm.IsOwnedShiny
                    );
                })]
            );

            if (!dex.TryGetValue(entity.Species, out var arr))
            {
                arr = [];
                dex.Add(entity.Species, arr);
            }
            arr[FakeSaveFile.Default.ID32] = item;
        });

        return true;
    }

    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender) => throw new NotImplementedException($"Should not be used");

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        await EnableSpeciesForm(
            default,
            species, form, gender, isCaught, false,
            createOnly: false
        );
    }

    public async Task EnablePKM(ImmutablePKM pk, SaveWrapper? save = null, bool createOnly = false)
    {
        var version = save?.Version ?? pk.Version;

        await EnableSpeciesForm(
            version,
            pk.Species, pk.Form, pk.Gender, true, pk.IsShiny,
            createOnly
        );
    }

    private async Task EnableSpeciesForm(
        GameVersion version,
        ushort species, byte form, Gender gender,
        bool isCaught, bool isCaughtShiny,
        bool createOnly
    )
    {
        using var scope = sp.CreateScope();
        var dexLoader = scope.ServiceProvider.GetRequiredService<IDexLoader>();

        var existingEntity = await dexLoader.GetEntity(species.ToString());
        var entity = existingEntity ?? new()
        {
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
            entityForm = new(
                Form: form,
                Version: default,
                Gender: gender,
                IsCaught: false,
                IsCaughtShiny: false
            );
            entity.Forms.Add(entityForm);
        }

        if (version != default)
        {
            entityForm = entityForm with { Version = version };
        }

        if (isCaught)
            entityForm = entityForm with { IsCaught = true };

        if (isCaughtShiny)
            entityForm = entityForm with { IsCaughtShiny = true };

        // write if caught only
        if (!entityForm.IsCaught)
        {
            return;
        }

        if (existingEntity != null)
        {
            await dexLoader.UpdateEntity(entity);
        }
        else
        {
            await dexLoader.AddEntity(entity);
        }
    }
}
