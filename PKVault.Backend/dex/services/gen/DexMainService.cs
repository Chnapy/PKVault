using PKHeX.Core;

public class DexMainService(
    IServiceProvider sp
) : DexGenService(FakeSaveFile.Default)
{
    public override async Task<bool> UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticSpeciesData staticSpecies, HashSet<ushort>? speciesSet)
    {
        using var _ = LogUtil.Time($"DexMainService.UpdateDexWithSave");

        using var scope = sp.CreateScope();

        var dexService = scope.ServiceProvider.GetRequiredService<DexService>();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();
        var dexLoader = scope.ServiceProvider.GetRequiredService<IDexLoader>();

        Dictionary<EntityContext, SaveWrapper> savesByContext = [];

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
                    var isOwnedShiny = isOwned && form.Context.Generation > 1 && await pkmVariantLoader.HasEntityByFormShiny(species, form.Form, form.Gender);
                    var isOwnedAlpha = isOwned && form.Context.Generation > 7 && await pkmVariantLoader.HasEntityByFormAlpha(species, form.Form, form.Gender);

                    if (!savesByContext.TryGetValue(form.Context, out var save))
                    {
                        save = new(form.Context == default
                            ? new SAV9ZA()
                            : BlankSaveFile.Get(form.Context));
                        savesByContext.Add(form.Context, save);
                    }

                    var saveDexService = dexService.GetDexService(save);
                    var commonForm = saveDexService!.GetDexItemFormComplete(
                        species,
                        isOwned,
                        isOwnedShiny,
                        isOwnedAlpha,
                        form.Form,
                        form.Gender
                    );

                    return dexLoader.CreateDTO(form, commonForm);
                }))],
                Languages: [.. forms.SelectMany(form => form.Languages).Distinct().Order()]
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

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species) => [];

    // Not used !
    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        await EnableSpeciesForm(
            default,
            default,
            payload.Species, payload.Form, payload.Gender, payload.IsCaught, false, false, payload.Languages,
            createOnly: false
        );
    }

    public async Task EnablePKM(ImmutablePKM pk, SaveWrapper? save = null, bool createOnly = false)
    {
        var context = save?.Context ?? pk.Context;
        var version = save?.Version ?? pk.Version;

        await EnableSpeciesForm(
            context,
            version,
            pk.Species, pk.Form, pk.Gender,
            true, pk.IsShiny, pk.IsAlpha,
            [pk.LanguageID],
            createOnly
        );
    }

    public async Task EnableSpeciesForm(
        EntityContext context,
        GameVersion version,
        ushort species, byte form, Gender gender,
        bool isCaught, bool isCaughtShiny, bool isCaughtAlpha, LanguageID[] languages,
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
            Context = default,
            Version = default,
            Gender = gender,
            IsCaught = false,
            IsCaughtShiny = false,
            IsCaughtAlpha = false,
            Languages = []
        };

        if (context != default)
        {
            entity.Context = context;
        }

        if (version != default)
        {
            entity.Version = version;
        }

        if (isCaught)
            entity.IsCaught = true;

        if (isCaughtShiny)
            entity.IsCaughtShiny = true;

        if (isCaughtAlpha)
            entity.IsCaughtAlpha = true;

        // write if caught only
        if (!entity.IsCaught)
        {
            return;
        }

        foreach (var lang in languages)
        {
            if (!entity.Languages.Contains(lang))
            {
                entity.Languages.Add(lang);
            }
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
