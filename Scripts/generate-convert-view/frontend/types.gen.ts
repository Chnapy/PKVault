export interface StaticSpritesheetsData {
    Species: { [key: string]: SpriteInfo; };
    Items: { [key: string]: SpriteInfo; };
}
export interface SpriteInfo {
    SheetName: string;
    X: number;
    Y: number;
    Width: number;
    Height: number;
}
export interface StaticSpeciesData {
    [key: string]: StaticSpecies | any;
}
export interface StaticSpecies {
    Id: number;
    Generation: number;
    Genders: Gender[];
    Forms: { [key: string]: StaticSpeciesForm[]; };
    PokedexIndexes: { [key: string]: number; };
}
export enum Gender {
    Male = 0,
    Female = 1,
    Genderless = 2,
    Random = 2,
}
export interface StaticSpeciesForm {
    Id: number;
    Name: string;
    SpriteDefault: string;
    SpriteFemale: string | undefined;
    SpriteShiny: string;
    SpriteShinyFemale: string | undefined;
    SpriteShadow: string | undefined;
    HasGenderDifferences: boolean;
    IsBattleOnly: boolean;
    IsMega: boolean;
}
export interface StaticOthersData {
    Versions: { [key: string]: StaticVersion; };
    Stats: { [key: string]: StaticStat; };
    Types: { [key: string]: StaticType; };
    Moves: { [key: string]: StaticMove; };
    Natures: { [key: string]: StaticNature; };
    Abilities: { [key: string]: StaticAbility; };
    Items: StaticItemsData;
    Generations: { [key: string]: StaticGeneration; };
    Pokedexes: { [key: string]: StaticPokedex; };
    Ribbons: { [key: string]: StaticRibbon; };
    Languages: { [key: string]: string; };
    EggSprite: string;
}
export interface StaticVersion {
    Id: number;
    Name: string;
    Context: EntityContext;
    IsGameVersion: boolean;
    Children: GameVersion[];
    Generation: number;
    Region: string[];
    Pokedexes: string[];
    MaxSpeciesId: number;
    MaxIV: number;
    MaxEV: number;
}
export enum EntityContext {
    None = 0,
    Gen1 = 1,
    Gen2 = 2,
    Gen3 = 3,
    Gen4 = 4,
    Gen5 = 5,
    Gen6 = 6,
    Gen7 = 7,
    Gen8 = 8,
    Gen9 = 9,
    SplitInvalid = 10,
    Gen7b = 11,
    Gen8a = 12,
    Gen8b = 13,
    Gen9a = 14,
    MaxInvalid = 15,
}
export enum GameVersion {
    Any = 0,
    S = 1,
    R = 2,
    E = 3,
    FR = 4,
    LG = 5,
    HG = 7,
    SS = 8,
    D = 10,
    P = 11,
    Pt = 12,
    CXD = 15,
    BATREV = 16,
    W = 20,
    B = 21,
    W2 = 22,
    B2 = 23,
    X = 24,
    Y = 25,
    AS = 26,
    OR = 27,
    SN = 30,
    MN = 31,
    US = 32,
    UM = 33,
    GO = 34,
    RD = 35,
    GN = 36,
    BU = 37,
    YW = 38,
    GD = 39,
    SI = 40,
    C = 41,
    GP = 42,
    GE = 43,
    SW = 44,
    SH = 45,
    PLA = 47,
    BD = 48,
    SP = 49,
    SL = 50,
    VL = 51,
    ZA = 52,
    CP = 53,
    RB = 54,
    RBY = 55,
    GS = 56,
    GSC = 57,
    RS = 58,
    RSE = 59,
    FRLG = 60,
    RSBOX = 61,
    COLO = 62,
    XD = 63,
    DP = 64,
    DPPt = 65,
    HGSS = 66,
    BW = 67,
    B2W2 = 68,
    XY = 69,
    ORASDEMO = 70,
    ORAS = 71,
    SM = 72,
    USUM = 73,
    GG = 74,
    SWSH = 75,
    BDSP = 76,
    SV = 77,
    Gen1 = 78,
    Gen2 = 79,
    Gen3 = 80,
    Gen4 = 81,
    Gen5 = 82,
    Gen6 = 83,
    Gen7 = 84,
    Gen7b = 85,
    Gen8 = 86,
    Gen9 = 87,
    StadiumJ = 88,
    Stadium = 89,
    Stadium2 = 90,
    EFL = 91,
    Invalid = 255,
}
export interface StaticStat {
    Id: number;
    Name: string;
}
export interface StaticType {
    Id: number;
    Name: string;
}
export interface StaticMove {
    Id: number;
    Name: string;
    DataUntilGeneration: StaticMoveGeneration[];
}
export interface StaticMoveGeneration {
    UntilGeneration: number;
    Type: number;
    Category: MoveCategory;
    Power: number | undefined;
    Accuracy: number | undefined;
}
export enum MoveCategory {
    PHYSICAL = 0,
    SPECIAL = 1,
    STATUS = 2,
}
export interface StaticNature {
    Id: number;
    Name: string;
    IncreasedStatIndex: number | undefined;
    DecreasedStatIndex: number | undefined;
}
export interface StaticAbility {
    Id: number;
    Name: string;
}
export interface StaticItemsData {
    VersionItems: StaticVersionsItems[];
    Items: { [key: string]: StaticItem; };
}
export interface StaticVersionsItems {
    Versions: number[];
    ComboItems: { [key: string]: string; };
}
export interface StaticItem {
    Id: string;
    Name: string;
    Sprite: string;
}
export interface StaticGeneration {
    Id: number;
    Regions: string[];
}
export interface StaticPokedex {
    Key: string;
    Name: string;
    Order: number;
    PokemonIndexes: { [key: string]: number; };
}
export interface StaticRibbon {
    Key: string;
    Name: string;
    Sprites: { [key: string]: string; };
}
export interface IndexJSON {
    PKTypes: string[];
    PkmVariantProperties: string[];
    PkmLegalityProperties: string[];
    Entries: IndexEntry[];
}
export interface IndexEntry {
    Id: string;
    Species: number;
    Form: number;
}
export interface ConvertFormJSON {
    Id: string;
    Species: number;
    Form: number;
    Paths: TupleOfConvertDirectionAndConvertStepOf[];
    MissingSavePkmTypes: string[];
    MissingSavePkmsPresent: string[];
}
export interface TupleOfConvertDirectionAndConvertStepOf {
    Item1: ConvertDirection;
    Item2: ConvertStep[];
}
export enum ConvertDirection {
    FORWARD = 0,
    BACKWARD = 1,
    BASE_TO_VARIANT = 2,
    VARIANT_TO_BASE = 3,
}
export interface ConvertStep {
    Id: string;
    Type: string;
    Ok: boolean;
    Error: string | undefined;
    PkmVariant: PkmVariantDTO | undefined;
    PkmLegality: PkmLegalityDTO | undefined;
}
export interface PkmBaseDTO {
    Id: string;
    Generation: number;
    BoxId: number;
    BoxSlot: number;
    IsDuplicate: boolean;
    IdBase: string;
    BoxKey: string;
    Version: GameVersion;
    ContextVersion: GameVersion;
    Context: EntityContext;
    PID: number;
    IsNicknamed: boolean;
    Nickname: string;
    Species: number;
    Form: number;
    IsEgg: boolean;
    IsShiny: boolean;
    IsAlpha: boolean;
    IsNoble: boolean;
    NSparkle: boolean;
    CanGigantamax: boolean;
    Ball: number;
    Gender: Gender;
    Types: number[];
    TeraType: number | undefined;
    Level: number;
    Exp: number;
    ExpToLevelUp: number;
    LevelUpPercent: number;
    Friendship: number;
    EggHatchCount: number;
    IVs: number[];
    EVs: number[];
    Stats: number[];
    BaseStats: number[];
    HiddenPowerType: number;
    HiddenPowerPower: number;
    HiddenPowerCategory: MoveCategory;
    Nature: Nature;
    Ability: number;
    IsAbilityHidden: boolean;
    Moves: number[];
    RelearnMoves: number[] | undefined;
    AlphaMove: number | undefined;
    TID: number;
    SID: number | undefined;
    OriginTrainerName: string;
    OriginTrainerGender: Gender;
    HandlingTrainerName: string;
    HandlingTrainerGender: Gender;
    HandlingTrainerFriendship: number;
    IsCurrentHandler: boolean;
    OriginMetDate: Date | undefined;
    OriginMetLocation: string;
    OriginMetLevel: number | undefined;
    FatefulEncounter: boolean;
    HeldItem: number;
    DynamicChecksum: string;
    NicknameMaxLength: number;
    LanguageID: LanguageID;
    HomeTracker: number | undefined;
    Markings: MarkingColorUniversal[] | undefined;
    Contest: number[] | undefined;
    Ribbons: { [key: string]: number; } | undefined;
    PokerusStrain: number;
    PokerusDays: number;
    IsPokerusInfected: boolean;
    IsPokerusCured: boolean;
    IsShadow: boolean;
    CanMove: boolean;
    CanDelete: boolean;
    CanMoveToSave: boolean;
    CanEdit: boolean;
    CanEvolve: boolean;
    LoadError: PKMLoadError | undefined;
    HasLoadError: boolean;
    IsEnabled: boolean;
}
export interface PkmVariantDTO extends PkmBaseDTO {
    IsMain: boolean;
    IsExternal: boolean;
    AttachedSaveId: number | undefined;
    AttachedSavePkmIdBase: string | undefined;
    IsFilePresent: boolean;
    Filepath: string;
    FilepathAbsolute: string;
    CanMoveAttachedToSave: boolean;
    CanDelete: boolean;
    CanMoveToSave: boolean;
    CanEdit: boolean;
    CanEvolve: boolean;
    CanCreateVariant: boolean;
    CompatibleWithVersions: GameVersion[];
}
export enum Nature {
    Hardy = 0,
    Lonely = 1,
    Brave = 2,
    Adamant = 3,
    Naughty = 4,
    Bold = 5,
    Docile = 6,
    Relaxed = 7,
    Impish = 8,
    Lax = 9,
    Timid = 10,
    Hasty = 11,
    Serious = 12,
    Jolly = 13,
    Naive = 14,
    Modest = 15,
    Mild = 16,
    Quiet = 17,
    Bashful = 18,
    Rash = 19,
    Calm = 20,
    Gentle = 21,
    Sassy = 22,
    Careful = 23,
    Quirky = 24,
    Random = 25,
}
export enum LanguageID {
    None = 0,
    Japanese = 1,
    English = 2,
    French = 3,
    Italian = 4,
    German = 5,
    UNUSED_6 = 6,
    Spanish = 7,
    Korean = 8,
    ChineseS = 9,
    ChineseT = 10,
    SpanishL = 11,
}
export enum MarkingColorUniversal {
    NotMarked = 0,
    Marked = 1,
    MarkedBlue = 2,
    MarkedPink = 3,
}
export enum PKMLoadError {
    UNKNOWN = 0,
    NOT_LOADED = 1,
    NOT_FOUND = 2,
    TOO_SMALL = 3,
    TOO_BIG = 4,
    UNAUTHORIZED = 5,
}
export interface PkmLegalityDTO {
    Id: string;
    SaveId: number | undefined;
    MovesLegality: boolean[];
    RelearnMovesLegality: boolean[];
    IsValid: boolean;
    ValidityReport: string;
    IllegalitiesCount: number;
}
export interface FrontendTypes {
    StaticSpritesheetsData: StaticSpritesheetsData;
    StaticSpeciesData: StaticSpeciesData;
    StaticOthersData: StaticOthersData;
    IndexJSON: IndexJSON;
    ConvertFormJSON: ConvertFormJSON;
}
