import { chatHandler } from "./lib/chat-handler";
import { chat, commands, ExtensionContext, Uri } from "vscode";
import { getExtensionConfig } from "./lib/get-extension-config";
import { updateTests } from "./lib/update-tests";

export function activate(context: ExtensionContext) {
  getExtensionConfig().then((config) => {
    const handler = chatHandler(config);
    const angularChat = chat.createChatParticipant(
      "srleecode.angular-copilot-prompt-chat",
      handler
    );
    angularChat.iconPath = Uri.joinPath(context.extensionUri, "favicon.ico");
    const command = commands.registerCommand(
      "angular-copilot-prompt.updateTests",
      (selectedFile: Uri) => updateTests(config, selectedFile)
    );
    context.subscriptions.push(command);
  });
}

export function deactivate() {}
