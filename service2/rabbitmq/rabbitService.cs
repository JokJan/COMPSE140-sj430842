using System.Text;
using devops;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

public class RabbitService : BackgroundService {
    private IServiceProvider _sp;
    private ConnectionFactory _factory;
    private IConnection _connection;
    private IModel _channel;
    private RabbitMQChannel _sendChannel;
    private string _queueName;

    private readonly string exchangeName = "devops_exchange";
    private readonly string listenedTopic = "message";

    public RabbitService(IServiceProvider sp, RabbitMQChannel sendChannel) {
        _sp = sp;
        // Create the RabbitMQ connection used to listen for messages
        _factory = new ConnectionFactory() { HostName = "rabbitmq" };
        _connection = _factory.CreateConnection();
        _channel = _connection.CreateModel();
        _channel.ExchangeDeclare(exchange: exchangeName, type: ExchangeType.Topic);
        _queueName = _channel.QueueDeclare().QueueName;

        // Bind the created queue to the topic message
        _channel.QueueBind(queue: _queueName, exchange: exchangeName, routingKey: listenedTopic);

        _sendChannel = sendChannel;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (stoppingToken.IsCancellationRequested)
        {
            // Dispose of the connection if we stop listening for new messages
            _channel.Dispose();
            _connection.Dispose();

            return Task.CompletedTask;
        }

        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += (model, eventargs) => {
            // Read the incoming message
            byte[] body = eventargs.Body.ToArray();
            string message = Encoding.UTF8.GetString(body);
            Console.WriteLine("Received message {0}", message);

            // Send the log message
            string log_message = message + " MSG";
            byte[] log_body = Encoding.UTF8.GetBytes(log_message);
            _sendChannel.channel.BasicPublish(exchange: _sendChannel.exchangeName, routingKey: "log", basicProperties: null, body: log_body);
        };

        _channel.BasicConsume(queue: _queueName, autoAck: true, consumer: consumer);

        return Task.CompletedTask;
    }

}