import { describe, expect, test, beforeAll } from "vitest";

describe("Get messages", () => {
    let response;
    let body;

    beforeAll(async () => {
      response = await fetch("http://localhost:8083/messages");
      body = await response.text();
    });


    test("Response body contains log messages",async () => {
      /* As there may or may not be errors caused by service 2 starting later than service 1,
        check whether the logs contain either a succesfull send, or a failed send*/
        const acceptedSubstrings = ["Error sending request", "SND"];
        const correctResponse = acceptedSubstrings.some(substring => body.includes(substring));
        expect(correctResponse).toBe(true);
    })
});
