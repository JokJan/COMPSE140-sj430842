This is an application made for the COMP.SE.140 DevOps course at Tampere university. It consists of 3 parts in separate folders, that communicate through RabbitMQ and http. Service 1 is made in Python, service 2 is made using asp.net (which I didn't know previously, but learned for this exercise, explaining questionable decisions), and a monitor program made in JavaScript. The logs about the communications of the application can be seen by calling localhost:8087, which the monitor listens to. The app is run by running docker compose up --build.

Output of `uname -a`:  
`Linux JeesusTuleeOletkoValmis 5.10.16.3-microsoft-standard-WSL2 #1 SMP Fri Apr 2 22:23:49 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux`

Output of `docker --version`:  
`Docker version 24.0.6, build ed223bc`

Output of `docker compose version`:  
`Docker Compose version v2.21.0`