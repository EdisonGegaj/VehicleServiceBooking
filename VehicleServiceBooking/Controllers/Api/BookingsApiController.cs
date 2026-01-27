using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VehicleServiceBooking.Web.Data;
using VehicleServiceBooking.Web.Models.Entities;

namespace VehicleServiceBooking.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class BookingsApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookingsApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetBookings([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        IQueryable<Booking> query = _context.Bookings;

        if (User.IsInRole("Manager"))
        {
            if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(b => b.BookingDate >= startDate.Value && b.BookingDate <= endDate.Value);
            }
        }
        else if (User.IsInRole("Mechanic"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic != null)
            {
                query = query.Where(b => b.MechanicId == mechanic.Id);
            }
            else
            {
                return Ok(new List<Booking>());
            }
        }
        else if (User.IsInRole("Client"))
        {
            query = query.Where(b => b.ClientId == userId);
        }

        return await query.OrderByDescending(b => b.BookingDate).ThenBy(b => b.BookingTime).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Client") && booking.ClientId != userId)
        {
            return Forbid();
        }
        else if (User.IsInRole("Mechanic"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic == null || booking.MechanicId != mechanic.Id)
            {
                return Forbid();
            }
        }

        return Ok(booking);
    }

    [HttpPost]
    [Authorize(Roles = "Client,Manager")]
    public async Task<ActionResult<Booking>> CreateBooking([FromBody] Booking booking)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!User.IsInRole("Manager"))
        {
            booking.ClientId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        }

        if (booking.MechanicId.HasValue)
        {
            var exists = await _context.Bookings
                .AnyAsync(b => b.MechanicId == booking.MechanicId &&
                              b.BookingDate.Date == booking.BookingDate.Date &&
                              b.BookingTime == booking.BookingTime &&
                              b.Status != BookingStatus.Cancelled);
            if (exists)
            {
                return BadRequest(new { message = "The selected time slot is not available." });
            }
        }

        if (booking.BookingDate.Date < DateTime.Today)
        {
            return BadRequest(new { message = "Booking date cannot be in the past." });
        }

        booking.CreatedAt = DateTime.UtcNow;
        booking.Status = BookingStatus.Pending;
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateBooking(int id, [FromBody] Booking booking)
    {
        if (id != booking.Id)
        {
            return BadRequest();
        }

        var existing = await _context.Bookings.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        _context.Entry(existing).CurrentValues.SetValues(booking);
        existing.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "Client,Manager")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Client") && booking.ClientId != userId)
        {
            return Forbid();
        }

        var bookingDateTime = booking.BookingDate.Date.Add(booking.BookingTime);
        var hoursUntilBooking = (bookingDateTime - DateTime.Now).TotalHours;

        if (User.IsInRole("Client") && hoursUntilBooking < 24)
        {
            return BadRequest(new { message = "Booking cannot be cancelled. Minimum 24 hours notice required." });
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled successfully." });
    }
}




