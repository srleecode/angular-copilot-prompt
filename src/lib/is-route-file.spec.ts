import { sys } from "typescript";
import { isRouteFile } from "./is-route-file";

describe("isRouteFile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns false for a file with no routing-related properties", () => {
    jest.spyOn(sys, "readFile").mockReturnValue(`
            const example = { name: "test" };
        `);

    const result = isRouteFile("dummy-path.ts");
    expect(result).toBe(false);
  });

  it("returns false for a file with one routing-related property", () => {
    jest.spyOn(sys, "readFile").mockReturnValue(`
            const route = { path: "home" };
        `);

    const result = isRouteFile("dummy-path.ts");
    expect(result).toBe(false);
  });

  it("returns true for a file with two or more routing-related properties", () => {
    jest.spyOn(sys, "readFile").mockReturnValue(`
            const route = { path: "home", component: "HomeComponent" };
        `);

    const result = isRouteFile("dummy-path.ts");
    expect(result).toBe(true);
  });

  it("throws an error if the file cannot be found", () => {
    jest.spyOn(sys, "readFile").mockReturnValue(undefined);

    expect(() => isRouteFile("non-existent-file.ts")).toThrow(
      "File not found: non-existent-file.ts"
    );
  });
});
