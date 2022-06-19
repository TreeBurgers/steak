import { useMemo, useEffect } from "react";
import { Route, useRoute } from "wouter";
import {
	ConnectionProvider,
	WalletProvider,
} from "@solana/wallet-adapter-react";
import {
	getLedgerWallet,
	getPhantomWallet,
	getSlopeWallet,
	getSolflareWallet,
	getSolletExtensionWallet,
	getSolletWallet,
	getTorusWallet,
} from "@solana/wallet-adapter-wallets";
import { Wallet } from "./components/Wallet";
import ParamStorage from "./utils/local-storage";
import { HomePageView } from "./components/HomePageView";
import Footer from "./components/Footer";

const App = () => {
	// Can be set to 'devnet', 'testnet', or 'mainnet-beta'
	const network = ParamStorage.getNetwork();

	// You can also provide a custom RPC endpoint
	const endpoint = "https://ssc-dao.genesysgo.net/"

	const [matchHome] = useRoute("/");

	const theTitle = () => {
		if (matchHome) {
			return "DDAC NFT staking";
		} else {
			return "NFT staking on the Solana Blockchain";
		}
	};

	// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
	// Only the wallets you configure here will be compiled into your application
	const wallets = useMemo(
		() => [
			getPhantomWallet(),
			getSlopeWallet(),
			getSolflareWallet(),
			getTorusWallet({
				options: { clientId: "Get a client ID @ https://developer.tor.us" },
			}),
			getLedgerWallet(),
			getSolletWallet({ network }),
			getSolletExtensionWallet({ network }),
		],
		[network]
	);

	useEffect(() => {
		document.title = theTitle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theTitle()]);

	return (
		<div className="App">
			<ConnectionProvider endpoint={endpoint}>
				<WalletProvider wallets={wallets} autoConnect>
					<Wallet />	
					<Route path="/">
						<HomePageView />
					</Route>
				</WalletProvider>
				<Footer />
			</ConnectionProvider>
		</div>
	);
};

export default App;
