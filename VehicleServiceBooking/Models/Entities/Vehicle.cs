using System.ComponentModel.DataAnnotations;

namespace VehicleServiceBooking.Web.Models.Entities;

public class Vehicle
{
    public int Id { get; set; }

    [Required]
    public string LicensePlate { get; set; } = null!;

    [Required]
    public string Brand { get; set; } = null!;

    [Required]
    public string Model { get; set; } = null!;

    public int Year { get; set; }

    
    public string? ClientId { get; set; }

    public DateTime CreatedAt { get; set; }
}
