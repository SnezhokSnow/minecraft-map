
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const mapDirectory = path.join(projectDirectory, "map");
const outputFile = path.join(projectDirectory, "tiles.json");

function findPngFiles(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Папка с картой не найдена: ${directory}`);
  }

  const results = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...findPngFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".png")
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

const files = findPngFiles(mapDirectory);
const tiles = [];
const unmatched = [];

for (const fullPath of files) {
  const relativePath = path
    .relative(mapDirectory, fullPath)
    .split(path.sep)
    .join("/");

  const filename = path.basename(fullPath, path.extname(fullPath));

  const match = filename.match(
    /^(-?\d+)_(-?\d+)_x(-?\d+)_z(-?\d+)$/i
  );

  if (!match) {
    unmatched.push(relativePath);
    continue;
  }

  const [, gridX, gridZ, x, z] = match;

  tiles.push({
    file: relativePath,
    gridX: Number(gridX),
    gridZ: Number(gridZ),
    x: Number(x),
    z: Number(z)
  });
}

tiles.sort(
  (a, b) =>
    a.gridZ - b.gridZ ||
    a.gridX - b.gridX ||
    a.file.localeCompare(b.file)
);

fs.writeFileSync(
  outputFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalPngFiles: files.length,
      tiles
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Всего найдено PNG: ${files.length}`);
console.log(`Участков добавлено в каталог: ${tiles.length}`);
console.log(`Файл каталога: ${outputFile}`);

if (unmatched.length > 0) {
  console.warn(
    `Не распознано файлов: ${unmatched.length}. Их имена:`
  );

  for (const filename of unmatched) {
    console.warn(`  - ${filename}`);
  }
}

if (files.length === 0) {
  console.error("В папке map нет PNG-файлов.");
  process.exitCode = 1;
} else if (tiles.length === 0) {
  console.error(
    "Не удалось распознать ни одного имени. Проверь формат названий PNG."
  );
  process.exitCode = 1;
}
