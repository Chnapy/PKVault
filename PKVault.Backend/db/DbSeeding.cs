using Microsoft.EntityFrameworkCore;

public class DbSeeding
{
    public static async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        var banks = db.Set<BankEntity>();
        var boxes = db.Set<BoxEntity>();

        if (!banks.Any())
        {
            await banks.AddAsync(new(
                Id: "0",
                Name: "Bank 1",
                IsDefault: true,
                Order: 0,
                View: new([], [])
            ), cancelToken);
        }

        if (!boxes.Any())
        {
            await boxes.AddAsync(new(
                Id: "0",
                Name: "Box 1",
                Type: BoxType.Box,
                SlotCount: 30,
                Order: 0,
                BankId: "0"
            ), cancelToken);
        }
    }
}
