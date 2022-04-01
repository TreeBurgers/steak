import * as web3 from "@solana/web3.js";
import useSolana from "./useSolana";
import useToken from "./useToken";
import { NFT_TOKEN_VAULT_FILE_WALLET, programId } from "../utils/ids";
import * as splToken from "@solana/spl-token";
import { NFTStakeAddr } from "../states";
import { parse_sys, Sys,} from "../states";
import useNFTStaking, { STAKE_INDEX_SEED } from "./useNFTStaking";
import { DC_TOKEN_VAULT_OWNER } from "../utils/ids";
import useDcSys from "./useDcSys";
import { TOKEN_PROGRAM_ID , ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from "@solana/wallet-adapter-react";

export default function useWithdrawal() {
	const [connection, publicKey, , , , setLoading, sendTxs] = useSolana();

	const [, , , sysAccountKey] = useDcSys();

	const [findAssociatedTokenAddress, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID] = useToken();

	const [, , indexPubkey] = useNFTStaking();

	const { sendTransaction } = useWallet();

	function createUnstakeBytes(count: number): Buffer {
		const newInsArray: Uint8Array = new Uint8Array(9);
		newInsArray[0] = 2; // the mod 2 is the staking mod
		newInsArray[1] = 4; // the second element is the action in staking
		newInsArray[2] = count;

		const dataBuffer = Buffer.from(newInsArray);

		return dataBuffer;
	}

	async function unstake(
		nftMint: string,
		stakeKey: string,
		pdaAcckey: string,
		vaultTokenAccKey: string,
		nfts : Array<web3.PublicKey>,
		completionHandler: (result: boolean | Error,StakeKey: web3.PublicKey) => void
	) {
		if (!publicKey) {
			return;
		}

		let stakeAccount = new web3.PublicKey(stakeKey);
		let signerTokenAcc = await findAssociatedTokenAddress(
			publicKey,
			new web3.PublicKey(nftMint)
		);

		const allTxs = new web3.Transaction();

		if(await connection.getAccountInfo(signerTokenAcc)==null){
			
		allTxs.add(

			splToken.Token.createAssociatedTokenAccountInstruction(
				ASSOCIATED_TOKEN_PROGRAM_ID,
				TOKEN_PROGRAM_ID,
				new web3.PublicKey(nftMint),
				signerTokenAcc,
				publicKey,
				publicKey
			)

		  )
	   }

		let vaultTokenAccount = new web3.PublicKey(vaultTokenAccKey);
		let pdaAcc = new web3.PublicKey(pdaAcckey);
		let indexAccountPubkey = await web3.PublicKey.createWithSeed(publicKey, STAKE_INDEX_SEED, programId);

		let accounts: Array<web3.AccountMeta> = [
			{ pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
			{ pubkey: stakeAccount, isSigner: false, isWritable: true },
			{ pubkey: indexAccountPubkey, isSigner: false, isWritable: true },
		];

		accounts.push({ pubkey: signerTokenAcc, isSigner: false, isWritable: true },
			{ pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
			{ pubkey: pdaAcc, isSigner: false, isWritable: true },);

		let nftLength =	1;

		if(nfts.length<=20){		
		nfts.map((value)=>{
				if (value.toBase58 () !== web3.PublicKey.default.toBase58() && stakeAccount.toBase58().toString() != value.toBase58().toString())
				accounts.push({pubkey: value?? web3.PublicKey.default, isSigner: false, isWritable: true});
				
		});
		nftLength = nfts.length;
		}

		accounts.push({ pubkey: publicKey, isSigner: true, isWritable: false });

		accounts.push({ pubkey: new web3.PublicKey(NFT_TOKEN_VAULT_FILE_WALLET), isSigner: false, isWritable: true },
		{ pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: true });

		let data = createUnstakeBytes(nftLength);

		const createStakeTxIns = new web3.TransactionInstruction({
			programId,
			keys: accounts,
			data: data,
		});

		allTxs.add(new web3.Transaction().add(createStakeTxIns));

		allTxs.feePayer = publicKey;

		sendTxs(allTxs, (res: string | Error) => {
			if (res instanceof Error) {
				completionHandler(res,stakeAccount);
				setLoading(false);
			} else {
				console.log("tx.id::" + res);
				completionHandler(true,stakeAccount);
				setLoading(false);
			}
		});
	}

	function createWithdrawalBytes(
		count: number
	): Buffer {
		const newInsArray: Uint8Array = new Uint8Array(3);
		newInsArray[0] = 2; // the mod 2 is the staking mod
		newInsArray[1] = 3; // the second element is the action in staking, 3 is for withdrawal
		newInsArray[2] = count;

		const dataBuffer = Buffer.from(newInsArray);

		return dataBuffer;
	}


	function stakedSuppNfts(	nfts: Array<NFTStakeAddr>) : Array<NFTStakeAddr> {

		let sNfts : Array<NFTStakeAddr> = [];

		nfts.map( (value, _index) => {
	
			if (value.nft?.stat === 0 && value.nft?.for_month > 0 ){

				sNfts.push(value);
			}
		});

		return sNfts; 
   }
	

	async function withdraw(nfts: Array<web3.PublicKey>,
		randomBurnInfoCallback: ((result: number) => void) | undefined = undefined,
		completionHandler: (result: string | Error, requireUnstake : boolean) => void) {
		if (!publicKey) {
			completionHandler(Error("! No wallet connected"), false);
			return;
		}

		let sysAccKey = await sysAccountKey(
			new web3.PublicKey(DC_TOKEN_VAULT_OWNER)
		);

		if (!sysAccKey) {
			completionHandler(Error("! Invalid $DC vault account key"), false);
			return;
		}
		//await web3.PublicKey.createWithSeed(publicKey, SYS_SEED, programId);

		let sysAcc = await connection.getAccountInfo(sysAccKey);

		if (sysAcc === null) {
			completionHandler(Error("No $DC token has been created!"), false);
			return;
		}

		setLoading(true);

		parse_sys(sysAcc.data, (res: Sys | Error) => {
			if (res instanceof Error) {
				completionHandler(res, false);

				setLoading(false);
			} else {
				try {
					withdrawing(
						publicKey,
						res,
						nfts,
						randomBurnInfoCallback,
						completionHandler
					);
				} catch (err) {
					console.log("err.x::", err);
					completionHandler(Error("error!"), false);
				}
			}
		});
	}

	
	async function withdrawing(
		signerPubkey: web3.PublicKey,
		sys: Sys,
		nfts: Array<web3.PublicKey>,
		randomBurnInfoCallback: ((result: number) => void) | undefined = undefined,
		completionHandler: (result: string | Error, requireUnstake : boolean) => void
	) {
		let signerDcTokenAcc = await findAssociatedTokenAddress(
			signerPubkey,
			new web3.PublicKey(sys.token_mint)
		);
		

		if ( await connection.getAccountInfo(signerDcTokenAcc) === null ){

			const allTxs = new web3.Transaction();
			// if not, add and instruction of creating the associated token account to
			// web3 transaction to create it 
			  allTxs.add(
  
				  splToken.Token.createAssociatedTokenAccountInstruction(
					  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID,
					  sys.token_mint, signerDcTokenAcc, signerPubkey, signerPubkey),
	  
			  );

			  allTxs.feePayer = signerPubkey;

			  await sendTransaction(allTxs,connection);

	   }

	   	const allTxs = new web3.Transaction();

		let indexAcc = new web3.PublicKey(await indexPubkey());

		let accounts: Array<web3.AccountMeta> = [
			{ pubkey: signerPubkey, isSigner: true, isWritable: false },
			{ pubkey: new web3.PublicKey(sys.token_account), isSigner: false,isWritable: true},
			{ pubkey: new web3.PublicKey(sys.token_pda), isSigner: false, isWritable: true},
			{ pubkey: signerDcTokenAcc, isSigner: false, isWritable: true },
			{ pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
			{ pubkey: indexAcc, isSigner: false, isWritable: true },				
		];

		if(nfts[0]===undefined){
			completionHandler(
				Error("$MILES can be withdrawn only if you have atlest 1 Woofer NFT staked !"), false);
				return;
		}
		
		nfts.map((value)=>{

			if (value.toBase58 () !== web3.PublicKey.default.toBase58())
			accounts.push({pubkey: value?? web3.PublicKey.default, isSigner: false, isWritable: true});

		})	
	

		let random_to_burn = 0;


		if (randomBurnInfoCallback) {
			randomBurnInfoCallback(random_to_burn);
		}

		let data = createWithdrawalBytes(
			nfts.length
		);

	
		const withdrawalIns = new web3.TransactionInstruction({
			programId,
			keys: accounts,
			data: data,
		});

		allTxs.add(new web3.Transaction().add(withdrawalIns));

		allTxs.feePayer = signerPubkey;
		setTimeout(function() {
			sendTxs(allTxs, (res: string | Error) => {
				if (res instanceof Error) {
					completionHandler(res, false);
					setLoading(false);
				} else {
					completionHandler(res, false );
					setLoading(false);
				}
			});
		  }, 1000);
		
	}

	
	return [unstake, withdraw, stakedSuppNfts] as const;
}
