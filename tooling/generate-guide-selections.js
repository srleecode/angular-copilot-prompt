const fs = require("fs");
const path = require("path");
const readline = require("readline");

function extractFileLines(filePath) {
  return new Promise((resolve, reject) => {
    const fileLines = [];
    let currentFile = null;

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    let lineNumber = 0;

    rl.on("line", (line) => {
      lineNumber++;
      const match = line.match(/^FILE:.+\/(.+\.md)$/);
      if (
        (!match && currentFile?.content) ||
        (currentFile?.content === "" && !line.startsWith("==================="))
      ) {
        currentFile.content += line + "\n";
      }
      if (match) {
        const fileName = match[1].replace(".md", "");
        if (currentFile) {
          currentFile.endLine = lineNumber - 2;
          fileLines.push(currentFile);
        }
        currentFile = {
          file: fileName,
          fullFileName: match[0].replace("FILE: ", ""),
          startLine: lineNumber + 2,
          content: "",
        };
      }
    });

    rl.on("close", () => {
      if (currentFile) {
        currentFile.endLine = lineNumber - 1;
        fileLines.push(currentFile);
      }
      resolve(fileLines);
    });

    rl.on("error", (err) => {
      reject(err);
    });
  });
}

async function generateGuideSelections() {
  const filePath = path.resolve("docs/angular-guides-12-04-25.llm");
  const fileLines = await extractFileLines(filePath);
  const outputPath = path.resolve("src/lib/model/guide-selections.const.ts");
  fs.writeFileSync(
    outputPath,
    "export const GUIDE_SELECTIONS = " +
      JSON.stringify(fileLines, null, 2) +
      ";"
  );
}

generateGuideSelections().catch((err) => console.error("Error:", err));
