import { FC, useState, useEffect } from "react";
import useToken from "../hooks/useToken";
import { Spin, Dropdown } from "antd";

export interface TokenImageViewProp {
	uri: string;
}

export const TokenImageView: FC<TokenImageViewProp> = ({ uri }) => {
	const [loaded, setLoaded] = useState(false);

	const [imageUrl, setImageUrl] = useState("");

	const [, , , , , fetchTokenImage] = useToken();

	useEffect(() => {
		fetchTokenImage(uri, (res: string | Error) => {
			if (!(res instanceof Error)) {
				setLoaded(true);
				setImageUrl(res);
			}
		});
	},[imageUrl]);

	const overlay = (
		<div
			style={{
				border: "10px solid #333",
				background: "white",
				maxWidth: "600px",
				height: "600px",
				margin: "auto",
				textAlign: "center",
			}}
		>
			<img src={imageUrl} width={580} height={580} alt="NFT" />
		</div>
	);

	return (
		<span style={{ marginRight: "10px" }}>
			{loaded ? (
				<Dropdown overlay={overlay}>
					<img
						src={imageUrl}
						width={50}
						height={50}
						style={{ borderRadius: "50px" , float:"left", marginRight:"10px"}}
						alt="NFT"
		
					/>
				</Dropdown>
			) : (
				<Spin size="small" />
			)}
		</span>
	);
};
