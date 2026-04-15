using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "Context",
                table: "PkmVersions",
                type: "INTEGER",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.Sql($"UPDATE PkmVersions SET Context = Generation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Context",
                table: "PkmVersions");
        }
    }
}
