import DashButton from "./DashButton";
import UploadButton from "./UploadButton";
import ProfileMenu from "./ProfileMenu";
import StorageBar from "./StorageBar";
import { useSettings } from "../context/settings";

const Icon = ({ name, className = "" }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: "20px" }}
  >
    {name}
  </span>
);

const Dashboard = ({
  onRefresh,
  refreshing,
  user,
  books,
  onLoginClick,
  filterOpen,
  filtersActive,
  onToggleFilter,
}) => {
  const { theme, toggleTheme } = useSettings();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--bg)",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* App Controls (Left Side) */}
      <DashButton
        icon={<Icon name="menu" />}
        label="Menu"
        expandable={false}
        onClick={() => console.log("Menu clicked")}
      />

      {/* Spacer */}
      <div style={{ width: "8px" }}></div>

      <DashButton
        icon={<Icon name="refresh" className={refreshing ? "spin" : ""} />}
        label={refreshing ? "Refreshing" : "Refresh"}
        disabled={refreshing}
        onClick={onRefresh}
      />
      <DashButton
        icon={<Icon name="filter_list" />}
        label="Filter"
        active={filterOpen}
        badge={filtersActive && !filterOpen}
        onClick={onToggleFilter}
      />

      <UploadButton onRefresh={onRefresh} user={user} />

      {/* Spacer to push profile to the right */}
      <div style={{ flexGrow: 1 }}></div>

      {/* Storage line (moves into the profile menu on small screens) */}
      {user && (
        <div className="hide-narrow" style={{ marginRight: "12px" }}>
          <StorageBar books={books} compact />
        </div>
      )}

      {/* Lights: light / dark mode */}
      <DashButton
        icon={<Icon name={theme === "dark" ? "light_mode" : "dark_mode"} />}
        label={`Switch to ${nextTheme} mode`}
        expandable={false}
        onClick={toggleTheme}
      />

      <div style={{ width: "6px" }}></div>

      {/* Profile Avatar & Dropdown (Right Side) */}
      <ProfileMenu user={user} books={books} onLoginClick={onLoginClick} />
    </div>
  );
};

export default Dashboard;
