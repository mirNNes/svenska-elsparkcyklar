const BASE_URL = "http://localhost:3001/api";

export async function getAllScooters() {
  try {
    const response = await fetch(`${BASE_URL}/bike`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fel vid hämtning av scooters:", error);
    return [];
  }
}
