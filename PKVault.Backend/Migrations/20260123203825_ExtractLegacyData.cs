using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class ExtractLegacyData : Migration
    {

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (!File.Exists(SettingsService.FilePath))
            {
                return;
            }
            string json = File.ReadAllText(SettingsService.FilePath);
            var settingsMutable = JsonSerializer.Deserialize(json, SettingsMutableDTOJsonContext.Default.SettingsMutableDTO);
            var dbPath = settingsMutable.DB_PATH;

            var bankFilepath = LegacyBankLoader.GetFilepath(dbPath);
            var boxFilepath = LegacyBoxLoader.GetFilepath(dbPath);
            var pkmVersionFilepath = LegacyPkmVersionLoader.GetFilepath(dbPath);
            var dexFilepath = LegacyDexLoader.GetFilepath(dbPath);

            var bankData = JsonSerializer.Deserialize(
                File.ReadAllText(bankFilepath),
                LegacyEntityJsonContext.Default.DictionaryStringLegacyBankEntity
            );
            var boxData = JsonSerializer.Deserialize(
                File.ReadAllText(boxFilepath),
                LegacyEntityJsonContext.Default.DictionaryStringLegacyBoxEntity
            );
            var pkmVersionData = JsonSerializer.Deserialize(
                File.ReadAllText(pkmVersionFilepath),
                LegacyEntityJsonContext.Default.DictionaryStringLegacyPkmVersionEntity
            );
            var dexData = JsonSerializer.Deserialize(
                File.ReadAllText(dexFilepath),
                LegacyEntityJsonContext.Default.DictionaryStringLegacyDexEntity
            );

            bankData.Values.ToList().ForEach(e =>
            {
                migrationBuilder.InsertData("Banks",
                    columns: ["Id", "Name", "IsDefault", "Order", "View"],
                    values: [
                        e.Id, e.Name, e.IsDefault, e.Order, JsonSerializer.Serialize(e.View, LegacyEntityJsonContext.Default.LegacyBankView)
                    ]
                );
            });
            Console.WriteLine($"Migrated {bankData.Count} legacy bank lines");

            boxData.Values.ToList().ForEach(e =>
            {
                migrationBuilder.InsertData("Boxes",
                    columns: ["Id", "Name", "Order", "Type", "SlotCount", "BankId"],
                    values: [
                        e.Id, e.Name, e.Order, (int)e.Type, e.SlotCount, e.BankId
                    ]
                );
            });
            Console.WriteLine($"Migrated {boxData.Count} legacy box lines");

            pkmVersionData.Values.ToList().ForEach(e =>
            {
                migrationBuilder.InsertData("PkmVersions",
                    columns: ["Id", "BoxId", "BoxSlot", "IsMain", "AttachedSaveId", "AttachedSavePkmIdBase", "Generation", "Filepath"],
                    values: [
                        e.Id, e.BoxId.ToString(), e.BoxSlot, e.IsMain, e.AttachedSaveId, e.AttachedSavePkmIdBase, e.Generation, e.Filepath
                    ]
                );
            });
            Console.WriteLine($"Migrated {pkmVersionData.Count} legacy pkmVersion lines");

            dexData.Values.ToList().ForEach(e =>
            {
                migrationBuilder.InsertData("Pokedex",
                    columns: ["Id", "Species", "Forms"],
                    values: [
                        e.Id, e.Species, JsonSerializer.Serialize(e.Forms, LegacyEntityJsonContext.Default.ListLegacyDexEntityForm)
                    ]
                );
            });
            Console.WriteLine($"Migrated {dexData.Count} legacy dex lines");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Banks", true);
            migrationBuilder.Sql("DELETE FROM Boxes", true);
            migrationBuilder.Sql("DELETE FROM PkmVersions", true);
            migrationBuilder.Sql("DELETE FROM Pokedex", true);
        }
    }
}
