import { workspace, window, Uri } from "vscode";
import { Config } from "./model/config.model";
import { FILE_TYPE_REGEX_MAP, FileType } from "./model/file-type.enum";
import {
  DEFAULT_BASE_PROMPT,
  DEFAULT_UPDATE_TESTS_PROMPT,
} from "./model/default-prompts.const";
import normalize from "path-normalize";

export const getExtensionConfig = async (): Promise<Config> => {
  const workspaceConfig = workspace.getConfiguration("angularCopilotPrompt");
  const basePrompt =
    (workspaceConfig.get("basePrompt") as string) || DEFAULT_BASE_PROMPT;
  const baseUpdateTestsPrompt =
    (workspaceConfig.get("baseUpdateTestsPrompt") as string) ||
    DEFAULT_UPDATE_TESTS_PROMPT;
  const prototypicalComponentsConfig = workspaceConfig.get(
    "prototypicalComponents"
  ) as string[];
  const prototypicalServicesConfig = workspaceConfig.get(
    "prototypicalServices"
  ) as string[];
  const prototypicalStoreServicesConfig = workspaceConfig.get(
    "prototypicalStoreServices"
  ) as string[];
  const prototypicalComponents = await getPrototypicalExamples(
    prototypicalComponentsConfig,
    FileType.Component
  );
  const prototypicalServices = await getPrototypicalExamples(
    prototypicalServicesConfig,
    FileType.Service
  );
  const prototypicalStoreServices = await getPrototypicalExamples(
    prototypicalStoreServicesConfig,
    FileType.StoreService
  );
  const prototypicalComponentSpecs = await getRelatedSpecs(
    prototypicalComponents
  );
  const prototypicalServiceSpecs = await getRelatedSpecs(prototypicalServices);
  const prototypicalStoreServiceSpecs = await getRelatedSpecs(
    prototypicalStoreServices
  );
  return {
    basePrompt,
    baseUpdateTestsPrompt,
    prototypicalComponents,
    prototypicalServices,
    prototypicalStoreServices,
    prototypicalComponentSpecs,
    prototypicalServiceSpecs,
    prototypicalStoreServiceSpecs,
  };
};

const getRelatedSpecs = async (files: Uri[]): Promise<Uri[]> => {
  const relatedSpecs: Uri[] = [];
  for (const file of files) {
    const specFile = file.fsPath.replace(/\.ts$/, ".spec.ts");
    const uri = Uri.file(specFile);
    try {
      await workspace.fs.stat(uri);
      relatedSpecs.push(uri);
    } catch {}
  }
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
  await Promise.all(
    configFiles
      .map((file) =>
        normalize(workspace.workspaceFolders?.[0].uri.fsPath + "/" + file)
      )
      .map(async (file) => {
        const uri = Uri.file(file);
        try {
          await workspace.fs.stat(uri);
          validFiles.push(file);
        } catch {
          invalidFiles.push(file);
        }
      })
  );
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
