import { existsSync } from "fs";
import { workspace, window, Uri, ConfigurationTarget } from "vscode";
import { Config } from "./model/config.model";
import { FILE_TYPE_REGEX_MAP, FileType } from "./model/file-type.enum";
import { DEFAULT_BASE_PROMPT } from "./model/default-base-prompt.const";
import path, { normalize, resolve } from "path";

export const getExtensionConfig = (): Promise<Config> => {
  const workspaceConfig = workspace.getConfiguration("angularCopilotPrompt");
  const basePrompt =
    (workspaceConfig.get("basePrompt") as string) || DEFAULT_BASE_PROMPT;
  const prototypicalComponents = workspaceConfig.get(
    "prototypicalComponents"
  ) as string[];
  const prototypicalServices = workspaceConfig.get(
    "prototypicalServices"
  ) as string[];
  const prototypicalStoreServices = workspaceConfig.get(
    "prototypicalStoreServices"
  ) as string[];
  return Promise.all([
    getPrototypicalExamples(prototypicalComponents, FileType.Component),
    getPrototypicalExamples(prototypicalServices, FileType.Service),
    getPrototypicalExamples(prototypicalStoreServices, FileType.StoreService),
  ]).then(
    ([
      prototypicalComponents,
      prototypicalServices,
      prototypicalStoreServices,
    ]) => ({
      basePrompt,
      prototypicalComponents,
      prototypicalServices,
      prototypicalStoreServices,
      prototypicalComponentSpecs: getRelatedSpecs(prototypicalComponents),
      prototypicalServiceSpecs: getRelatedSpecs(prototypicalServices),
      prototypicalStoreServiceSpecs: getRelatedSpecs(prototypicalStoreServices),
    })
  );
};

const getRelatedSpecs = (files: Uri[]): Uri[] => {
  const relatedSpecs: Uri[] = [];
  files.forEach((file) => {
    const specFile = file.fsPath.replace(/\.ts$/, ".spec.ts");
    if (existsSync(specFile)) {
      relatedSpecs.push(Uri.file(specFile));
    }
  });
  return relatedSpecs;
};
const getPrototypicalExamples = async (
  configFiles: string[],
  fileType: FileType
): Promise<Uri[]> => {
  if (!configFiles || configFiles?.length === 0) {
    return await generateFileExamples(fileType);
  }
  const validFiles: string[] = [];
  const invalidFiles: string[] = [];
  configFiles
    .map((file) =>
      normalize(workspace.workspaceFolders?.[0].uri.fsPath + "/" + file)
    )
    .forEach((file) => {
      if (existsSync(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
  if (invalidFiles.length > 0) {
    window.showWarningMessage(
      `The following prototypical files are invalid: ${invalidFiles.join(", ")}`
    );
  }
  return validFiles.map((file) => Uri.file(file));
};

const generateFileExamples = (fileType: FileType): Thenable<Uri[]> => {
  const glob = FILE_TYPE_REGEX_MAP[fileType];
  return workspace.findFiles(glob, "**/node_modules/**", 10);
};
