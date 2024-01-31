import requests
import os
import time
import pika
import redis
from states import States
from datetime import datetime

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

def change_state(new_state):
    old_state = stateStore.get("state")
    stateStore.set("state", new_state)
    time_string = get_time_string()
    log_string = f"{time_string}: {old_state}->{new_state}"
    stateStore.rpush("state-log", log_string)


if __name__ == "__main__":
    system_running = True
    i = 1

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

    # Create connection to Redis for getting state information
    stateStore = redis.Redis(host="redis", port=6379, decode_responses=True)

    while(system_running):
        state = stateStore.get("state")
        if (state == States.Shutdown):
            system_running = False
        elif (state == States.Paused):
            # Wait the normal cycle to see whether the state changes
            time.sleep(2)
        else:
            if (state == States.Initial):
                # Set the state to Running as the service starts sending messages
                i = 1
                change_state(States.Running.value)
            time_string = get_time_string()
            text = f"SND {i} {time_string} {target}"
            
            send_request(url, text, headers)
            send_message(text)

            i += 1
            time.sleep(2)

    # Send final message and close connection
    send_log("SND STOP")
    connection.close()