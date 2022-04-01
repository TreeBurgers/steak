import React from "react";
import { programId } from "../utils/ids";
import ParamStorage from "../utils/local-storage";

export const ViewTxView: React.FC = () => {
	return (
		<div>
			<p>
				<a
					target="_blank"
					rel="noreferrer"
					href={
						"https://solscan.io/account/" +
						programId +
						"?cluster=" +
						ParamStorage.getNetwork()
					}
				>
					View Trasanctions
				</a>
			</p>
		</div>
	);
};
