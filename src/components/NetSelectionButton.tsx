import { FC, useState } from "react";
import styled from "styled-components";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Button, Menu, Dropdown } from "antd";
import { SettingOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import ParamStorage from "../utils/local-storage";
import useSolana from "../hooks/useSolana";

export const NetSelectionButton: FC = () => {
	const [, , changeConnection] = useSolana();

	const [network, setNetwork] = useState<WalletAdapterNetwork>(
		ParamStorage.getNetwork()
	);

	const setNetworkNow = (network: WalletAdapterNetwork) => {
		setNetwork(network);
		ParamStorage.setNetwork(network);
		changeConnection();
	};

	const netSelectionMenu = (
		<Menu
			theme="dark"
			style={{ borderRadius: "20px", textAlign: "left", minWidth: "260px" }}
		>
			<Menu.Item
				style={{ margin: "10px", backgroundColor: "#224" }}
				onClick={() => {
					setNetworkNow(WalletAdapterNetwork.Mainnet);
				}}
			>
				<CheckCircleOutlined
					style={{
						color:
							network === WalletAdapterNetwork.Mainnet ? "#8f5" : "transparent",
						width: "20px",
						height: "20px",
						marginRight: "10px",
					}}
				/>

				{WalletAdapterNetwork.Mainnet.toUpperCase()}
			</Menu.Item>
			<Menu.Item
				style={{ margin: "10px", backgroundColor: "#224" }}
				onClick={() => {
					setNetworkNow(WalletAdapterNetwork.Devnet);
				}}
			>
				<CheckCircleOutlined
					style={{
						width: "20px",
						height: "20px",
						color:
							network === WalletAdapterNetwork.Devnet ? "#8f5" : "transparent",
						marginRight: "10px",
					}}
				/>

				{WalletAdapterNetwork.Devnet.toUpperCase()}
			</Menu.Item>
			<Menu.Item
				style={{ margin: "10px", backgroundColor: "#224" }}
				onClick={() => {
					setNetworkNow(WalletAdapterNetwork.Testnet);
				}}
			>
				<CheckCircleOutlined
					style={{
						width: "20px",
						height: "20px",
						color:
							network === WalletAdapterNetwork.Testnet ? "#8f5" : "transparent",
						marginRight: "10px",
					}}
				/>

				{WalletAdapterNetwork.Testnet.toUpperCase()}
			</Menu.Item>
		</Menu>
	);

	return (
		<Wrapper>
			<Dropdown
				trigger={["click"]}
				overlay={netSelectionMenu}
				placement="bottomCenter"
			>
				<Button
					shape="circle"
					className="flex flex-col items-center justify-center"
					style={{
						marginRight: "20px",
						marginTop: "5px",
						float: "right",
						border: 0,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						width: "35px",
						height: "62px",
						background:
							"linear-gradient( 237.15deg, rgba(173, 0, 255, 0.79) -7.38%,rgba(81, 0, 119, 0.79) 97.96%)",
						cursor: "pointer",
						borderRadius: "12px",
					}}
				>
					<SettingOutlined shape="circle" style={{ color: "white" }} />
				</Button>
			</Dropdown>
		</Wrapper>
	);
};

const Wrapper = styled.div`
	min-width: 80%;
	color: white;

	.ant-modal-content {
		border-radius: 30px;
		background-image: linear-gradient(to right, #001, #235);
		color: white;
	}

	.ant-modal-header {
		border-radius: 30px 30px;
		background-color: transparent;
		color: tomato;
		font-size: 30pt;
		margin: 0 auto;
	}
`;
