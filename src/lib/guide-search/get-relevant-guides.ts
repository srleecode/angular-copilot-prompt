import MiniSearch from "minisearch";
import { GuideSelection } from "../model/guide-selection.model";
import { stopWordsSet } from "../model/stop-words-set.const";

export const getRelevantGuides = (
  requestPrompt: string,
  searchEngine: MiniSearch<GuideSelection>
): GuideSelection[] => {
  const searchResult = searchEngine.search(requestPrompt, {
    fuzzy: 0.2,
    fields: ["content", "file"],
    prefix: true,
    processTerm: (term) => {
      let word = term.length < 3 || stopWordsSet.has(term) ? null : term;
      if (word) {
        word = word.replace(/^[^a-zA-Z0-9]+/, "").replace(/[^a-zA-Z0-9]+$/, "");
      }
      return word ?? null;
    },
  });
  return searchResult
    .map((result): GuideSelection => {
      const { id, file, fullFileName, startLine, content, endLine } = result;
      return { id, file, fullFileName, startLine, content, endLine };
    })
    .slice(0, 5);
};
