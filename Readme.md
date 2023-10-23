This is an application made for the COMP.SE.140 DevOps course at Tampere university. It consists of 3 parts in separate folders, that communicate through RabbitMQ and http. Service 1 is made in Python, service 2 is made using asp.net (which I didn't know previously, but learned for this exercise, explaining questionable decisions), and a monitor program made in JavaScript. The logs about the communications of the application can be seen by calling localhost:8087, which the monitor listens to. The app is run by running docker compose up --build.

Information output about the host:
