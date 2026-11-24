import { useEffect, useRef } from "react";
import {
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  hasActiveFilters,
} from "../utils/books";

const labelStyle = {
  fontSize: "0.75rem",
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginRight: "4px",
};

// Row of pill buttons, one of which is selected
const Segmented = ({ label, options, value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <span style={labelStyle}>{label}</span>
    <div
      role="radiogroup"
      aria-label={label}
      style={{
        display: "flex",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "2px",
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "0.8rem",
              cursor: "pointer",
              backgroundColor: selected ? "var(--accent-soft)" : "transparent",
              color: selected ? "var(--accent)" : "var(--text-muted)",
              fontWeight: selected ? 600 : 400,
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const FilterBar = ({
  filters,
  onChange,
  onClear,
  sort,
  onSortChange,
  shown,
  total,
}) => {
  const searchRef = useRef(null);

  // Jump straight into the search box when the panel opens
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const update = (patch) => onChange({ ...filters, ...patch });
  const active = hasActiveFilters(filters);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "12px 20px",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg)",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border-strong)",
          borderRadius: "8px",
          padding: "0 10px",
          flex: "1 1 220px",
          maxWidth: "320px",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px", color: "var(--text-faint)" }}
        >
          search
        </span>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search title or author"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          onKeyDown={(e) => e.key === "Escape" && update({ search: "" })}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text)",
            padding: "8px 0",
            fontSize: "0.85rem",
          }}
        />
      </div>

      <Segmented
        label="Type"
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={(type) => update({ type })}
      />

      <Segmented
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => update({ status })}
      />

      {/* Sort */}
      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={labelStyle}>Sort</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            backgroundColor: "var(--input-bg)",
            color: "var(--text)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "6px 8px",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Result count + clear */}
      {active && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.8rem",
            color: "var(--text-faint)",
            marginLeft: "auto",
          }}
        >
          <span>
            {shown} of {total}
          </span>
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: 0,
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
