import express from "express";
import { createClient } from "redis";

const states = Object.freeze({
  Initial: "INIT",
  Paused: "PAUSED",
  Running: "RUNNING",
  Shutdown: "SHUTDOWN"
})

const port = 8083;
const monitorURL = "http://monitor:8087/";
const service2URL = "http://service2:8000/"
const redisURL = "redis://redis:6379"

// Create a Redis client to allow connecting to it, to retrieve and set state
const client = createClient({
  url: redisURL
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

await client.set("state", states.Initial);


const app = express();
// Enable reading plain text requests
app.use(express.text());

async function closeSystem(req, res) {
  // Send requests to service 2 and monitor to shutdown. Service 1 will read it from Redis, so it doesn't need a message
  let shutdownRequest = {
    method: "POST",
    // Content type is JSON, since reading plain text is difficult in dotnet (service2)
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({Command: "SHUTDOWN"}),
  };
  
  await fetch(monitorURL + "shutdown", shutdownRequest);
  await fetch(service2URL + "shutdown", shutdownRequest);

  console.log(service2Response.status);

  res.send("Closing server");
  server.closeAllConnections();
  req.destroy();
  server.close();
  process.exit(0);
}

app.get("/messages", async (req, res) => {
    let monitorResponse = await fetch(monitorURL);
    let messages = await monitorResponse.text();
    res.type("text/plain");
    res.send(messages);
});

app.get("/state", async (req, res) => {
  let state = await client.get("state");
  res.type("text/plain");
  res.send(state);
});

app.put("/state", async(req, res) => {
  let newState = req.body;

  // If the state given is valid
  if (Object.values(states).includes(newState)) {
    await client.set("state", newState);

    res.type("text/plain")

    if (newState === states.Shutdown) {
      await closeSystem(req, res);
    }
    else {
      res.send("New state: " + newState);
    }
  }
  else {
    res.status = 422;
    res.send("Invalid state provided");
  }
});

let server = app.listen(port, () => {
  console.log("API gateway running");
});