import { GuideSelection } from "../model/guide-selection.model";

export const getReadContext = (readContext: GuideSelection[]): string =>
  `Read content from the following guides: ${readContext
    .map(
      (g) =>
        `[${g.file}](https://github.com/angular/angular/blob/main/${g.fullFileName})`
    )
    .join(", ")}\n\n`;
