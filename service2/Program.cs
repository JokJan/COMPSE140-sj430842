using RabbitMQ.Client;

namespace devops;

public class Program {
    public static readonly string exchangeName = "devops_exchange";

    public static void Main(string[] args) {
        Thread.Sleep(2000);

        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Start listening for new RabbitMQ messages as a background service
        builder.Services.AddHostedService<RabbitService>();

        // Create rabbitmq connection to be used to send log messages, following the rabbitmq recommendation to have different channels for sending and receiving messages
        ConnectionFactory factory = new() { HostName = "rabbitmq" };
        IConnection connection = factory.CreateConnection();
        IModel channel = connection.CreateModel();
        channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Topic);

        RabbitMQChannel sendConnection = new(channel, exchangeName);
        builder.Services.AddSingleton(sendConnection);

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.MapControllers();

        app.Run();
    }
}

// Helper class to send the RabbitMq connection to classes that need it, so they don't all have to instantiate it
public class RabbitMQChannel {
    public IModel channel;
    public string exchangeName;

    public RabbitMQChannel(IModel channel, string exchangeName) {
        this.channel = channel;
        this.exchangeName = exchangeName;
    }
}

