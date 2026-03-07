using Microsoft.EntityFrameworkCore.Migrations;
using PKHeX.Core;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateToPKHeX260306 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // PKHeX 26.03.06 adds new GameVersion.CP
            // shifting all next GameVersions by 1

            // GameVersion.CP = 53
            var CPvalue = 53;

            migrationBuilder.Sql($"UPDATE Pokedex SET Version = Version + 1 WHERE Version >= {CPvalue}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // GameVersion.CP = 53
            var CPvalue = 53;

            migrationBuilder.Sql($"UPDATE Pokedex SET Version = Version - 1 WHERE Version >= {CPvalue + 1}");
        }
    }
}
