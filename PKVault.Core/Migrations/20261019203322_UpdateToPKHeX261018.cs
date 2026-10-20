using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToPKHeX261018 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // PKHeX 26.10.18 adds new GameVersion values: WI, WA, FRX, LGX
            // shifting all next GameVersions by 4

            // GameVersion.WI = 54
            var WIvalue = 54;

            migrationBuilder.Sql($"UPDATE Pokedex SET Version = Version + 4 WHERE Version >= {WIvalue}");
            migrationBuilder.Sql($"UPDATE InventoryItems SET Version = Version + 4 WHERE Version >= {WIvalue}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // GameVersion.WI = 54
            var WIvalue = 54;

            migrationBuilder.Sql($"UPDATE Pokedex SET Version = Version - 4 WHERE Version >= {WIvalue + 4}");
            migrationBuilder.Sql($"UPDATE InventoryItems SET Version = Version - 4 WHERE Version >= {WIvalue + 4}");
        }
    }
}
