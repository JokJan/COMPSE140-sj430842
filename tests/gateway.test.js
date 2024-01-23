import { describe, expect, test, beforeAll, beforeEach } from "vitest";

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
