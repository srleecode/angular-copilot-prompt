/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Use ts-jest to handle TypeScript files
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: ["**/?(*.)+(spec).ts?(x)"],
  transformIgnorePatterns: ["\\\\node_modules\\\\"],
  coverageProvider: "v8",
};

export default config;
