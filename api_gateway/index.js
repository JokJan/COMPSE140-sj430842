import express from "express";
// How to set the state initially, and to running?
// Set it in service 1 to started when sending a message from init state? (service 1 needs to depend on api_gateway)
import { createClient } from "redis";

const states = Object.freeze({
  Initial: "INIT",
  Paused: "PAUSED",
  Running: "RUNNING",
  Shutdown: "SHUTDOWN"
})

const port = 8083;
const monitorURL = "http://monitor:8087/";
const redisURL = "redis://redis:6379"

// Create a Redis client to allow connecting to it, to retrieve and set state
const client = createClient({
  url: redisURL
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

await client.set("state", states.Initial);


const app = express();

app.get("/messages", async (req, res) => {
    let monitorResponse = await fetch(monitorURL);
    let messages = await monitorResponse.text();
    res.type("text/plain");
    res.send(messages);
})

app.get("/state", async (req, res) => {
  let state = await client.get("state");
  res.type("text/plain");
  res.send(state);
})

app.listen(port, () => {
  console.log("API gateway running");
});