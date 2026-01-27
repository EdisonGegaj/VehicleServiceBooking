using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VehicleServiceBooking.Web.Models.Entities;

namespace VehicleServiceBooking.Web.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<ServiceCenter> ServiceCenters { get; set; }
    public DbSet<ServiceType> ServiceTypes { get; set; }
    public DbSet<Mechanic> Mechanics { get; set; }
    public DbSet<MechanicSchedule> MechanicSchedules { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<WorkOrder> WorkOrders { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<WorkOrderPart> WorkOrderParts { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Invoice> Invoices { get; set; }

   
}




