import { describe, expect, test } from "vitest";

describe("Get messages", () => {
    test("Can call monitor",async () => {
        let response = await fetch(
            "http://localhost:8087",
        );
        expect(response.status).toBe(200);
    })
});
