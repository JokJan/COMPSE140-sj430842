import requests
import os
import time
import pika
from datetime import datetime
from pathlib import Path

exchange_name = "devops_exchange"

def send_log(content):
    channel.basic_publish(exchange=exchange_name, routing_key="log", body=content)

def send_request(url, content, headers):
    try:
        response = requests.post(url, json={"text": content}, headers=headers)
        time_string = get_time_string()
        log_string = f"{response.status_code} {time_string}"
        send_log(log_string)
    except Exception as e:
        send_log("Error sending request: " + str(e))

def send_message(content):
    try:
        channel.basic_publish(exchange=exchange_name, routing_key="message", body=content)
    except Exception as e:
        send_log("Error sending message: " + str(e))


def get_time_string():
    now = datetime.now()
    time_string = now.strftime("%Y-%m-%dT%H:%M:%S.%fz")
    return time_string

if __name__ == "__main__":
    headers = {
        'Content-type': 'application/json',
        'Accept': 'application/json, text/plain'
    }

    # Form the target url and target text for logging
    target_host = os.getenv("TARGET_HOST")
    target_port = os.getenv("TARGET_PORT")
    target = target_host + ":" + target_port
    url = "http://" + target + "/"

    # Create connection to rabbitmq, and the required exchange and topic
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq"))
    channel = connection.channel()
    channel.exchange_declare(exchange=exchange_name, exchange_type="topic")

    for i in range(1, 21):
        time_string = get_time_string()
        text = f"SND {i} {time_string} {target}"
        
        send_request(url, text, headers)
        send_message(text)
        time.sleep(2)

    # Send final message and close connection
    send_log("SND STOP")
    connection.close()
    # The service stops running here instead of waiting for docker compose down, as there is no sensible way to keep it running, nor is there anything for it to do