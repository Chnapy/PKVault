using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Banks",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    IdInt = table.Column<int>(name: "IdInt", type: "INTEGER", nullable: false),
                    Name = table.Column<string>(name: "Name", type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(name: "IsDefault", type: "INTEGER", nullable: false),
                    Order = table.Column<int>(name: "Order", type: "INTEGER", nullable: false),
                    View = table.Column<string>(name: "View", type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PkmFiles",
                columns: table => new
                {
                    Filepath = table.Column<string>(name: "Filepath", type: "TEXT", nullable: false),
                    Data = table.Column<byte[]>(name: "Data", type: "BLOB", nullable: false),
                    Error = table.Column<int>(name: "Error", type: "INTEGER", nullable: true),
                    Updated = table.Column<bool>(name: "Updated", type: "INTEGER", nullable: false),
                    Deleted = table.Column<bool>(name: "Deleted", type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PkmFiles", x => x.Filepath);
                });

            migrationBuilder.CreateTable(
                name: "Pokedex",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    Species = table.Column<ushort>(name: "Species", type: "INTEGER", nullable: false),
                    Form = table.Column<byte>(name: "Form", type: "INTEGER", nullable: false),
                    Gender = table.Column<byte>(name: "Gender", type: "INTEGER", nullable: false),
                    Version = table.Column<byte>(name: "Version", type: "INTEGER", nullable: false),
                    IsCaught = table.Column<bool>(name: "IsCaught", type: "INTEGER", nullable: false),
                    IsCaughtShiny = table.Column<bool>(name: "IsCaughtShiny", type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pokedex", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Boxes",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    IdInt = table.Column<int>(name: "IdInt", type: "INTEGER", nullable: false),
                    Name = table.Column<string>(name: "Name", type: "TEXT", nullable: false),
                    Order = table.Column<int>(name: "Order", type: "INTEGER", nullable: false),
                    Type = table.Column<int>(name: "Type", type: "INTEGER", nullable: false),
                    SlotCount = table.Column<int>(name: "SlotCount", type: "INTEGER", nullable: false),
                    BankId = table.Column<string>(name: "BankId", type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boxes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Boxes_Banks_BankId",
                        column: x => x.BankId,
                        principalTable: "Banks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PkmVersions",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    BoxId = table.Column<string>(name: "BoxId", type: "TEXT", nullable: false),
                    BoxSlot = table.Column<int>(name: "BoxSlot", type: "INTEGER", nullable: false),
                    IsMain = table.Column<bool>(name: "IsMain", type: "INTEGER", nullable: false),
                    AttachedSaveId = table.Column<uint>(name: "AttachedSaveId", type: "INTEGER", nullable: true),
                    AttachedSavePkmIdBase = table.Column<string>(name: "AttachedSavePkmIdBase", type: "TEXT", nullable: true),
                    Generation = table.Column<byte>(name: "Generation", type: "INTEGER", nullable: false),
                    Filepath = table.Column<string>(name: "Filepath", type: "TEXT", nullable: false),
                    Species = table.Column<ushort>(name: "Species", type: "INTEGER", nullable: false),
                    Form = table.Column<byte>(name: "Form", type: "INTEGER", nullable: false),
                    Gender = table.Column<byte>(name: "Gender", type: "INTEGER", nullable: false),
                    IsShiny = table.Column<bool>(name: "IsShiny", type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PkmVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PkmVersions_Boxes_BoxId",
                        column: x => x.BoxId,
                        principalTable: "Boxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PkmVersions_PkmFiles_Filepath",
                        column: x => x.Filepath,
                        principalTable: "PkmFiles",
                        principalColumn: "Filepath");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Boxes_BankId",
                table: "Boxes",
                column: "BankId");

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_AttachedSaveId",
                table: "PkmVersions",
                column: "AttachedSaveId",
                filter: "AttachedSaveId IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_AttachedSaveId_AttachedSavePkmIdBase",
                table: "PkmVersions",
                columns: new[] { "AttachedSaveId", "AttachedSavePkmIdBase" },
                filter: "AttachedSaveId IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_BoxId",
                table: "PkmVersions",
                column: "BoxId");

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_BoxId_BoxSlot",
                table: "PkmVersions",
                columns: new[] { "BoxId", "BoxSlot" });

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_Filepath",
                table: "PkmVersions",
                column: "Filepath",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_Species_Form_Gender",
                table: "PkmVersions",
                columns: new[] { "Species", "Form", "Gender" });

            migrationBuilder.CreateIndex(
                name: "IX_PkmVersions_Species_Form_Gender_IsShiny",
                table: "PkmVersions",
                columns: new[] { "Species", "Form", "Gender", "IsShiny" });

            migrationBuilder.CreateIndex(
                name: "IX_Pokedex_Form",
                table: "Pokedex",
                column: "Form");

            migrationBuilder.CreateIndex(
                name: "IX_Pokedex_Gender",
                table: "Pokedex",
                column: "Gender");

            migrationBuilder.CreateIndex(
                name: "IX_Pokedex_Species",
                table: "Pokedex",
                column: "Species");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PkmVersions");

            migrationBuilder.DropTable(
                name: "Pokedex");

            migrationBuilder.DropTable(
                name: "Boxes");

            migrationBuilder.DropTable(
                name: "PkmFiles");

            migrationBuilder.DropTable(
                name: "Banks");
        }
    }
}
