import { shortenPath } from './short-path';
import fs from 'fs';
import os from 'os';
import path from 'path';

export function getSuggestions(pathPrefix: string): Array<string> {
  try {
    const isDir = pathPrefix.endsWith("/");
    const normalizedPath = pathPrefix.startsWith("~/")
      ? path.join(os.homedir(), pathPrefix.slice(2))
      : path.normalize(pathPrefix);
    const baseName = path.basename(normalizedPath);

    const effectiveDirPath =
      // TODO: is this correct?
      normalizedPath === "." &&
        !pathPrefix.startsWith("./") &&
        !pathPrefix.startsWith("~/")
        ? process.cwd()
        : path.dirname(normalizedPath);
    const directoryToRead = isDir
      ? path.join(effectiveDirPath, baseName)
      : effectiveDirPath;

    const dirContents = fs.readdirSync(directoryToRead);

    const suggestions = dirContents
      .filter((item) => isDir || item.startsWith(baseName))
      .map((item) => {
        const fullPath = path.join(directoryToRead, item);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        return shortenPath(`${item}${isDirectory ? "/" : ""}`);
      })
      // TODO should we allow all and do scroll?
      .slice(0, 5); // Limit to top 5 results

    return suggestions;
    // TODO remove error logging
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
}
