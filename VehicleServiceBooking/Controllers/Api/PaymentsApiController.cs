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
public class PaymentsApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        IQueryable<Payment> query = _context.Payments;

        if (User.IsInRole("Manager"))
        {
        }
        else if (User.IsInRole("Client"))
        {
            var clientBookings = await _context.Bookings
                .Where(b => b.ClientId == userId)
                .Select(b => b.Id)
                .ToListAsync();
            var clientWorkOrders = await _context.WorkOrders
                .Where(wo => clientBookings.Contains(wo.BookingId))
                .Select(wo => wo.Id)
                .ToListAsync();
            query = query.Where(p => clientWorkOrders.Contains(p.WorkOrderId));
        }
        else if (User.IsInRole("Mechanic"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic != null)
            {
                var mechanicWorkOrders = await _context.WorkOrders
                    .Where(wo => wo.MechanicId == mechanic.Id)
                    .Select(wo => wo.Id)
                    .ToListAsync();
                query = query.Where(p => mechanicWorkOrders.Contains(p.WorkOrderId));
            }
            else
            {
                return Ok(new List<Payment>());
            }
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Client"))
        {
            var workOrder = await _context.WorkOrders.FindAsync(payment.WorkOrderId);
            if (workOrder != null)
            {
                var booking = await _context.Bookings.FindAsync(workOrder.BookingId);
                if (booking == null || booking.ClientId != userId)
                {
                    return Forbid();
                }
            }
        }
        else if (User.IsInRole("Mechanic") && !User.IsInRole("Manager"))
        {
            var workOrder = await _context.WorkOrders.FindAsync(payment.WorkOrderId);
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic == null || workOrder == null || workOrder.MechanicId != mechanic.Id)
            {
                return Forbid();
            }
        }

        return Ok(payment);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<Payment>> CreatePayment([FromBody] Payment payment)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        payment.CreatedAt = DateTime.UtcNow;
        payment.PaymentDate = DateTime.UtcNow;
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdatePayment(int id, [FromBody] Payment payment)
    {
        if (id != payment.Id)
        {
            return BadRequest();
        }

        var existing = await _context.Payments.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        _context.Entry(existing).CurrentValues.SetValues(payment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null)
        {
            return NotFound();
        }

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

