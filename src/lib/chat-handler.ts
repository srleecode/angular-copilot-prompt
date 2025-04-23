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
import { GuideSelection } from "./model/guide-selection.model";
import { getRelevantGuides } from "./guide-search/get-relevant-guides";
import MiniSearch from "minisearch";
import { getReadContext } from "./guide-search/get-read-context";

// Waiting on https://github.com/angular/angular/issues/60434 so that this chat particpant can fetch from the Angular docs.
// As a workaround, it uses a custom generated selection from the Angular guide docs
export const chatHandler =
  (
    config: Config,
    searchEngine: MiniSearch<GuideSelection>
  ): ChatRequestHandler =>
  async (
    request: ChatRequest,
    context: ChatContext,
    response: ChatResponseStream,
    token: CancellationToken
  ) => {
    response.progress("Reading context...");
    const messages: LanguageModelChatMessage[] = [];
    const guides = getRelevantGuides(request.prompt, searchEngine);
    if (guides.length > 0) {
      guides.forEach((g) =>
        messages.push(LanguageModelChatMessage.Assistant(g.content))
      );
      response.markdown(getReadContext(guides));
      messages.push(
        LanguageModelChatMessage.Assistant(
          "You have been provided withthe context to answer Angular questions. You know about the latest version of Angular, but you don't know its version or release date"
        )
      );
    } else {
      const previousMessages = getPreviousMessages(context);
      if (previousMessages.length > 0) {
        messages.push(...previousMessages);
      }
    }
    messages.push(LanguageModelChatMessage.User(request.prompt));
    await sendRequest(request, response, messages, token);
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
