
import { getTileBounds } from "./coordinates.js";

export async function loadTileCatalog() {
  const response = await fetch("./tiles.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить tiles.json: HTTP ${response.status}. Запусти npm run build.`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.tiles)) {
    throw new Error("В tiles.json нет массива tiles.");
  }

  const tiles = data.tiles.filter(
    (tile) =>
      typeof tile.file === "string" &&
      Number.isFinite(tile.gridX) &&
      Number.isFinite(tile.gridZ)
  );

  if (tiles.length === 0) {
    throw new Error(
      "Каталог участков пуст. Проверь папку map и запусти npm run build."
    );
  }

  return tiles;
}

export function addTilesToMap(map, tiles) {
  const layers = [];
  const bounds = [];
  const errors = [];

  const ready = tiles.map((tile) => {
    const tileBounds = getTileBounds(tile);
    const encodedPath = tile.file
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const url = `./map/${encodedPath}`;

    const layer = L.imageOverlay(url, tileBounds, {
      opacity: 1,
      interactive: false,
      className: "map-tile"
    });

    layers.push({ tile, layer });
    bounds.push(tileBounds);

    return new Promise((resolve) => {
      layer.once("load", () => {
        resolve({ file: tile.file, ok: true });
      });

      layer.once("error", () => {
        errors.push(tile.file);
        console.error("Не удалось загрузить участок:", url);
        resolve({ file: tile.file, ok: false });
      });

      layer.addTo(map);
    });
  });

  return {
    layers,
    bounds,
    errors,
    ready: Promise.all(ready)
  };
}
