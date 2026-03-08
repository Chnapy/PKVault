using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDexFormContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "Context",
                table: "Pokedex",
                type: "INTEGER",
                nullable: false,
                defaultValue: (byte)0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Context",
                table: "Pokedex");
        }
    }
}
