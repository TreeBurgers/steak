import React from "react";
import { ReactSVG } from "react-svg";
import styled from "styled-components";
import iconUrl from "../utils/iconUrl";

interface IconProps {
	icon:
		| "logo"
		| "twitter"
		| "discord"
		| "border"
		| "vault"
		| "coin"
		| "explore-btn"
		| "dice"
		| "ftx"
		| "digital-eyes"
		| "solonart"
		| "magic-eden"
		| "explore-trait-btn"
		| "tick"
		| "artist"
		| "lead-dev"
		| "marketing-head"
		| "team-layer"
		| "white-dot"
		| "grey-dot"
		| "right-arrow"
		| "dropdown"
		| "dawg"
		| "settings"
		| "treasure-box"
		| "staking-btn"
		| "copy"
		| "staking-import-btn"
		| "unstake-btn"
		| "small-doge"
		| "view_all-btn";
	height?: number;
	width?: number;
	className?: string;
	color?: string;
}

const Icon: React.FC<IconProps> = ({
	height,
	width,
	icon,
	className,
	color,
}) => {
	const iconWidth = () => {
		return width ? `${width}px` : "100%";
	};

	const iconHeight = () => {
		return height ? `${height}px` : "100%";
	};

	const iconColor = () => {
		return color ? `${color}` : "#0f0f0f";
	};

	return (
		<I color={iconColor()} className={`inline-flex items-center ${className}`}>
			<ReactSVG
				beforeInjection={(svg) => {
					svg.setAttribute(
						"style",
						`width: ${iconWidth()};height: ${iconHeight()};`
					);
				}}
				src={iconUrl(icon)}
			/>
		</I>
	);
};

const I = styled.i`
	svg path {
		fill: ${(props) => props.color};
	}
`;
export type { IconProps };

export default Icon;
