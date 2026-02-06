using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Boxes_Banks_BankId",
                table: "Boxes");

            migrationBuilder.DropForeignKey(
                name: "FK_PkmVersions_Boxes_BoxId",
                table: "PkmVersions");

            migrationBuilder.AddForeignKey(
                name: "FK_Boxes_Banks_BankId",
                table: "Boxes",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PkmVersions_Boxes_BoxId",
                table: "PkmVersions",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Boxes_Banks_BankId",
                table: "Boxes");

            migrationBuilder.DropForeignKey(
                name: "FK_PkmVersions_Boxes_BoxId",
                table: "PkmVersions");

            migrationBuilder.AddForeignKey(
                name: "FK_Boxes_Banks_BankId",
                table: "Boxes",
                column: "BankId",
                principalTable: "Banks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PkmVersions_Boxes_BoxId",
                table: "PkmVersions",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
