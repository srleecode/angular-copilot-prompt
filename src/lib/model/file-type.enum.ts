import { GlobPattern } from "vscode";

export enum FileType {
  Component = "component",
  Service = "service",
  StoreService = "store-service",
}

export const FILE_TYPE_REGEX_MAP: Record<FileType, GlobPattern> = {
  [FileType.Component]: "**/*.component.ts",
  [FileType.Service]: "**/!(*store).service.ts",
  [FileType.StoreService]: "**/store.service.ts",
};
