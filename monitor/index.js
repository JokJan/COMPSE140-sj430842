import amqplib from "amqplib";
import express from "express";

const port = 8087
const exchangeName = "devops_exchange";

const app = express();
var channel, connection, queueName;
var logs = [];

async function connectToRabbitMQ() {
    const rabbitMQ = "amqp://rabbitmq";
    connection = await amqplib.connect(rabbitMQ);
    channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'topic', {durable: false});
    queueName = await channel.assertQueue('', {exclusive: true}).queue
    await channel.bindQueue(queueName, exchangeName, "log");
}

function onLog(message) {
    logs.push(message.content.toString());
}

connectToRabbitMQ().then(() => {
    channel.consume(queueName, (msg) => {
        onLog(msg)
    }, {noAck: true});
});

app.get('*', (req, res) => {
    let response = logs.join('\n');
    res.type('text/plain');
    res.send(response);
})

app.listen(port, () => {
    console.log("Monitor running")
})