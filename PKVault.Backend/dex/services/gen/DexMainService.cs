using PKHeX.Core;

public class DexMainService(DataEntityLoaders loaders) : DexGenService(FakeSaveFile.Default)
{
    private Dictionary<string, DexEntity> dexEntities = loaders.dexLoader.GetAllEntities();

    public override bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, StaticDataDTO staticData)
    {
        var ownedPkmsBySpecies = loaders.pkmVersionLoader.GetAllDtos()
            .GroupBy(dto => dto.Species)
            .ToDictionary(dtos => dtos.First().Species, dtos => dtos.ToList());

        dexEntities.Values.ToList().ForEach(entity =>
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

                    return new DexItemForm()
                    {
                        Form = form.Form,
                        Context = form.Context,
                        Generation = form.Generation,
                        Gender = form.Gender,
                        Types = form.Types,
                        Abilities = form.Abilities,
                        BaseStats = form.BaseStats,
                        IsSeen = form.IsCaught,
                        IsSeenShiny = form.IsCaughtShiny,
                        IsCaught = form.IsCaught,
                        IsOwned = pkmFormsFiltered.Count > 0,
                        IsOwnedShiny = pkmFormsFiltered.Any(f => f.IsShiny),
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

    public override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender) => throw new NotImplementedException($"Should not be used");

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        EnableSpeciesForm(
            default, default, default, default, default,
            species, form, gender, isCaught, false
        );
    }

    public void EnableSpeciesForm(
        EntityContext context, byte generation, List<byte>? types, int[]? abilities, int[]? baseStats,
        ushort species, byte form, Gender gender,
        bool isCaught, bool isCaughtShiny
    )
    {
        var entityFound = dexEntities.TryGetValue(species.ToString(), out var entity);
        var entityForm = entity?.Forms.Find(f => f.Form == form);

        if (!entityFound || entity == null)
        {
            entity = new()
            {
                Id = species.ToString(),
                Species = species,
                Forms = []
            };
        }

        if (entityForm == null)
        {
            entityForm = new()
            {
                Form = form,
                Context = default,
                Generation = default,
                Gender = gender,
                Types = [],
                Abilities = [],
                BaseStats = [],
                IsCaught = false,
                IsCaughtShiny = false,
            };
            entity.Forms.Add(entityForm);
        }
        Console.WriteLine($"UPDATE context={context} generation={generation}");
        if (context != default)
        {
            entityForm.Context = context;
            Console.WriteLine($"FOO");
        }

        if (generation != default)
        {
            entityForm.Generation = generation;
        }

        if (types != default)
        {
            entityForm.Types = types;
        }

        if (abilities != default)
        {
            entityForm.Abilities = abilities;
        }

        if (baseStats != default)
        {
            entityForm.BaseStats = baseStats;
        }

        if (isCaught)
            entityForm.IsCaught = true;

        if (isCaughtShiny)
            entityForm.IsCaughtShiny = true;

        loaders.dexLoader.WriteEntity(entity);
    }

    public void EnablePKM(PKM pk, SaveFile? save = null)
    {
        save ??= BlankSaveFile.Get(pk.Version);
        var saveDexService = DexService.GetDexService(save, loaders);

        var commonForm = saveDexService?.GetDexItemForm(pk.Species, [pk], pk.Form, (Gender)pk.Gender);

        EnableSpeciesForm(
            save.Context, save.Generation, commonForm?.Types ?? default, commonForm?.Abilities ?? default, commonForm?.BaseStats ?? default,
            pk.Species, pk.Form, (Gender)pk.Gender, true, pk.IsShiny
        );
    }
}
