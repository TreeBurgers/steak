import { FC,useEffect,useState,useRef } from "react";
import styled from "styled-components";
import { useWallet} from '@solana/wallet-adapter-react';
import {
	WalletModalProvider,
	WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "./css/Wallet.css";
import Navbar from "./Navbar";
import bs58 from 'bs58';
import { SIGN_IN_API, SIGN_OUT_API } from "../utils/ids";
import Cookies from 'universal-cookie';

export const Wallet: FC = () => {

	const flag = useRef(0);
	const [status,setStatus] = useState(false);
	const {publicKey,connected, connecting, wallet ,signMessage} = useWallet()

	async function fetchNonce() {

	  const response = await fetch('https://degen-dao-backend.vercel.app/api/login');
	
	  if(response.status != 200)
		throw new Error("nonce could not be retrieved");

	  const { nonce } = await response.json();

	  const cookies = new Cookies();

	  cookies.set('auth-nonce', nonce, { path: '/' , domain: 'https://degen-dao-backend.vercel.app'});
	  
	  return nonce;

	}
  
	async function login() {

	  if(publicKey){
		
	  const nonce = await fetchNonce();

	  const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
	  const encodedMessage = new TextEncoder().encode(message);

	  let bs58sig;
	  let bs58Pubkey;

	try{

	  const signedMessage = await signMessage!(encodedMessage);

	  bs58sig = bs58.encode(signedMessage);
	  bs58Pubkey = bs58.encode(publicKey.toBytes())

	if(status==false){

	fetch(SIGN_IN_API, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify({"credentials":{ "publicKey": bs58Pubkey, "signature": bs58sig}})
	  }).then((res)=>{

		if(res.status==200){
			setStatus(true);
		}

	  })

	 }

	}catch(e){

		console.log("connected");

 	  }

	 }

	}

	useEffect(()=>{

		if(!connecting && !connected && status==true && wallet?.name!="Ledger"){
		fetch(SIGN_OUT_API,{
			method: 'GET',
			credentials: 'include',
		});
		setStatus(false);
		}

		if(status==false && connected && wallet?.name!="Ledger")
		login();
	
	
		return;

	},[status,connected])




	return (
		<WalletModalProvider>
			<Wrapper>
			<div style={{display:"flex",justifyContent: "space-between"}}>	
				<Navbar/>
				<WalletMultiButton 
					style={{
						height: "30px",
						fontWeight: 600,
						borderRadius: "30px",
						float: "right",
						marginRight: "20px",
					}}
				/>
			</div>	
			</Wrapper>
		</WalletModalProvider>
	);
};

