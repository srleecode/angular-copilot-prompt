import {
  CancellationToken,
  ChatContext,
  ChatRequest,
  ChatRequestHandler,
  ChatResponseMarkdownPart,
  ChatResponseStream,
  ChatResponseTurn,
  LanguageModelChatMessage,
  LanguageModelError,
} from "vscode";
import { Config } from "./model/config.model";
import { GUIDE_SELECTIONS } from "./model/guide-selections.const";
import { GuideSelection } from "./model/guide-selection.model";

// Waiting on https://github.com/angular/angular/issues/60434 so that this chat particpant can fetch from the Angular docs.
// As a workaround, it uses a custom generated selection from the Angular guide docs
export const chatHandler =
  (config: Config): ChatRequestHandler =>
  async (
    request: ChatRequest,
    context: ChatContext,
    response: ChatResponseStream,
    token: CancellationToken
  ) => {
    response.progress("Reading context...");
    const messages: LanguageModelChatMessage[] = [];
    const previousMessages = getPreviousMessages(context);
    if (previousMessages.length > 0) {
      messages.push(...previousMessages);
    }
    const guideLines = getRelevantGuideLines(request.prompt);
    if (guideLines.length > 0) {
      messages.push(LanguageModelChatMessage.Assistant(guideLines.join("\n")));
    }
    messages.push(LanguageModelChatMessage.User(request.prompt));
    await sendRequest(request, response, messages, token);
  };

const getRelevantGuideLines = (requestPrompt: string): string[] => {
  const selections: GuideSelection[] = [];
  requestPrompt
    .split(" ")
    .filter((token) => token.length >= 3)
    .forEach((token) => {
      GUIDE_SELECTIONS.forEach((guide) => {
        if (guide.file.includes(token)) {
          selections.push(guide);
        }
      });
    });
  selections.sort((a, b) => a.startLine - b.startLine);
  const uniqueSelections = selections.filter(
    (selection, index, self) =>
      index === self.findIndex((s) => s.startLine === selection.startLine)
  );
  return uniqueSelections.map((selection) => selection.content);
};

const getPreviousMessages = (
  context: ChatContext
): LanguageModelChatMessage[] => {
  const messages: LanguageModelChatMessage[] = [];
  const previousChatResponseTurns = context.history.filter(
    (h) => h instanceof ChatResponseTurn
  );

  // add the previous messages to the messages array
  previousChatResponseTurns.forEach((m) => {
    let fullMessage = "";
    m.response.forEach((r) => {
      const mdPart = r as ChatResponseMarkdownPart;
      fullMessage += mdPart.value.value;
    });
    messages.push(LanguageModelChatMessage.Assistant(fullMessage));
  });
  return messages;
};

const sendRequest = async (
  request: ChatRequest,
  response: ChatResponseStream,
  messages: LanguageModelChatMessage[],
  token: CancellationToken
) => {
  try {
    const chatRequest = await request.model.sendRequest(
      messages,
      undefined,
      token
    );
    for await (const token of chatRequest.text) {
      response.markdown(token);
    }
  } catch (err) {
    if (err instanceof LanguageModelError) {
      console.error(err.message, err.code, err.cause);
      if (
        err.cause instanceof Error &&
        err.cause.message.includes("off_topic")
      ) {
        response.markdown("I'm sorry, this cannot be processed.");
      }
    } else {
      response.markdown(
        "An error occurred while processing your request.\n" +
          (err as Error).message +
          (err as Error).stack
      );
      throw err;
    }
  }
};
