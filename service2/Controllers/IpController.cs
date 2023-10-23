using devops;
using RabbitMQ.Client;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace service2.Controllers;

[Route("")]
public class IpController : Controller
{
    private readonly RabbitMQChannel _sendConnection;

    public IpController(RabbitMQChannel sendConnection)
    {   
        _sendConnection = sendConnection;
    }

    // Receive the body as JSON object, as reading text/plain is apparently difficult in .net
    [HttpPost(Name = "")]
    public string Post([FromBody]ReceivedText receivedText)
    {
        // Get the IP adress, port and content from the request
        var ipAddr = HttpContext.Connection.RemoteIpAddress;
        var port = HttpContext.Connection.RemotePort;
        var body = receivedText.Text;
        Console.WriteLine("Post received");

        // If an ip address has been gotten from the request
        if (ipAddr != null) {
            string response = body + " " + ipAddr.ToString() + ":" + port.ToString();
            byte[] encoded_response = Encoding.UTF8.GetBytes(response);
            _sendConnection.channel.BasicPublish(exchange: _sendConnection.exchangeName, routingKey: "log", basicProperties: null, body: encoded_response);
            return response;
        }
        else {
            HttpContext.Response.StatusCode = 500;
            return "No ip adress found";
        }
    }
}

// Class representing the text received from service 1
public class ReceivedText {
    public string? Text { get; set;}
}
