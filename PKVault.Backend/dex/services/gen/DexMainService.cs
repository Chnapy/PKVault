using PKHeX.Core;

public class DexMainService(
    IServiceProvider sp
) : DexGenService(FakeSaveFile.Default)
{
    public override async Task<bool> UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData, HashSet<ushort>? speciesSet)
    {
        using var _ = LogUtil.Time($"DexMainService.UpdateDexWithSave");

        using var scope = sp.CreateScope();

        var dexService = scope.ServiceProvider.GetRequiredService<DexService>();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();
        var dexLoader = scope.ServiceProvider.GetRequiredService<IDexLoader>();

        Dictionary<GameVersion, SaveWrapper> savesByVersion = [];

        var formsBySpecies = speciesSet == null
            ? await dexLoader.GetEntitiesBySpecies()
            : await dexLoader.GetEntitiesBySpecies(speciesSet);

        for (ushort species = 1; species < (ushort)Species.MAX_COUNT; species++)
        {
            if (!formsBySpecies.TryGetValue(species, out var forms))
            {
                continue;
            }

            var item = new DexItemDTO(
                Id: GetDexItemID(species),
                Species: species,
                SaveId: FakeSaveFile.Default.ID32,
                Forms: [.. await Task.WhenAll(forms.Select(async form =>
                {
                    var isOwned = await pkmVariantLoader.HasEntityByForm(species, form.Form, form.Gender);
                    var isOwnedShiny = isOwned && await pkmVariantLoader.HasEntityByFormShiny(species, form.Form, form.Gender);

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
                        species,
                        isOwned,
                        isOwnedShiny,
                        form.Form,
                        form.Gender
                    );

                    return dexLoader.CreateDTO(form, commonForm);
                }))]
            );

            if (!dex.TryGetValue(species, out var arr))
            {
                arr = [];
                dex.Add(species, arr);
            }
            arr[FakeSaveFile.Default.ID32] = item;
        }

        return true;
    }

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
        => throw new NotImplementedException($"Should not be used");

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

        var id = DexLoader.GetId(species, form, gender);

        var entity = await dexLoader.GetEntity(id);
        var needCreate = entity == null;

        if (createOnly && !needCreate)
        {
            return;
        }

        entity ??= new()
        {
            Id = id,
            Species = species,
            Form = form,
            Version = default,
            Gender = gender,
            IsCaught = false,
            IsCaughtShiny = false
        };

        if (version != default)
        {
            entity.Version = version;
        }

        if (isCaught)
            entity.IsCaught = true;

        if (isCaughtShiny)
            entity.IsCaughtShiny = true;

        // write if caught only
        if (!entity.IsCaught)
        {
            return;
        }

        if (needCreate)
        {
            await dexLoader.AddEntity(entity);
        }
        else
        {
            await dexLoader.UpdateEntity(entity);
        }
    }
}
