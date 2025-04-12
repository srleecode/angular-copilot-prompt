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

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Extension Settings

This extension contributes the following settings:

- `angularCopilotPrompt:prototypicalComponents`: Relative from root file path list of components that should be loaded as the appropriate context when updating a component.
- `angularCopilotPrompt:prototypicalServices`: Relative from root file path list of services that should be loaded as the appropriate context when updating a service.
- `angularCopilotPrompt:prototypicalStoreServices`: Relative from root file path list of store services that should be loaded as the appropriate context when updating a store service.
- `angularCopilotPrompt.basePrompt`: Base prompt to include in all prompts
