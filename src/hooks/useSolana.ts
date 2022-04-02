import * as web3 from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import ParamStorage from "../utils/local-storage";
import { createGlobalState } from "react-hooks-global-state";

export const PUBKEY_BYTES: number = 32;

const initialState = {
	connection: new web3.Connection(
		"https://lively-frosty-morning.solana-mainnet.quiknode.pro/ecfe4cce4da785522a49d2657f04128a232fd298/",
		"confirmed"
	),
};
const { useGlobalState } = createGlobalState(initialState);

export default function useSolana() {
	const [connection, setConnection] = useGlobalState("connection");

	// the connected wallet pubkey
	const { publicKey, sendTransaction, wallet } = useWallet();

	const [loading, setLoading] = useState(false);

	async function changeConnection() {
		setConnection(
			new web3.Connection(
				"https://lively-frosty-morning.solana-mainnet.quiknode.pro/ecfe4cce4da785522a49d2657f04128a232fd298/",
				"confirmed"
			)
		);
	}

	async function sendTxs(
		transactions: web3.Transaction,
		completionHandler: (result: string | Error) => void
	) {
		await sendTransaction(transactions, connection)
			.then((value) => {
				connection
					.confirmTransaction(value, "processed")
					.then((_) => {
						completionHandler("success!");
						setLoading(false);
					})
					.catch((err) => {
						completionHandler(err);
						setLoading(false);
					});
			})
			.catch((err) => {
				completionHandler(err);
				setLoading(false);
			});
	}

	async function sendIns(
		keys: Array<web3.AccountMeta>,
		programId: web3.PublicKey,
		data: Buffer,
		completionHandler: (result: string | Error) => void
	) {
		const instruction = new web3.TransactionInstruction({
			programId,
			keys: keys,
			data: data,
		});

		const transaction = new web3.Transaction().add(instruction);

		await sendTransaction(transaction, connection)
			.then((value) => {
				connection
					.confirmTransaction(value, "processed")
					.then((_) => {
						completionHandler("success!");
						setLoading(false);
					})
					.catch((err) => {
						completionHandler(err);
						setLoading(false);
					});
			})
			.catch((err) => {
				completionHandler(err);
				setLoading(false);
			});
	}

	return [
		connection,
		publicKey,
		changeConnection,
		sendIns,
		loading,
		setLoading,
		sendTxs,
		wallet,
	] as const;
}
