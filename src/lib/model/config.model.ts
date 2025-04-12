import { Uri } from "vscode";

export interface Config {
  basePrompt: string;
  prototypicalComponents: Uri[];
  prototypicalServices: Uri[];
  prototypicalStoreServices: Uri[];
  prototypicalComponentSpecs: Uri[];
  prototypicalServiceSpecs: Uri[];
  prototypicalStoreServiceSpecs: Uri[];
}
