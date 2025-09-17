
using PKHeX.Core;

public class StaticDataService
{
    public static async Task<Dictionary<int, StaticVersion>> GetStaticVersions()
    {
        List<Task<StaticVersion>> tasks = [];
        var staticVersions = new Dictionary<int, StaticVersion>();

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            tasks.Add(Task.Run(async () =>
            {
                var blankSave = version.GetContext() == EntityContext.None
                ? null
                : SaveUtil.GetBlankSAV(version.GetContext(), "");

                return new StaticVersion
                {
                    Id = version,
                    Name = await GetVersionName(version),
                    Generation = version.GetGeneration(),
                    MaxSpeciesId = blankSave?.MaxSpeciesID ?? 0,
                    MaxIV = blankSave?.MaxIV ?? 0,
                    MaxEV = blankSave?.MaxEV ?? 0,
                };
            }));
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticVersion>();
        foreach (var value in values)
        {
            dict.Add((int)value.Id, value);
        }
        return dict;
    }

    public static async Task<Dictionary<int, StaticSpecies>> GetStaticSpecies()
    {
        var speciesNames = PKHexUtils.StringsFR.Species;
        List<Task<StaticSpecies>> tasks = [];

        for (var i = 1; i <= 1025; i++)  // TODO
        {
            var species = i;
            var speciesName = speciesNames[species];

            // if (i == 0)
            // {
            //     tasks.Add(Task.Run(() => new StaticSpecies()
            //     {
            //         Id = species,
            //         Name = speciesName,
            //         SpriteDefault = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
            //         SpriteShiny = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
            //     }));
            // }
            // else
            // {
            tasks.Add(Task.Run(async () =>
            {
                var pkmObj = await PokeApi.GetPokemon(species);
                var pkmSpeciesObj = await PokeApi.GetPokemonSpecies(species);

                var generation = PokeApi.GetGenerationValue(pkmSpeciesObj.Generation.Name);

                GenderType[] genders = pkmSpeciesObj?.GenderRate switch
                {
                    -1 => [],
                    0 => [GenderType.MALE],
                    8 => [GenderType.FEMALE],
                    _ => [GenderType.MALE, GenderType.FEMALE],
                };

                return new StaticSpecies
                {
                    Id = species,
                    Name = speciesName,
                    Generation = generation,
                    Genders = genders,
                    SpriteDefault = pkmObj.Sprites.FrontDefault,
                    SpriteShiny = pkmObj.Sprites.FrontShiny,
                };
            }));
            // }
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticSpecies>();
        foreach (var value in values)
        {
            dict.Add(value.Id, value);
        }
        return dict;
    }

    public static async Task<Dictionary<int, StaticStat>> GetStaticStats()
    {
        List<Task<StaticStat>> tasks = [];

        for (var i = 1; i <= 6; i++)
        {
            var statIndex = i;
            tasks.Add(Task.Run(async () =>
            {
                var statObj = await PokeApi.GetStat(statIndex);

                return new StaticStat
                {
                    Id = statIndex,
                    Name = statObj.Names.Find(name => name.Language.Name == "fr").Name,
                };
            }));
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticStat>();
        foreach (var value in values)
        {
            dict.Add(value.Id, value);
        }
        return dict;
    }

    public static Dictionary<int, StaticType> GetStaticTypes()
    {
        var typeNames = PKHexUtils.StringsFR.Types;
        var dict = new Dictionary<int, StaticType>();

        for (var i = 0; i < typeNames.Count; i++)
        {
            var typeName = typeNames[i];
            var typeId = i + 1;
            dict.Add(typeId, new()
            {
                Id = typeId,
                Name = typeName,
            });
        }

        return dict;
    }

    public static async Task<Dictionary<int, StaticMove>> GetStaticMoves()
    {
        var moveNames = PKHexUtils.StringsFR.Move;
        List<Task<StaticMove>> tasks = [];

        for (var i = 0; i < 919; i++)  // TODO
        {
            var moveId = i;
            var moveName = moveNames[moveId];
            tasks.Add(Task.Run(async () =>
            {
                if (moveId == 0)
                {
                    return new StaticMove()
                    {
                        Id = moveId,
                        Name = moveName,
                        DataUntilGeneration = [new()
                        {
                            UntilGeneration = 99,
                            Type = 1,   // normal
                            Category = MoveCategory.STATUS,
                            Power = null,
                        }],
                    };
                }

                var moveObj = await PokeApi.GetMove(moveId);

                var type = PokeApi.GetIdFromUrl(moveObj.Type.Url);

                var category = GetMoveCategory(moveObj.DamageClass.Name);
                var oldCategory = category == MoveCategory.STATUS ? category : (
                    type < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL
                );

                List<StaticMoveGeneration> dataUntilGeneration = [.. await Task.WhenAll(
                    moveObj.PastValues.Select(async pastValue =>
                    {
                        var versionGroup = await PokeApi.GetVersionGroup(pastValue.VersionGroup);
                        var untilGeneration = PokeApi.GetGenerationValue(versionGroup.Generation.Name);

                        return new StaticMoveGeneration()
                        {
                            UntilGeneration = untilGeneration,
                            Type = PokeApi.GetIdFromUrl(pastValue.Type != null
                                ? pastValue.Type.Url
                                : moveObj.Type.Url),
                            Category = untilGeneration <= 3 ? oldCategory : category,
                            Power = pastValue.Power ?? moveObj.Power,
                        };
                    })
                )];

                dataUntilGeneration.Add(new()
                {
                    UntilGeneration = 99,
                    Type = PokeApi.GetIdFromUrl(moveObj.Type.Url),
                    Category = category,
                    Power = moveObj.Power,
                });

                if (oldCategory != category && !dataUntilGeneration.Any(data => data.UntilGeneration == 3))
                {
                    var dataPostG3 = dataUntilGeneration.Find(data => data.UntilGeneration > 3);
                    dataUntilGeneration.Add(new()
                    {
                        UntilGeneration = 3,
                        Type = dataPostG3.Type,
                        Category = oldCategory,
                        Power = dataPostG3.Power,
                    });
                }

                dataUntilGeneration.Sort((a, b) => a.UntilGeneration < b.UntilGeneration ? -1 : 1);

                return new StaticMove
                {
                    Id = moveId,
                    Name = moveName,
                    DataUntilGeneration = [.. dataUntilGeneration],
                };
            }));
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticMove>();
        foreach (var value in values)
        {
            dict.Add(value.Id, value);
        }
        return dict;
    }

    public static async Task<Dictionary<int, StaticNature>> GetStaticNatures()
    {
        var naturesNames = PKHexUtils.StringsFR.Natures;
        List<Task<StaticNature>> tasks = [];

        for (var i = 0; i < naturesNames.Count; i++)
        {
            var natureId = i;
            var natureName = naturesNames[natureId];
            tasks.Add(Task.Run(async () =>
            {
                var natureNameEn = GameInfo.Strings.natures[natureId];
                var natureObj = await PokeApi.GetNature(natureNameEn);

                return new StaticNature
                {
                    Id = natureId,
                    Name = natureName,
                    IncreasedStatIndex = natureObj.IncreasedStat != null
                        ? PokeApi.GetIdFromUrl(natureObj.IncreasedStat.Url)
                        : null,
                    DecreasedStatIndex = natureObj.DecreasedStat != null
                        ? PokeApi.GetIdFromUrl(natureObj.DecreasedStat.Url)
                        : null,
                };
            }));
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticNature>();
        foreach (var value in values)
        {
            dict.Add(value.Id, value);
        }
        return dict;
    }

    public static Dictionary<int, StaticAbility> GetStaticAbilities()
    {
        var abilitiesNames = PKHexUtils.StringsFR.abilitylist;
        var dict = new Dictionary<int, StaticAbility>();

        for (var i = 0; i < abilitiesNames.Length; i++)
        {
            var abilityId = i;
            var abilityName = abilitiesNames[abilityId];
            dict.Add(abilityId, new StaticAbility
            {
                Id = abilityId,
                Name = abilityName,
            });
        }

        return dict;
    }

    public static async Task<Dictionary<int, StaticItem>> GetStaticItems()
    {
        var itemNames = PKHexUtils.StringsFR.itemlist;
        List<Task<StaticItem>> tasks = [];

        for (var i = 0; i < itemNames.Length; i++)
        {
            var itemId = i;
            var itemName = itemNames[itemId];
            var itemNameEn = GameInfo.Strings.itemlist[itemId];

            if (itemNameEn.Trim().Length == 0 || itemNameEn == "???")
            {
                continue;
            }

            tasks.Add(Task.Run(async () =>
            {
                var itemObj = await PokeApi.GetItem(itemNameEn);
                var sprite = itemObj?.Sprites.Default ?? "";

                // if (itemNameEn.ToLower().Contains("belt"))
                // Console.WriteLine($"Error with item {itemId} - {itemNameEn} / {PokeApiFileClient.PokeApiNameFromPKHexName(itemNameEn)} / {itemName}");

                return new StaticItem
                {
                    Id = itemId,
                    Name = itemName,
                    Sprite = sprite,
                };
            }));
        }

        var values = await Task.WhenAll(tasks);

        var dict = new Dictionary<int, StaticItem>();
        foreach (var value in values)
        {
            dict.Add(value.Id, value);
        }
        return dict;
    }

    private static MoveCategory GetMoveCategory(string damageClassName)
    {
        return damageClassName switch
        {
            "physical" => MoveCategory.PHYSICAL,
            "special" => MoveCategory.SPECIAL,
            "status" => MoveCategory.STATUS,
            _ => throw new Exception(),
        };
    }

    private static async Task<string> GetVersionName(GameVersion version)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        var strings = PKHexUtils.StringsFR;

        return string.Join('/', pokeapiVersions.Select(ver =>
        {
            return ver.Names.Find(name => name.Language.Name == "fr").Name;
        }).Distinct());
    }

    // private static List<GameVersion> GetAliasedVersions(GameVersion version)
    // {
    //     return version switch
    //     {
    //         GameVersion.RB => [GameVersion.RD, GameVersion.GN, GameVersion.BU],
    //         GameVersion.RBY => [.. GetAliasedVersions(GameVersion.RB), GameVersion.YW],
    //         GameVersion.GS => [GameVersion.GD, GameVersion.SI],
    //         GameVersion.GSC => [.. GetAliasedVersions(GameVersion.GS), GameVersion.C],
    //         GameVersion.RS => [GameVersion.R, GameVersion.S],
    //         GameVersion.RSE => [.. GetAliasedVersions(GameVersion.RS), GameVersion.E],
    //         GameVersion.FRLG => [GameVersion.FR, GameVersion.LG],
    //         GameVersion.COLO => [GameVersion.CXD],
    //         GameVersion.XD => [GameVersion.CXD],
    //         GameVersion.DP => [GameVersion.D, GameVersion.P],
    //         GameVersion.DPPt => [.. GetAliasedVersions(GameVersion.DP), GameVersion.Pt],
    //         GameVersion.HGSS => [GameVersion.HG, GameVersion.SS],
    //         GameVersion.BW => [GameVersion.B, GameVersion.W],
    //         GameVersion.B2W2 => [GameVersion.B2, GameVersion.W2],
    //         GameVersion.XY => [GameVersion.X, GameVersion.Y],
    //         GameVersion.ORASDEMO => [GameVersion.OR, GameVersion.AS],
    //         GameVersion.ORAS => [GameVersion.OR, GameVersion.AS],
    //         GameVersion.SM => [GameVersion.SN, GameVersion.MN],
    //         GameVersion.USUM => [GameVersion.US, GameVersion.UM],
    //         GameVersion.GG => [GameVersion.GP, GameVersion.GE],
    //         GameVersion.SWSH => [GameVersion.SW, GameVersion.SH],
    //         GameVersion.BDSP => [GameVersion.BD, GameVersion.SP],
    //         GameVersion.SV => [GameVersion.SL, GameVersion.VL],
    //         GameVersion.Gen1 => GetAliasedVersions(GameVersion.RBY),
    //         GameVersion.Gen2 => GetAliasedVersions(GameVersion.GSC),
    //         GameVersion.Gen3 => [.. GetAliasedVersions(GameVersion.RSE), .. GetAliasedVersions(GameVersion.FRLG)],
    //         GameVersion.Gen4 => [.. GetAliasedVersions(GameVersion.DPPt), .. GetAliasedVersions(GameVersion.HGSS)],
    //         GameVersion.Gen5 => [.. GetAliasedVersions(GameVersion.BW), .. GetAliasedVersions(GameVersion.B2W2)],
    //         GameVersion.Gen6 => [.. GetAliasedVersions(GameVersion.XY), .. GetAliasedVersions(GameVersion.ORAS)],
    //         GameVersion.Gen7 => [.. GetAliasedVersions(GameVersion.SM), .. GetAliasedVersions(GameVersion.USUM)],
    //         GameVersion.Gen7b => [.. GetAliasedVersions(GameVersion.GG), .. GetAliasedVersions(GameVersion.GO)],
    //         GameVersion.Gen8 => [.. GetAliasedVersions(GameVersion.SWSH), .. GetAliasedVersions(GameVersion.BDSP), .. GetAliasedVersions(GameVersion.PLA)],
    //         GameVersion.Gen9 => GetAliasedVersions(GameVersion.SV),
    //         _ => [version],
    //     };
    // }

    private static Task<PokeApiNet.Version>[] GetPokeApiVersion(GameVersion version)
    {
        return version switch
        {
            GameVersion.Any => [],
            GameVersion.Invalid => [],

            #region Gen3
            GameVersion.S => [PokeApi.GetVersion(8)],
            GameVersion.R => [PokeApi.GetVersion(7)],
            GameVersion.E => [PokeApi.GetVersion(9)],
            GameVersion.FR => [PokeApi.GetVersion(10)],
            GameVersion.LG => [PokeApi.GetVersion(11)],
            GameVersion.CXD => [PokeApi.GetVersion(19), PokeApi.GetVersion(20)],
            #endregion

            #region Gen4
            GameVersion.D => [PokeApi.GetVersion(12)],
            GameVersion.P => [PokeApi.GetVersion(13)],
            GameVersion.Pt => [PokeApi.GetVersion(14)],
            GameVersion.HG => [PokeApi.GetVersion(15)],
            GameVersion.SS => [PokeApi.GetVersion(16)],
            #endregion

            #region Gen5
            GameVersion.W => [PokeApi.GetVersion(18)],
            GameVersion.B => [PokeApi.GetVersion(17)],
            GameVersion.W2 => [PokeApi.GetVersion(22)],
            GameVersion.B2 => [PokeApi.GetVersion(21)],
            #endregion

            #region Gen6
            GameVersion.X => [PokeApi.GetVersion(23)],
            GameVersion.Y => [PokeApi.GetVersion(24)],
            GameVersion.AS => [PokeApi.GetVersion(26)],
            GameVersion.OR => [PokeApi.GetVersion(25)],
            #endregion

            #region Gen7
            GameVersion.SN => [PokeApi.GetVersion(27)],
            GameVersion.MN => [PokeApi.GetVersion(28)],
            GameVersion.US => [PokeApi.GetVersion(29)],
            GameVersion.UM => [PokeApi.GetVersion(30)],
            #endregion
            GameVersion.GO => [],

            #region Virtual Console (3DS) Gen1
            GameVersion.RD => [PokeApi.GetVersion(1)],
            GameVersion.GN => [PokeApi.GetVersion(2)],
            GameVersion.BU => [PokeApi.GetVersion(46)],
            GameVersion.YW => [PokeApi.GetVersion(3)],
            #endregion

            #region Virtual Console (3DS) Gen2
            GameVersion.GD => [PokeApi.GetVersion(4)],
            GameVersion.SI => [PokeApi.GetVersion(5)],
            GameVersion.C => [PokeApi.GetVersion(6)],
            #endregion

            #region Nintendo Switch
            GameVersion.GP => [PokeApi.GetVersion(31)],
            GameVersion.GE => [PokeApi.GetVersion(32)],
            GameVersion.SW => [PokeApi.GetVersion(33)],
            GameVersion.SH => [PokeApi.GetVersion(34)],
            GameVersion.PLA => [PokeApi.GetVersion(39)],
            GameVersion.BD => [PokeApi.GetVersion(37)],
            GameVersion.SP => [PokeApi.GetVersion(38)],
            GameVersion.SL => [PokeApi.GetVersion(40)],
            GameVersion.VL => [PokeApi.GetVersion(41)],
            #endregion

            // The following values are not actually stored values in pk data,
            // These values are assigned within PKHeX as properties for various logic branching.

            #region Game Groupings (SaveFile type, roughly)
            GameVersion.RB => [.. GetPokeApiVersion(GameVersion.RD), .. GetPokeApiVersion(GameVersion.GN), .. GetPokeApiVersion(GameVersion.BU)],
            GameVersion.RBY => [.. GetPokeApiVersion(GameVersion.RB), .. GetPokeApiVersion(GameVersion.YW)],
            GameVersion.GS => [.. GetPokeApiVersion(GameVersion.GD), .. GetPokeApiVersion(GameVersion.SI)],
            GameVersion.GSC => [.. GetPokeApiVersion(GameVersion.GS), .. GetPokeApiVersion(GameVersion.C)],
            GameVersion.RS => [.. GetPokeApiVersion(GameVersion.R), .. GetPokeApiVersion(GameVersion.S)],
            GameVersion.RSE => [.. GetPokeApiVersion(GameVersion.RS), .. GetPokeApiVersion(GameVersion.E)],
            GameVersion.FRLG => [.. GetPokeApiVersion(GameVersion.FR), .. GetPokeApiVersion(GameVersion.LG)],
            GameVersion.RSBOX => [],
            GameVersion.COLO => [PokeApi.GetVersion(19)],
            GameVersion.XD => [PokeApi.GetVersion(20)],
            GameVersion.DP => [.. GetPokeApiVersion(GameVersion.D), .. GetPokeApiVersion(GameVersion.P)],
            GameVersion.DPPt => [.. GetPokeApiVersion(GameVersion.DP), .. GetPokeApiVersion(GameVersion.Pt)],
            GameVersion.HGSS => [.. GetPokeApiVersion(GameVersion.HG), .. GetPokeApiVersion(GameVersion.SS)],
            GameVersion.BATREV => [],
            GameVersion.BW => [.. GetPokeApiVersion(GameVersion.B), .. GetPokeApiVersion(GameVersion.W)],
            GameVersion.B2W2 => [.. GetPokeApiVersion(GameVersion.B2), .. GetPokeApiVersion(GameVersion.W2)],
            GameVersion.XY => [.. GetPokeApiVersion(GameVersion.X), .. GetPokeApiVersion(GameVersion.Y)],

            GameVersion.ORASDEMO => [.. GetPokeApiVersion(GameVersion.OR), .. GetPokeApiVersion(GameVersion.AS)],
            GameVersion.ORAS => [.. GetPokeApiVersion(GameVersion.OR), .. GetPokeApiVersion(GameVersion.AS)],
            GameVersion.SM => [.. GetPokeApiVersion(GameVersion.SN), .. GetPokeApiVersion(GameVersion.MN)],
            GameVersion.USUM => [.. GetPokeApiVersion(GameVersion.US), .. GetPokeApiVersion(GameVersion.UM)],
            GameVersion.GG => [.. GetPokeApiVersion(GameVersion.GP), .. GetPokeApiVersion(GameVersion.GE)],
            GameVersion.SWSH => [.. GetPokeApiVersion(GameVersion.SW), .. GetPokeApiVersion(GameVersion.SH)],
            GameVersion.BDSP => [.. GetPokeApiVersion(GameVersion.BD), .. GetPokeApiVersion(GameVersion.SP)],
            GameVersion.SV => [.. GetPokeApiVersion(GameVersion.SL), .. GetPokeApiVersion(GameVersion.VL)],

            GameVersion.Gen1 => [.. GetPokeApiVersion(GameVersion.RBY)],
            GameVersion.Gen2 => [.. GetPokeApiVersion(GameVersion.GSC)],
            GameVersion.Gen3 => [.. GetPokeApiVersion(GameVersion.RSE), .. GetPokeApiVersion(GameVersion.FRLG)],
            GameVersion.Gen4 => [.. GetPokeApiVersion(GameVersion.DPPt), .. GetPokeApiVersion(GameVersion.HGSS)],
            GameVersion.Gen5 => [.. GetPokeApiVersion(GameVersion.BW), .. GetPokeApiVersion(GameVersion.B2W2)],
            GameVersion.Gen6 => [.. GetPokeApiVersion(GameVersion.XY), .. GetPokeApiVersion(GameVersion.ORAS)],
            GameVersion.Gen7 => [.. GetPokeApiVersion(GameVersion.SM), .. GetPokeApiVersion(GameVersion.USUM)],
            GameVersion.Gen7b => [.. GetPokeApiVersion(GameVersion.GG), .. GetPokeApiVersion(GameVersion.GO)],
            GameVersion.Gen8 => [.. GetPokeApiVersion(GameVersion.SWSH), .. GetPokeApiVersion(GameVersion.BDSP), .. GetPokeApiVersion(GameVersion.PLA)],
            GameVersion.Gen9 => [.. GetPokeApiVersion(GameVersion.SV)],

            GameVersion.StadiumJ => [],
            GameVersion.Stadium => [],
            GameVersion.Stadium2 => [],
            GameVersion.EFL => [.. GetPokeApiVersion(GameVersion.E), .. GetPokeApiVersion(GameVersion.FRLG)],
            #endregion
        };
    }
}
