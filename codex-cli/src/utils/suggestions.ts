import { shortenPath } from './short-path';
import fs from 'fs';
import os from 'os';
import path from 'path';


export function getSuggestions(pathPrefix: string): Array<string> {
  if (!pathPrefix) {
    return [];
  }

  try {
    const sep = path.sep;
    const hasTilde = pathPrefix === "~" || pathPrefix.startsWith("~" + sep);
    const expanded = hasTilde
      ? path.join(os.homedir(), pathPrefix.slice(1))
      : pathPrefix;

    const normalized = path.normalize(expanded);
    const isDir = /[\\/]+$/.test(pathPrefix); // handles both "/" and "\\" suffixes
    const base = path.basename(normalized);

    const dir =
      normalized === "." && !pathPrefix.startsWith("." + sep) && !hasTilde
        ? process.cwd()
        : path.dirname(normalized);

    const readDir = isDir ? path.join(dir, base) : dir;

    return fs
      .readdirSync(readDir)
      .filter((item) => isDir || item.startsWith(base))
      .map((item) => {
        const fullPath = path.join(readDir, item);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        return shortenPath(fullPath + (isDirectory ? sep : ""));
      });
  } catch {
    return [];
  }
}
