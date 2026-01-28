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
public class WorkOrdersApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WorkOrdersApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkOrder>>> GetWorkOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        IQueryable<WorkOrder> query = _context.WorkOrders;

        if (User.IsInRole("Manager"))
        {
            // Manager sees all
        }
        else if (User.IsInRole("Mechanic"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic != null)
            {
                query = query.Where(wo => wo.MechanicId == mechanic.Id);
            }
            else
            {
                return Ok(new List<WorkOrder>());
            }
        }
        else if (User.IsInRole("Client"))
        {
            var clientBookings = await _context.Bookings
                .Where(b => b.ClientId == userId)
                .Select(b => b.Id)
                .ToListAsync();
            query = query.Where(wo => clientBookings.Contains(wo.BookingId));
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkOrder>> GetWorkOrder(int id)
    {
        var workOrder = await _context.WorkOrders.FindAsync(id);
        if (workOrder == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Mechanic") && !User.IsInRole("Manager"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic == null || workOrder.MechanicId != mechanic.Id)
            {
                return Forbid();
            }
        }
        else if (User.IsInRole("Client"))
        {
            var booking = await _context.Bookings.FindAsync(workOrder.BookingId);
            if (booking == null || booking.ClientId != userId)
            {
                return Forbid();
            }
        }

        return Ok(workOrder);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<WorkOrder>> CreateWorkOrder([FromBody] WorkOrder workOrder)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        workOrder.CreatedAt = DateTime.UtcNow;
        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWorkOrder), new { id = workOrder.Id }, workOrder);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkOrder(int id, [FromBody] WorkOrder workOrder)
    {
        if (id != workOrder.Id)
        {
            return BadRequest();
        }

        var existing = await _context.WorkOrders.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Mechanic") && !User.IsInRole("Manager"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic == null || existing.MechanicId != mechanic.Id)
            {
                return Forbid();
            }
            existing.Status = workOrder.Status;
            existing.MechanicNotes = workOrder.MechanicNotes;
            existing.ActualDurationMinutes = workOrder.ActualDurationMinutes;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else if (User.IsInRole("Manager"))
        {
            _context.Entry(existing).CurrentValues.SetValues(workOrder);
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            return Forbid();
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteWorkOrder(int id)
    {
        var workOrder = await _context.WorkOrders.FindAsync(id);
        if (workOrder == null)
        {
            return NotFound();
        }

        _context.WorkOrders.Remove(workOrder);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

