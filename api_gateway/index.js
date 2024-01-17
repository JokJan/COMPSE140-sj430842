import express from "express";

const port = 8083;

const monitorURL = "http://monitor:8087/";

const app = express();

app.get("/messages", async (req, res) => {
    let monitorResponse = await fetch(monitorURL);
    let messages = await monitorResponse.text();
    res.type("text/plain");
    res.send(messages);
})

app.listen(port, () => {
  console.log("API gateway running");
});