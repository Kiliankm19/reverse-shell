import { describe, expect, it } from "vitest";
import { getRecommendedListenerId } from "./template-meta";

describe("getRecommendedListenerId", () => {
  it("maps bind shells to bind-connect", () => {
    expect(getRecommendedListenerId("nc-bind-e")).toBe("bind-connect");
  });

  it("maps hoaxshell to dedicated http handler", () => {
    expect(getRecommendedListenerId("powershell-hoaxshell-style")).toBe(
      "hoax-http",
    );
  });

  it("maps socat payload to socat listener", () => {
    expect(getRecommendedListenerId("socat-pty")).toBe("socat-tty");
  });

  it("defaults reverse shells to rlwrap-nc", () => {
    expect(getRecommendedListenerId("bash-dev-tcp")).toBe("rlwrap-nc");
  });
});
