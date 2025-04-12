import { commands, Uri } from "vscode";
import { Config } from "./model/config.model";

export const updateTests = async (config: Config, selectedFile: Uri) => {
  const currentFile = selectedFile.path.replace(/\\/g, "/").split("/").pop();
  const prompt = `Update the tests to cover all the relevant test scenarios for #file:${currentFile}`;
  let fileUris: Uri[] = [selectedFile];
  let additionalCommands = "";
  if (selectedFile.path.includes(".component.ts")) {
    fileUris = [
      ...config.prototypicalComponents,
      ...config.prototypicalComponentSpecs,
    ];
    additionalCommands =
      'Test only public meethods in the class and do not include the "should create the component" test';
  } else if (selectedFile.path.includes("store.service.ts")) {
    fileUris = [
      ...config.prototypicalStoreServices,
      ...config.prototypicalServiceSpecs,
    ];
  } else if (selectedFile.path.includes(".service.ts")) {
    fileUris = [
      ...config.prototypicalServices,
      ...config.prototypicalServiceSpecs,
    ];
  }
  const fileAttachements = fileUris.map((uri) =>
    commands.executeCommand("github.copilot.edits.attachFile", uri)
  );
  Promise.all(fileAttachements).then(() => {
    commands.executeCommand(
      "workbench.action.chat.open",
      `${config.basePrompt} \n ${prompt} \n ${additionalCommands}`
    );
  });
};
