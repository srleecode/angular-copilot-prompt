import * as ts from "typescript";

const routingVariables: string[] = [
  "path",
  "children",
  "redirectTo",
  "loadChildren",
  "component",
  "canActivate",
  "outlet",
];
const routingVariablesSet: Set<string> = new Set(routingVariables);

/**
 * Determines whether a given TypeScript file contains Angular route definitions.
 *
 * @param filePath - The path to the TypeScript file to analyze.
 * @returns `true` if the file contains at least two routing-related property assignments, otherwise `false`.
 * @throws An error if the file cannot be found or read.
 */
export const isRouteFile = (filePath: string): boolean => {
  const sourceCode = ts.sys.readFile(filePath);
  if (!sourceCode) {
    throw new Error(`File not found: ${filePath}`);
  }
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  let assignedRouteVariables = 0;
  let isRouteFile = false;
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node)) {
      const isRoutingVariable = node
        .getChildren()
        .some(
          (childNode) =>
            ts.isIdentifier(childNode) &&
            routingVariablesSet.has(childNode.text)
        );
      if (isRoutingVariable) {
        assignedRouteVariables++;
      }
      if (assignedRouteVariables >= 2) {
        isRouteFile = true;
        return;
      }
    }
    if (!isRouteFile) {
      ts.forEachChild(node, visit);
    }
  };
  visit(sourceFile);
  return isRouteFile;
};
