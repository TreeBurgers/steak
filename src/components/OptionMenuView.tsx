import { FC, useState } from "react";
import { Button } from "antd";
import "./css/OptionMenuView.css";
import { ViewType, ViewTypeProps } from "./forms/TokenForm";

export const OptionMenuView: FC<ViewTypeProps> = ({ setViewType }) => {
	const [currentViewType, setCurrentViewType] = useState(ViewType.StakingForm);

	return (
		<div style={{ marginTop: "30px" }}>
			<p>
				<Button
					type="primary"
					className={
						currentViewType === ViewType.StakingForm
							? "menuButtonSel"
							: "menuButton"
					}
					title="Stake Your NFT"
					onClick={() => {
						setViewType(ViewType.StakingForm);
						setCurrentViewType(ViewType.StakingForm);
					}}
				>
					Stake Your NFT
				</Button>

				<Button
					type="primary"
					className={
						currentViewType === ViewType.StakingList
							? "menuButtonSel"
							: "menuButton"
					}
					onClick={() => {
						setViewType(ViewType.StakingList);
						setCurrentViewType(ViewType.StakingList);
					}}
				>
					Your Staking List
				</Button>
			</p>
		</div>
	);
};
