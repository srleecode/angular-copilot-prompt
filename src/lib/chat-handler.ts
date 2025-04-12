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
    if (config.basePrompt) {
      messages.push(LanguageModelChatMessage.User(config.basePrompt));
    }
    messages.push(
      LanguageModelChatMessage.User(
        request.prompt +
          " " +
          [
            ...config.prototypicalComponents,
            ...config.prototypicalServices,
            ...config.prototypicalStoreServices,
            ...config.prototypicalComponentSpecs,
            ...config.prototypicalServiceSpecs,
            ...config.prototypicalStoreServiceSpecs,
          ]
            .map((file) => `#file:${file.path}`)
            .join(" ")
      )
    );
    [
      ...config.prototypicalComponents,
      ...config.prototypicalServices,
      ...config.prototypicalStoreServices,
      ...config.prototypicalComponentSpecs,
      ...config.prototypicalServiceSpecs,
      ...config.prototypicalStoreServiceSpecs,
    ].forEach((file) => response.reference(file));
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
