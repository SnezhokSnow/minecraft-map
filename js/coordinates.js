
import { CONFIG } from "./config.js";

export function getTileBounds(tile) {
  const size = CONFIG.tileSize;

  // Координаты x и z берутся из имени PNG.
  const left = tile.x;
  const top = -tile.z;

  return [
    [top - size, left],
    [top, left + size]
  ];
}

export function getMinecraftCoordinates(latlng) {
  return {
    x: Math.round(latlng.lng),
    z: Math.round(-latlng.lat)
  };
}

export function formatCoordinate(value) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(value);
}
