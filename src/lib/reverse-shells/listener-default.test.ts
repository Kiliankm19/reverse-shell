import { describe, expect, it } from "vitest";
import { getSmartDefaultListenerId } from "./listener-default";

describe("getSmartDefaultListenerId", () => {
  it("uses netcat for classic reverse shells", () => {
    expect(getSmartDefaultListenerId("bash-dev-tcp")).toBe("nc");
  });

  it("keeps bind listener for bind shells", () => {
    expect(getSmartDefaultListenerId("nc-bind-e")).toBe("bind-connect");
  });

  it("keeps hoax-http for hoaxshell payloads", () => {
    expect(getSmartDefaultListenerId("powershell-hoaxshell-style")).toBe(
      "hoax-http",
    );
  });

  it("keeps tls listener for ssl payloads", () => {
    expect(getSmartDefaultListenerId("ncat-ssl-exec")).toBe("ncat-ssl");
  });

  it("keeps socat listener for socat payloads", () => {
    expect(getSmartDefaultListenerId("socat-pty")).toBe("socat-tty");
  });
});
