import { useState } from "react";
import DashButton from "./DashButton";
import UploadButton from "./UploadButton";

const Dashboard = ({ onRefresh }) => {
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
    search: (
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        search
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
      }}
    >
      <DashButton
        icon={icons.menu}
        label="Menu"
        expandable={false}
        onClick={() => console.log("Menu clicked")}
      />

      {/* Spacer to push Menu slightly away from the action buttons if desired, or just leave gap */}
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
      <DashButton
        icon={icons.search}
        label="Search"
        onClick={() => console.log("Search clicked")}
      />

      <UploadButton onRefresh={onRefresh} />
    </div>
  );
};

export default Dashboard;
