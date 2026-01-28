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
public class MechanicsApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MechanicsApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mechanic>>> GetMechanics()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isManager = User.IsInRole("Manager");

        IQueryable<Mechanic> query = _context.Mechanics;

        if (User.IsInRole("Mechanic") && !isManager)
        {
            query = query.Where(m => m.UserId == userId);
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mechanic>> GetMechanic(int id)
    {
        var mechanic = await _context.Mechanics.FindAsync(id);
        if (mechanic == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (User.IsInRole("Mechanic") && !User.IsInRole("Manager") && mechanic.UserId != userId)
        {
            return Forbid();
        }

        return Ok(mechanic);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<Mechanic>> CreateMechanic([FromBody] Mechanic mechanic)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        mechanic.CreatedAt = DateTime.UtcNow;
        _context.Mechanics.Add(mechanic);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMechanic), new { id = mechanic.Id }, mechanic);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateMechanic(int id, [FromBody] Mechanic mechanic)
    {
        if (id != mechanic.Id)
        {
            return BadRequest();
        }

        var existing = await _context.Mechanics.FindAsync(id);
        if (existing == null)
        {
            return NotFound();
        }

        _context.Entry(existing).CurrentValues.SetValues(mechanic);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteMechanic(int id)
    {
        var mechanic = await _context.Mechanics.FindAsync(id);
        if (mechanic == null)
        {
            return NotFound();
        }

        _context.Mechanics.Remove(mechanic);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}




