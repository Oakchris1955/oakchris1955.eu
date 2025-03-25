import fs from "node:fs";
import path from "node:path";

function getFilesRecursively(directory) {
  let files = []

  // original obtained from: https://stackoverflow.com/a/66187152/
  function _getFilesRecursively(directory) {
    const filesInDirectory = fs.readdirSync(directory);
    for (const file of filesInDirectory) {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        _getFilesRecursively(absolute);
      } else {
        files.push(absolute);
      }
    }
  };

  _getFilesRecursively(directory);

  return files;
}

export function genSitemap(directory) {
  const files = getFilesRecursively(directory).map((filePath) => {
    const fileStats = fs.statSync(filePath);

    return {
      url: path.relative(directory, filePath),
      modified: new Date(fileStats.mtimeMs)
    }
  })

  return files;
}
