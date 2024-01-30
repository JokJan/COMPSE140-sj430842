using Microsoft.AspNetCore.Mvc;

namespace service2.Controllers;

[ApiController]
public class SystemController : Controller
{
    private readonly IHostApplicationLifetime _applicationLifeTime;

    public SystemController(IHostApplicationLifetime applicationLifetime)
    {
        _applicationLifeTime = applicationLifetime;
    }

    [HttpPost("/shutdown")]
    public string Post([FromBody] ReceivedText receivedText)
    {
        Console.WriteLine("Received shutdown request");
        _applicationLifeTime.StopApplication();
        return "Exiting application";
    }
}
