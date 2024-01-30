import { describe, expect, test, beforeAll, beforeEach } from "vitest";
import {setTimeout} from "timers/promises";

describe("GET messages", () => {
    let response;
    let body;

    beforeAll(async () => {
      response = await fetch("http://localhost:8083/messages");
      body = await response.text();
    });


    test("Response body contains log messages",async () => {
      /* As there may or may not be errors caused by service 2 starting later than service 1,
        check whether the logs contain either a succesfull send, or a failed send*/
        const acceptedSubstrings = [
          "Error sending request",
          "SND",
          "No logs received yet",
        ];
        const correctResponse = acceptedSubstrings.some(substring => body.includes(substring));
        expect(correctResponse).toBe(true);
    })
});

describe("GET state", () => {
  let response;
  let body;

  beforeEach(async () => {
    response = await fetch("http://localhost:8083/state");
    body = await response.text();
  });

  test("At the beginning the state is either INIT or RUNNING", () => {
    // As the software may or may not have had the time to initialize, just test that the state is either one of the states it should
    // be without any other state being put
    const acceptedStates = [
      "INIT",
      "RUNNING"
    ];
    const correctResponse = acceptedStates.includes(body) ? true : false;
    expect(correctResponse).toBe(true);
  })
});

describe("PUT state", () => {
  test("No new messages are sent after state is put to paused", async () => {
    // First check that the put request goes through
    let requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "PAUSED"
    };
    let putResponse = await fetch("http://localhost:8083/state", requestOptions);
    expect(putResponse.status).toBe(200)

    // Get logs 2 seconds apart, and check that they are the same, i.e. that service 1 has not sent any new messages in the time it usually would
    let r1 = await fetch("http://localhost:8083/messages");
    let firstBody = await r1.text();

    await setTimeout(2000);

    let r2 = await fetch("http://localhost:8083/messages");
    let secondBody = await r2.text();

    expect(firstBody).toEqual(secondBody);
  });
  test("After sending is restarted, new messages are sent", async () => {
    // First check that the put request goes through
    let requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: "PAUSED",
    };
    let putResponse = await fetch(
      "http://localhost:8083/state",
      requestOptions
    );
    expect(putResponse.status).toBe(200);

    // Get logs, restart sending, and 2 seconds later check that the logs are different, i.e. that new messages are sent
    
    let r1 = await fetch("http://localhost:8083/messages");
    let firstBody = await r1.text();

    requestOptions.body = "RUNNING";
    putResponse = await fetch(
      "http://localhost:8083/state",
      requestOptions
    );
    expect(putResponse.status).toBe(200);

    await setTimeout(2000);

    let r2 = await fetch("http://localhost:8083/messages");
    let secondBody = await r2.text();

    let sameResult = firstBody === secondBody;

    expect(sameResult).toBe(false);
  })
})
