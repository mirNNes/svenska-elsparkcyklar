export const LOW_BATTERY_THRESHOLD = 30;

export function formatSpeed(speed) {
  if (!Number.isFinite(speed)) return "n/a";
  return `${Math.round(speed)} m/s`;
}

export function formatTelemetryTime(value) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleString("sv-SE");
}

export function getBikeModeLabel(bike) {
  if (bike.isOperational === false) return "Avstängd";
  if (bike.isInService === true) return "Service";
  return "OK";
}

export function isBatteryEmpty(bike) {
  const battery = Number(bike?.battery);
  if (!Number.isFinite(battery)) return false;
  return battery <= 0;
}

export function getAvailabilityText(bike) {
  if (isBatteryEmpty(bike)) return "Batteri slut";
  return bike.isAvailable ? "Tillgänglig" : "Upptagen";
}

export function getRideStatusText(bike, activeRide) {
  if (isBatteryEmpty(bike)) return "Batteri slut";
  if (activeRide) return `Pågår (Resa #${activeRide.id})`;
  if (bike.isAvailable) return "Ingen aktiv resa";
  return "Pågår (hämtas...)";
}