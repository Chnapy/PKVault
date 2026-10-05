using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryItemTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InventoryType",
                table: "Boxes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InventoryItems",
                columns: table => new
                {
                    Id = table.Column<string>(name: "Id", type: "TEXT", nullable: false),
                    IdInt = table.Column<int>(name: "IdInt", type: "INTEGER", nullable: false),
                    ItemKey = table.Column<string>(name: "ItemKey", type: "TEXT", nullable: false),
                    Item = table.Column<int>(name: "Item", type: "INTEGER", nullable: false),
                    Version = table.Column<byte>(name: "Version", type: "INTEGER", nullable: false),
                    Count = table.Column<int>(name: "Count", type: "INTEGER", nullable: false),
                    BoxId = table.Column<int>(name: "BoxId", type: "INTEGER", nullable: false),
                    BoxSlot = table.Column<int>(name: "BoxSlot", type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_BoxId",
                table: "InventoryItems",
                column: "BoxId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_ItemKey",
                table: "InventoryItems",
                column: "ItemKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventoryItems");

            migrationBuilder.DropColumn(
                name: "InventoryType",
                table: "Boxes");
        }
    }
}
