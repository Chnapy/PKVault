using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PKVault.Core.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBoxTypeInventory : Migration
    {
        // related to BoxType.Inventory values
        const int OLD_INVENTORY_TYPE = 10;
        const int NEW_INVENTORY_TYPE = -1000;

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // update BoxType.Inventory from 10 to -1000
            migrationBuilder.Sql($"UPDATE Boxes SET Type = {NEW_INVENTORY_TYPE} WHERE Type == {OLD_INVENTORY_TYPE}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql($"UPDATE Boxes SET Type = {OLD_INVENTORY_TYPE} WHERE Type == {NEW_INVENTORY_TYPE}");
        }
    }
}