const Wrapper = styled.div`
	width: 100%;
	padding: 10px 10px 20px !important;
	text-align: right;
	margin: auto;
	height: 60px;

	.wallet-adapter-button {
		color: #fff;
		cursor: pointer;
		display: flex;
		align-items: center;
		font-size: 16px;
		height: 40px;
		line-height: 50px;
		margin: 6px 3px 3px 3px;
		height: 62px !important;
		background: linear-gradient(
			237.15deg,
			rgba(173, 0, 255, 0.79) -7.38%,
			rgba(81, 0, 119, 0.79) 97.96%
		) !important;
		box-shadow: -13px 18px 21px rgba(0, 0, 0, 0.31);
		backdrop-filter: blur(4px);
		border-radius: 12px !important;
	}

	.wallet-adapter-button:hover {
		background: #000;
	}
	.wallet-adapter-button-trigger {
		background-color: #4e44ce;
	}

	.wallet-adapter-button:not([disabled]):focus-visible {
		outline-color: white;
	}

	.wallet-adapter-button:not([disabled]):hover {
		background-image: linear-gradient(rgba(0, 0, 0, 0.15) 0 0);
	}

	.wallet-adapter-button[disabled] {
		background: #404144;
		color: #999;
		cursor: not-allowed;
	}

	.wallet-adapter-button-end-icon,
	.wallet-adapter-button-start-icon,
	.wallet-adapter-button-end-icon img,
	.wallet-adapter-button-start-icon img {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.wallet-adapter-button-end-icon {
		margin-left: 8px;
	}

	.wallet-adapter-button-start-icon {
		margin-right: 8px;
	}

	.wallet-adapter-collapse {
		width: 100%;
	}

	.wallet-adapter-dropdown {
		position: relative;
		display: inline-block;
	}

	.wallet-adapter-dropdown-list {
		position: absolute;
		z-index: 99;
		display: grid;
		grid-template-rows: 1fr;
		grid-row-gap: 10px;
		padding: 10px;
		top: 100%;
		right: 0;
		margin: 0;
		list-style: none;
		background: #222333;
		border-radius: 10px;
		box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
		opacity: 0;
		visibility: hidden;
		transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
	}

	.wallet-adapter-dropdown-list-active {
		opacity: 1;
		visibility: visible;
		transform: translateY(10px);
	}

	.wallet-adapter-dropdown-list-item {
		background: #404144;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		border: none;
		outline: none;
		cursor: pointer;
		white-space: nowrap;
		box-sizing: border-box;
		padding: 0 20px;
		width: 100%;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		height: 37px;
		color: white;
	}

	.wallet-adapter-dropdown-list-item:not([disabled]):hover {
		background-image: linear-gradient(rgba(0, 0, 0, 0.15) 0 0);
	}

	.wallet-adapter-modal-collapse-button svg {
		align-self: center;
		fill: #999;
	}

	.wallet-adapter-modal-collapse-button.wallet-adapter-modal-collapse-button-active
		svg {
		transform: rotate(180deg);
		transition: transform ease-in 150ms;
	}

	.wallet-adapter-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		opacity: 0;
		transition: opacity linear 150ms;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1040;
		overflow-y: auto;
	}

	.wallet-adapter-modal.wallet-adapter-modal-fade-in {
		opacity: 1;
	}

	.wallet-adapter-modal-button-close {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 10px;
		right: 10px;
		padding: 10px;
		cursor: pointer;
		background: none;
		border: none;
		border-radius: 6px;
	}

	.wallet-adapter-modal-button-close:focus-visible {
		outline-color: white;
	}

	.wallet-adapter-modal-button-close svg {
		fill: #777;
		transition: fill 200ms ease 0s;
	}

	.wallet-adapter-modal-button-close:hover svg {
		fill: #fff;
	}

	.wallet-adapter-modal-logo {
		max-width: 100%;
	}

	.wallet-adapter-modal-logo-wrapper {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 90px;
		width: 90px;
		border-radius: 50%;
		background: #141515;
		margin-bottom: 10px;
		padding: 12px;
	}

	.wallet-adapter-modal-overlay {
		background: rgba(0, 0, 0, 0.5);
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}

	.wallet-adapter-modal-container {
		display: flex;
		margin: 3rem;
		min-height: calc(100vh - 6rem); /* 100vh - 2 * margin */
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 480px) {
		.wallet-adapter-modal-container {
			margin: 1rem;
			min-height: calc(100vh - 2rem); /* 100vh - 2 * margin */
		}
	}

	.wallet-adapter-modal-wrapper {
		box-sizing: border-box;
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		z-index: 1050;
		max-width: 400px;
		border-radius: 10px;
		background: #2c2d30;
		box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
		font-weight: 600;
		padding: 40px 20px 20px;
		flex: 1;
		background: #111122;
	}

	.wallet-adapter-modal-wrapper .wallet-adapter-button {
		width: 100%;
	}

	.wallet-adapter-modal-wrapper-no-logo {
		padding-top: 30px;
	}

	.wallet-adapter-modal-title {
		font-weight: 600;
		font-size: 34px;
		line-height: 41px;
		margin-bottom: 27px;
		margin-top: 0;
		width: 100%;
		text-align: center;
		color: #ffffff;
	}

	@media (max-width: 374px) {
		.wallet-adapter-modal-title {
			font-size: 26px;
		}
	}

	.wallet-adapter-modal-list {
		margin: 0 0 12px;
		padding: 0;
		width: 100%;
		list-style: none;
	}

	.wallet-adapter-modal-list li:not(:first-of-type) {
		margin-top: 12px;
	}
`;
