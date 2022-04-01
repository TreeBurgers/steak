import settings from "../assets/icons/settings.svg";
import treasureBox from "../assets/icons/treasure-box.svg";
import stakingBtn from "../assets/icons/staking-btn.svg";
import copy from "../assets/icons/copy.svg";
import stakingImportBtn from "../assets/icons/staking-import-btn.svg";
import unstake from "../assets/icons/unstake-btn.svg";
import viewAll from "../assets/icons/view_all-btn.svg";
import logo from "../assets/icons/logo.svg";
import discord from "../assets/icons/discord.svg";
import twitter from "../assets/icons/twitter.svg";
import { IconProps } from "../components/Icon";

const iconUrl = (iconName: IconProps["icon"]) => {
	switch (iconName) {
		case "settings":
			return settings;
		case "treasure-box":
			return treasureBox;
		case "staking-btn":
			return stakingBtn;
		case "staking-import-btn":
			return stakingImportBtn;
		case "unstake-btn":
			return unstake;
		case "view_all-btn":
			return viewAll;
		case "copy":
			return copy;
		case "logo":
			return logo;
		case "discord":
			return discord;
		case "twitter":
			return twitter;
		default:
			return logo;
	}
};

export default iconUrl;
