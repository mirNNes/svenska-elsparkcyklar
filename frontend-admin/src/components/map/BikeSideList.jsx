import { useMemo, useState } from "react";
import { LOW_BATTERY_THRESHOLD } from "../../utils/mapUtils";

export default function BikeSideList({
  bikes,
  selectedId,
  onSelect,
  isOpen,
  onClose,
  availableOnly,
  lowBatteryOnly,
  onFilterChange,
  navigate,
}) {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bikes;

    return bikes.filter((b) => {
      const idStr = String(b.id ?? "").toLowerCase();
      const mongoIdStr = String(b._id ?? "").toLowerCase();
      return idStr.includes(q) || mongoIdStr.includes(q);
    });
  }, [bikes, query]);

  return (
    <>
      {/* Overlay för mobil */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          className="mobile-overlay"
        />
      )}

      <div
        className={`bike-list ${isOpen ? "mobile-open" : ""}`}
        style={{
          maxHeight: "63vh",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          background: "white",
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <strong>Cyklar</strong>
          <span style={{ marginLeft: "auto", opacity: 0.7 }}>
            {list.length} st
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
              display: "none",
            }}
            className="mobile-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Filter */}
        <div
          style={{
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "#f5f5f5",
            borderRadius: 6,
            marginBottom: 10,
          }}
          className="mobile-filters"
        >
          <strong style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Filter
          </strong>

          <label
            style={{
              display: "flex",
              gap: ".5rem",
              alignItems: "center",
              fontSize: "1.1rem",
            }}
          >
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.checked) {
                  params.set("available", "1");
                } else {
                  params.delete("available");
                }
                navigate(`?${params.toString()}`);
                onFilterChange();
              }}
            />
            <span>Visa bara lediga</span>
          </label>

          <label
            style={{
              display: "flex",
              gap: ".5rem",
              alignItems: "center",
              fontSize: "1.1rem",
            }}
          >
            <input
              type="checkbox"
              checked={lowBatteryOnly}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                if (e.target.checked) {
                  params.set("lowBattery", "1");
                } else {
                  params.delete("lowBattery");
                }
                navigate(`?${params.toString()}`);
                onFilterChange();
              }}
            />
            <span>Låg batteri (&lt; {LOW_BATTERY_THRESHOLD}%)</span>
          </label>
        </div>

        {/* Sök */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök id…"
          style={{
            width: "calc(100% - 20px)",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
          }}
        />

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {list.map((b) => {
            const isSelected = selectedId === b._id;
            const battery = b.battery ?? 0;
            const isLow = battery < LOW_BATTERY_THRESHOLD;

            return (
              <button
                key={b._id}
                onClick={() => {
                  onSelect(b._id);
                  onClose();
                }}
                style={{
                  textAlign: "left",
                  border: isSelected ? "2px solid #1976d2" : "1px solid #ddd",
                  borderRadius: 8,
                  padding: 25,
                  background: isSelected ? "#e3f2fd" : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "black" }}>
                    Bike #{b.id}
                  </strong>

                  <span
                    style={{
                      fontWeight: 600,
                      color: isLow ? "#d32f2f" : "#2e7d32",
                    }}
                  >
                    🔋 {battery}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
