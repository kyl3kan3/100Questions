import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import { workflowErrorMessage } from "./workflow-errors";

describe("workflowErrorMessage", () => {
  it("reads Error objects from another VM realm", () => {
    const foreignError = runInNewContext('new Error("Gateway rejected the schema")');

    expect(foreignError).not.toBeInstanceOf(Error);
    expect(workflowErrorMessage(foreignError)).toBe("Gateway rejected the schema");
  });

  it("reads serialized messages, strings, and causes", () => {
    expect(workflowErrorMessage({ message: "Serialized failure" })).toBe(
      "Serialized failure",
    );
    expect(workflowErrorMessage(" String\n failure ")).toBe("String failure");
    expect(workflowErrorMessage({ cause: { message: "Nested failure" } })).toBe(
      "Nested failure",
    );
  });

  it("uses a bounded fallback for unknown values", () => {
    expect(workflowErrorMessage({ message: "x".repeat(600) })).toHaveLength(500);
    expect(workflowErrorMessage({ message: "   " })).toBe(
      "Workflow step failed without a structured error.",
    );
    expect(
      workflowErrorMessage({
        get message() {
          throw new Error("getter failed");
        },
      }),
    ).toBe("Workflow step failed without a structured error.");
  });
});
