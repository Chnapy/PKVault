using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDexLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Languages",
                table: "Pokedex",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Pokedex");
        }
    }
}
