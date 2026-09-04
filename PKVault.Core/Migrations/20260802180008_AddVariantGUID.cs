using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantGUID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Hash",
                table: "PkmVersions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hash",
                table: "PkmVersions");
        }
    }
}
