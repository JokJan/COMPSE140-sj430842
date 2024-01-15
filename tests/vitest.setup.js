import { DockerComposeEnvironment, Wait } from "testcontainers";
import { afterAll, beforeAll } from "vitest";

const composeFilePath = "../"
const composeFile = "docker-compose.yaml"
let environment;

beforeAll(async () => {
    environment = await new DockerComposeEnvironment(
      composeFilePath,
      composeFile
    )
      .withWaitStrategy("sj430842-monitor-1", Wait.forLogMessage("Monitor running"))
      .up();
})

afterAll(async () => {
    await environment.down();
})
