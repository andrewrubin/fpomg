import { describe, expect, it } from "vitest";
import hexToRGB from "../src/hex-to-rgb.js";
import getForegroundColor from "../src/get-foreground-color.js";

describe("hexToRGB", () => {
  it("converts six-digit hex to RGB, case-insensitively", () => {
    expect(hexToRGB("ff00b3")).toEqual([255, 0, 179]);
    expect(hexToRGB("B4D455")).toEqual([180, 212, 85]);
  });

  it.each(["zzzzzz", "fff", "ff00b3a", "", undefined])("rejects %s", (hex) => {
    expect(() => hexToRGB(hex)).toThrow(/six-digit hex/);
  });
});

describe("getForegroundColor", () => {
  it("uses black text on light backgrounds and white on dark", () => {
    expect(getForegroundColor([255, 255, 255])).toBe("#000000");
    expect(getForegroundColor([180, 212, 85])).toBe("#000000");
    expect(getForegroundColor([255, 0, 179])).toBe("#ffffff");
    expect(getForegroundColor([0, 0, 0])).toBe("#ffffff");
  });
});
