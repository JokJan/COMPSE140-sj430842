using Microsoft.AspNetCore.Mvc;

namespace service2.Controllers;

[Route("")]
public class IpController : Controller
{

    private readonly ILogger<IpController> _logger;
    private readonly IConfiguration _configuration;

    public IpController(ILogger<IpController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }
    // Receive the body as JSON object, as reading text/plain is apparently difficult in .net
    [HttpPost(Name = "")]
    public String Post([FromBody]ReceivedText receivedText)
    {
        // Get the IP adress, port and content from the request
        var ipAddr = HttpContext.Connection.RemoteIpAddress;
        var port = HttpContext.Connection.RemotePort;
        var body = receivedText.Text;
        Console.WriteLine("Post received");

        // If an ip address has been gotten from the request
        if (ipAddr != null) {
            // Get the path for the log file from configuration (appsettings.json)
            string logPath = @_configuration.GetValue<string>("LogPath") + "/service2.log";
            // TODO: Change to log topic
            using (StreamWriter writer = System.IO.File.AppendText(logPath))
            {
                writer.WriteLine(body + " " + ipAddr.ToString() + ":" + port.ToString());
            }
            return receivedText.Text + " " + ipAddr.ToString() + ":" + port.ToString();
        }
        else {
            return "No ip adress found";
        }
    }
}

// Class representing the text received from service 1
public class ReceivedText {
    public string? Text { get; set;}
}
