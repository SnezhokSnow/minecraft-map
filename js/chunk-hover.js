
const CHUNK_SIZE = 16;

export function setupChunkHover(map) {
  const highlight = L.rectangle(
    [[0, 0], [0, 0]],
    {
      color: "#ffe66d",
      weight: 1,
      opacity: 0.9,
      fillColor: "#ffe66d",
      fillOpacity: 0.12,
      interactive: false,
      className: "chunk-hover-highlight"
    }
  );

  let visible = false;
  let lastChunkX = null;
  let lastChunkZ = null;

  map.on("mousemove", (event) => {
    const blockX = Math.floor(event.latlng.lng);
    const blockZ = Math.floor(-event.latlng.lat);

    const chunkX = Math.floor(blockX / CHUNK_SIZE);
    const chunkZ = Math.floor(blockZ / CHUNK_SIZE);

    // Пока курсор остаётся в том же чанке, ничего не перерисовываем.
    if (chunkX === lastChunkX && chunkZ === lastChunkZ) {
      return;
    }

    lastChunkX = chunkX;
    lastChunkZ = chunkZ;

    const minX = chunkX * CHUNK_SIZE;
    const maxX = minX + CHUNK_SIZE;
    const minZ = chunkZ * CHUNK_SIZE;
    const maxZ = minZ + CHUNK_SIZE;

    highlight.setBounds([
      [-maxZ, minX],
      [-minZ, maxX]
    ]);

    if (!visible) {
      highlight.addTo(map);
      visible = true;
    }
  });

  map.on("mouseout", () => {
    if (visible) {
      map.removeLayer(highlight);
      visible = false;
    }

    lastChunkX = null;
    lastChunkZ = null;
  });

  // При перемещении карты или изменении масштаба сохраняем
  // правильную позицию выделения относительно координат мира.
  map.on("zoomend moveend", () => {
    lastChunkX = null;
    lastChunkZ = null;
  });
}
