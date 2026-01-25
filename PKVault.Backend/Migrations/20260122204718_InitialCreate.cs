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
            // columns names MUST be defined for publish-trimmed !

            migrationBuilder.CreateTable(
                name: "Banks",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
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
                name: "Pokedex",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    Species = table.Column<ushort>(name: "Species", type: "INTEGER", nullable: false),
                    Forms = table.Column<string>(name: "Forms", type: "TEXT", nullable: false)
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
                    Filepath = table.Column<string>(name: "Filepath", type: "TEXT", nullable: false)
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
                name: "Banks");
        }
    }
}
