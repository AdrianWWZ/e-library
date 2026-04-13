import DashButton from "./DashButton";
import UploadButton from "./UploadButton";
import ProfileMenu from "./ProfileMenu";

const Dashboard = ({ onRefresh, user, onLoginClick }) => {
  const icons = {
    menu: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        menu
      </span>
    ),
    refresh: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        refresh
      </span>
    ),
    filter: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        filter_list
      </span>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px",
        padding: "12px 20px",
        borderBottom: "1px solid #333",
        backgroundColor: "#121212",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* App Controls (Left Side) */}
      <DashButton
        icon={icons.menu}
        label="Menu"
        expandable={false}
        onClick={() => console.log("Menu clicked")}
      />

      {/* Spacer */}
      <div style={{ width: "8px" }}></div>

      <DashButton
        icon={icons.refresh}
        label="Refresh"
        onClick={() => console.log("Refresh clicked")}
      />
      <DashButton
        icon={icons.filter}
        label="Filter"
        onClick={() => console.log("Filter clicked")}
      />

      <UploadButton onRefresh={onRefresh} user={user} />

      {/* Spacer to push profile to the right */}
      <div style={{ flexGrow: 1 }}></div>

      {/* Profile Avatar & Dropdown (Right Side) */}
      <ProfileMenu user={user} onLoginClick={onLoginClick} />
    </div>
  );
};

export default Dashboard;
