import React from "react";
import { useRoute } from "wouter";
import "./css/topMenu.css";
import { NetSelectionButton } from "./NetSelectionButton";

export const MenuView: React.FC = () => {
	return (
		<span>
      <div className="desktopMenu">
				<NetSelectionButton />
			</div>
		</span>
	);
};
