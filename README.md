# angular-copilot-prompt README

This extension is built to help development with Angular using Github Copilot chat. The success of an LLM response depends on the context it has access to, and there are some issues with the default context:

- LLMS have training cutoff dates and technology moves very quickly, which means that the suggestions from LLMs can often be out of date
- Loading the right context is difficult. Either:
  - Files are selected and added to the chat, which is manual
  - Copilot can [search](https://code.visualstudio.com/docs/copilot/reference/workspace-context) the code base to find the right files to load into the context. This takes time and often the context needed is more specific, e.g. if it selects all components, some of those would be implemented poorly or not use the latest best practices.

The success of an LLM response also depends on the prompts used. There doesn’t seem to be a way to save prompts, and it can often take multiple attempts to find the right prompt.

## Features

This extension provides two features to ease the above issues:

- chat particpant, which can be asked Angular questions
- Selectable commands that run a specific prompt with appropriate loaded context.

### Chat participant

By default, copilot doesn't know what an Angular resource is as it is a newer feature. Using the @angular chat particpant allows it to correctly answer the question.

<p align="center">
  <img src="https://raw.githubusercontent.com/srleecode/angular-copilot-prompt/refs/heads/main/gifs/chat-query.gif" alt="Chat participant query" width="500" />
</p>

## Extension Settings

This extension contributes the following settings:

- `angularCopilotPrompt:prototypicalComponents`: Relative from root file path list of components that should be loaded as the appropriate context when updating a component.
- `angularCopilotPrompt:prototypicalServices`: Relative from root file path list of services that should be loaded as the appropriate context when updating a service.
- `angularCopilotPrompt:prototypicalStoreServices`: Relative from root file path list of store services that should be loaded as the appropriate context when updating a store service.
- `angularCopilotPrompt.basePrompt`: Base prompt to include in all prompts
