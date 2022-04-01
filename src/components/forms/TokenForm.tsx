import { FC, useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { SelectValue } from "antd/lib/select";
import "../css/common.css";
import useToken from "../../hooks/useToken";

export enum ViewType {
	Menu,

	TokenForm,

	TokenVaultForm,

	StakingForm,

	StakingList,

	SysForm,

	DCTokenTxForm,
}

export interface ViewTypeProps {
	setViewType: (viewType: ViewType) => void;
}

export const TokenForm: FC<ViewTypeProps> = ({ setViewType }) => {
	const { Option } = Select;

	const [tokenCount, setTokenCount] = useState(0);

	const [decimal, setDecimal] = useState(0);

	const [finalized, setFinalized] = useState(0);

	const completion = (res: boolean | Error) => {
		if (res instanceof Error) {
			alert(res.message);
		} else {
			alert("Success!");
		}
	};

	const [, , createToken] = useToken();

	const tokenCountOnChange = (e: React.FormEvent<HTMLInputElement>): void => {
		let txt = e.currentTarget.value;
		let v = parseInt(txt);

		setTokenCount(v);
	};

	const decimalOnChange = (value: SelectValue): void => {
		let txt = value?.toString() ?? "0";
		let v = parseInt(txt);

		setDecimal(v);
	};

	const finalizedOnChange = (value: SelectValue): void => {
		let txt = value?.toString() ?? "0";
		let v = parseInt(txt);

		setFinalized(v);
	};

	return (
		<div>
			<br />
			<p style={{ fontWeight: "bolder", fontSize: "12pt" }}>Mint Token</p>
			<Form layout="vertical" style={{ color: "white" }}>
				<Form.Item
					label={<label style={{ color: "white" }}>Token Count</label>}
					required
				>
					<Input
						placeholder="Token Count"
						style={{ maxWidth: "600px" }}
						onChange={tokenCountOnChange}
					/>
				</Form.Item>

				<Form.Item
					label={
						<label style={{ color: "white" }}>
							Decimal (NFT is 0 max is 9)
						</label>
					}
					required
				>
					<Select
						style={{ maxWidth: "200px" }}
						defaultValue=""
						placeholder="Decimal"
						onChange={decimalOnChange}
					>
						<Option value="0">NFT (0)</Option>
						<Option value="1">1</Option>
						<Option value="2">2</Option>
						<Option value="3">3</Option>
						<Option value="4">4</Option>
						<Option value="5">5</Option>
						<Option value="6">6</Option>
						<Option value="7">7</Option>
						<Option value="8">8</Option>
						<Option value="9">9</Option>
					</Select>
				</Form.Item>

				<Form.Item
					label={<label style={{ color: "white" }}>Finalized</label>}
					required
				>
					<Select
						style={{ maxWidth: "200px" }}
						placeholder="Finalized"
						defaultValue="1"
						onChange={finalizedOnChange}
					>
						<Option value="1">YES</Option>
						<Option value="0">NO</Option>
					</Select>
				</Form.Item>
			</Form>

			<Button
				className="submitButton"
				onClick={async () => {
					await createToken(tokenCount, decimal, finalized, completion);
				}}
			>
				Submit
			</Button>

			<Button
				className="cancelButton"
				onClick={() => {
					setViewType(ViewType.Menu);
				}}
			>
				Cancel
			</Button>
		</div>
	);
};
