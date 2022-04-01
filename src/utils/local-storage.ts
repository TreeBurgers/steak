/*
Codes borrowed from RaydiumUI https://github.com/raydium-io/raydium-ui
Trying to R&D for possiblity of integrating Raydium with my own UI in react
By Christopher K Y Chee ketyung@techchee.com
*/
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {NETWORK} from './ids';

class LocalStorage {
	static get(name: string) {
		return localStorage.getItem(name);
	}

	static set(name: string, val: any) {
		return localStorage.setItem(name, val);
	}
}

export default class ParamStorage {
	static setNetwork(network: WalletAdapterNetwork) {
		
		LocalStorage.set("Network", network);

	}

	static getNetwork(): WalletAdapterNetwork {
		return (
			(
				
			/** LocalStorage.get("Network") */ 
			NETWORK as WalletAdapterNetwork) ?? WalletAdapterNetwork.Mainnet
		);
	}
}

