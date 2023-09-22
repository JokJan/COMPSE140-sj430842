import requests
import os
import sys
import time
from datetime import datetime
from pathlib import Path

def write_log(content):
    with(Path("../logs/service1.log")).open("a") as log_file:
        log_file.write(content + "\n")

def send_request(url, content, headers):
    try:
        r = requests.post(url, json={"text": content}, headers=headers)
        write_log(content)
    except Exception as e:
        write_log("Error: " + str(e))

# Separate function is needed for this to avoid logging an error when service 2 closes
def exit_program(url, headers):
    try:
        r = requests.post(url, json={"text": "STOP"}, headers=headers)
        write_log("STOP")
    except Exception as e:
        pass
    finally:
        sys.exit(0)


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

    # Ensure the logs directory exists, and that the log file is empty
    p = Path("../logs")
    p.mkdir(exist_ok=True)
    with(p/"service1.log").open('w') as log_file:
        log_file.write("")

    for i in range(1, 21):
        now = datetime.now()
        time_string = now.strftime("%Y-%m-%dT%H:%M:%S.%fz")
        text = f"{i} {time_string} {target}"
        
        send_request(url, text, headers)
        time.sleep(2)

    # Send final message and stop
    exit_program(url, headers)