import React from "react";
import ResponsiveAppBar from "../components/Appbar";
import Forms from "../components/Forms";

export default function Dashboard({ onLogout }) {
  return (
    <div>
      <ResponsiveAppBar onLogout={onLogout} />
      <Forms />
    </div>
  );
}
