import { setupChunkHover } from "./chunk-hover.js";
import { createMap } from "./map.js";
import {
  loadTileCatalog,
  addTilesToMap
} from "./tiles.js";
import {
  getMinecraftCoordinates,
  formatCoordinate
} from "./coordinates.js";
import {
  setupControls,
  updateTileCount,
  updateStatus
} from "./controls.js";

async function start() {
  const map = createMap();
  setupChunkHover(map);
  let allBounds = null;

  setupControls(map, () => allBounds);

  map.on("mousemove", (event) => {
    const coords = getMinecraftCoordinates(event.latlng);

    document.querySelector("#coord-x").textContent =
      formatCoordinate(coords.x);

    document.querySelector("#coord-z").textContent =
      formatCoordinate(coords.z);
  });

  map.on("mouseout", () => {
    document.querySelector("#coord-x").textContent = "—";
    document.querySelector("#coord-z").textContent = "—";
  });

  try {
    updateStatus("Загрузка каталога участков...");

    const tiles = await loadTileCatalog();

    updateTileCount(tiles.length);
    updateStatus();

    const tileManager = addTilesToMap(map, tiles);

    if (tileManager.bounds.length > 0) {
      const combinedBounds = L.latLngBounds(
        tileManager.bounds[0]
      );

      for (const bounds of tileManager.bounds.slice(1)) {
        combinedBounds.extend(bounds);
      }

      allBounds = combinedBounds;
      map.fitBounds(allBounds, {
        padding: [24, 24],
        maxZoom: 1
      });
    }

    const results = await tileManager.ready;
    const failed = results.filter((result) => !result.ok);

    if (failed.length > 0) {
      updateStatus(
        `Загружено ${tiles.length - failed.length} из ${tiles.length}. Ошибок: ${failed.length}.`
      );

      console.error("PNG с ошибками:", failed.map((item) => item.file));
    } else {
      updateStatus;
    }
  } catch (error) {
    console.error("Ошибка карты:", error);
    updateStatus(error.message || "Не удалось загрузить карту");
  }
}

start();
