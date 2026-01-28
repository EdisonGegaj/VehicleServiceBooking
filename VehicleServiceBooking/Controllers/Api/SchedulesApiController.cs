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
public class SchedulesApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SchedulesApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MechanicSchedule>>> GetSchedules([FromQuery] int? mechanicId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        IQueryable<MechanicSchedule> query = _context.MechanicSchedules;

        if (mechanicId.HasValue)
        {
            query = query.Where(s => s.MechanicId == mechanicId.Value);
        }

        if (User.IsInRole("Mechanic") && !User.IsInRole("Manager"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic != null)
            {
                query = query.Where(s => s.MechanicId == mechanic.Id);
            }
            else
            {
                return Ok(new List<MechanicSchedule>());
            }
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MechanicSchedule>> GetSchedule(int id)
    {
        var schedule = await _context.MechanicSchedules.FindAsync(id);
        if (schedule == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Mechanic") && !User.IsInRole("Manager"))
        {
            var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mechanic == null || schedule.MechanicId != mechanic.Id)
            {
                return Forbid();
            }
        }

        return Ok(schedule);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<MechanicSchedule>> CreateSchedule([FromBody] MechanicSchedule schedule)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.MechanicSchedules.Add(schedule);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSchedule), new { id = schedule.Id }, schedule);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] MechanicSchedule schedule)
    {
        if (id != schedule.Id)
        {
            return BadRequest();
        }

        var existing = await _context.MechanicSchedules.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        _context.Entry(existing).CurrentValues.SetValues(schedule);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        var schedule = await _context.MechanicSchedules.FindAsync(id);
        if (schedule == null)
        {
            return NotFound();
        }

        _context.MechanicSchedules.Remove(schedule);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}




