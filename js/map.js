
import { CONFIG } from "./config.js";

export function createMap() {
  const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: CONFIG.minZoom,
    maxZoom: CONFIG.maxZoom,
    zoomSnap: CONFIG.zoomSnap,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 100,
    zoomControl: true,
    attributionControl: false,
    maxBoundsViscosity: CONFIG.maxBoundsViscosity
  });

  map.setView([0, 0], 0);

  return map;
}
