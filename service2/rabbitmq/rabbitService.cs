using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

public class RabbitService : BackgroundService {
    private IServiceProvider _sp;
    private ConnectionFactory _factory;
    private IConnection _connection;
    private IModel _channel;
    private String queueName;

    private readonly String exchangeName = "devops_exchange";
    private readonly String topicName = "message";

    public RabbitService(IServiceProvider sp) {
        _sp = sp;
        _factory = new ConnectionFactory() { HostName = "rabbitmq" };
        _connection = _factory.CreateConnection();
        _channel = _connection.CreateModel();
        _channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Topic);
        queueName = _channel.QueueDeclare().QueueName;

        // Bind the created queue to the topic message
        _channel.QueueBind(queue: queueName, exchange: exchangeName, routingKey: topicName);
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (stoppingToken.IsCancellationRequested)
        {
            _channel.Dispose();
            _connection.Dispose();

            return Task.CompletedTask;
        }

        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += (model, eventargs) => {
            // Read the incoming message
            byte[] body = eventargs.Body.ToArray();
            String message = Encoding.UTF8.GetString(body);
            Console.WriteLine("Received message {0}", message);

            // Send the log message
            String log_message = message + " MSG";
            byte[] log_body = Encoding.UTF8.GetBytes(log_message);
            _channel.BasicPublish(exchange: exchangeName, routingKey: "log", basicProperties: null, body: log_body);
        };

        _channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);

        return Task.CompletedTask;
    }

}