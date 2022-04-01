import useTokenVault from "./useTokenVault";
import useNFTStaking from "./useNFTStaking";
import { DC_UPDATE_AUTHORITY } from "../utils/ids";
import { NFTMeta, NFTStakeAddr } from "../states";
import { error } from "../utils/Mesg";
import * as web3 from '@solana/web3.js';
import useSolana from './useSolana';
import { STAKE_INDEX_SEED, STAKE_INDEX_DATA_SIZE } from "./useNFTStaking";
import { programId } from '../utils/ids';



export default function useCreateStake() {

    const [, , , readTokenVault] = useTokenVault();

    const [createNFTStake, , , , , currentIndexCount, creating] = useNFTStaking();

	const [connection, publicKey,  , , loading, setLoading, sendTxs] = useSolana();


	async function createIndexAccount (completion : (res: string | Error) => void){

		if ( !publicKey ){

			completion(Error("wallet not connected!"));

			return ;

		}

		const allTxs = new web3.Transaction();


		let indexAccountPubkey = await web3.PublicKey.createWithSeed(publicKey, STAKE_INDEX_SEED, programId);
        // create it if it does NOT exist

        
        if (await connection.getAccountInfo(indexAccountPubkey) == null){


            const rqLp = await connection.getMinimumBalanceForRentExemption(STAKE_INDEX_DATA_SIZE) ;
           
            const createIndexAccTx = new web3.Transaction().add(
                web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: STAKE_INDEX_SEED,
                newAccountPubkey: indexAccountPubkey,
                lamports: rqLp, space: STAKE_INDEX_DATA_SIZE ,programId,
                }),
            );
            
            /*
            const createIndexAccTx = new web3.Transaction().add(
                web3.SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey:  indexAccountPubkey,
                    space: STAKE_INDEX_DATA_SIZE,
                    lamports: rqLp,
                    programId: programId,
                }),
            );*/

            allTxs.add(createIndexAccTx);

        }
		else {

			completion(Error("Index account already exists!"));
			return;
		}


        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completion(res);
                setLoading(false);
    
            }
            else {
    
                console.log("tx.id::" + res);
                completion( res );
                setLoading(false);        
            }
    
        });

	}


   

    async function createStake(m : NFTMeta, nfts : Array<web3.PublicKey> ,completion : (res: boolean | Error, possiblyAlreadyStaked : boolean, stakeKey : web3.PublicKey) => void ){

		await currentIndexCount((res: number | Error) => {
			if (!(res instanceof Error)) {
				readTokenVault(m.mint, (acc: string | Error) => {
					if (!(acc instanceof Error)) {

						let forMonth = m.updateAuthority === DC_UPDATE_AUTHORITY ? 0 : 1;

						createNFTStake(m.mint, forMonth,acc,m.address,nfts,completion);
					} else {
						error("Unable to fetch token vault account", 3);
					}
				});
			} 
			else {
				readTokenVault(m.mint, (acc: string | Error) => {
					let forMonth = m.updateAuthority === DC_UPDATE_AUTHORITY ? 0 : 1;

					if (!(acc instanceof Error)) {
						createNFTStake(m.mint,forMonth,acc,m.address ,nfts,completion);
					} else {
						error("Unable to fetch token vault account", 3);
					}
				});
			}
		});
		
	}


    return [createStake, creating, createIndexAccount] as const; 

}