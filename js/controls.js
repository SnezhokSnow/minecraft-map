export function setupControls(map, getAllBounds) {
  const fitButton = document.querySelector("#fit-map");

  fitButton.addEventListener("click", () => {
    const bounds = getAllBounds();

    if (!bounds || (typeof bounds.isValid === "function" && !bounds.isValid())) {
      return;
    }

    if (typeof bounds.length === "number" && bounds.length === 0) {
      return;
    }

    map.fitBounds(bounds, {
      padding: [24, 24],
      animate: true,
      maxZoom: 1
    });
  });
}

export function updateTileCount(count) {
  document.querySelector("#tile-count").textContent =
    `Участков в каталоге: ${count}`;
}

export function updateStatus(message) {
  document.querySelector("#map-status").textContent = message;
}
