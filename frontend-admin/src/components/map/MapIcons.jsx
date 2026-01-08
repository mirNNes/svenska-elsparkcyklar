import L from "leaflet";

/* Normal bike */
export function createBikeIcon(isMobile) {
  const iconSize = isMobile ? 32 : 52;
  const iconAnchor = iconSize / 2;

  return new L.Icon({
    iconUrl: "/scooter.png",
    iconRetinaUrl: "/scooter.png",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconAnchor, iconSize],
  });
}

/* Selected bike */
export function createSelectedBikeIcon(isMobile) {
  const iconSize = isMobile ? 32 : 52;
  const glowSize = iconSize + 12;
  const iconAnchor = iconSize / 2;

  const iconHtml = `
    <div style="
      position: relative;
      width: ${glowSize}px;
      height: ${glowSize}px;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${glowSize}px;
        height: ${glowSize}px;
        background: #1976d2;
        border-radius: 50%;
        opacity: 0.3;
      "></div>
      <img
        src="/scooter.png"
        style="
          position: absolute;
          top: 6px;
          left: 6px;
          width: ${iconSize}px;
          height: ${iconSize}px;
          filter: drop-shadow(0 0 8px #1976d2);
        "
      />
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    iconSize: [glowSize, glowSize],
    iconAnchor: [iconAnchor + 6, iconSize + 6],
    className: "selected-bike-icon",
  });
}

/* Charging station */
export function createStationIcon(isMobile) {
  const size = isMobile ? 26 : 52;
  const fontSize = isMobile ? 14 : 28;

  const iconHtml = `
    <div style="
      background: #4caf50;
      color: white;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      ⚡
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "station-icon",
  });
}
