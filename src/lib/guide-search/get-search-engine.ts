import MiniSearch from "minisearch";
import { GUIDE_SELECTIONS } from "../model/guide-selections.const";
import { GuideSelection } from "../model/guide-selection.model";

export const getSearchEngine = () => {
  let miniSearch = new MiniSearch<GuideSelection>({
    fields: ["file", "content"], // fields to index for full-text search
    storeFields: [
      "id",
      "file",
      "fullFileName",
      "startLine",
      "content",
      "endLine",
    ], // fields to return with search results
  });
  miniSearch.addAll(GUIDE_SELECTIONS);
  return miniSearch;
};
