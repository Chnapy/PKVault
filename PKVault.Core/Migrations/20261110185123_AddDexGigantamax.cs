using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddDexGigantamax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOwnedGigantamax",
                table: "Pokedex",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOwnedGigantamax",
                table: "Pokedex");
        }
    }
}
