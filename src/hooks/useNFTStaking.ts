import * as web3 from '@solana/web3.js';
import useSolana from './useSolana';
import {PUBKEY_BYTES} from './useSolana';
import * as splToken from "@solana/spl-token";
import { Index  , parse_index, NFTStake, parse_nft_stake2, NFTStakeAddr,} from '../states';
import useToken from './useToken';
import { tryToGetPubkey } from '../utils/funcs';
import { format_pub_key_shorter2 } from '../utils/funcs';
import { programId } from '../utils/ids';
import { NFT_TOKEN_VAULT_FILE_WALLET } from '../utils/ids';
import { TOKEN_PROGRAM_ID , ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';


export const STAKE_INDEX_SEED = "ST_IDX_SEED_09";

export const STAKE_INDEX_DATA_SIZE = PUBKEY_BYTES + 8 + 1 +  1 +  (PUBKEY_BYTES * 25) ;

export const STAKE_ACCOUNT_DATA_SIZE = //PUBKEY_BYTES + PUBKEY_BYTES + 1 + PUBKEY_BYTES + 8 + 8 + 8 + 8 + 1;

PUBKEY_BYTES + PUBKEY_BYTES + 1 + PUBKEY_BYTES + PUBKEY_BYTES + 8 + 8 + 8 + 8 + 1 + 8 + PUBKEY_BYTES + PUBKEY_BYTES;


export const REWARD_BASED_ON_TIME : number = 8.64e7; //30000;//8.64e7; //30;

export default function useNFTStaking(){

    const [connection, publicKey,  , , loading, setLoading, sendTxs] = useSolana();

    const [findAssociatedTokenAddress,SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,,getTokenAccountFor] = useToken();


    function createStakeNFTBytes(length : number) : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(9);
        newInsArray[0] = 2; // the mod 2 is the staking mod 
        newInsArray[1] = 1; // the second element is the action in staking
        newInsArray[2] = length; // the 3rd is the month

        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }
    
   

    async function stakeIndexPubkey() : Promise<string> {

        if (!publicKey){

            return ""; 
        }

       //change first arg of createWithSeed to see all the staked NFTs by the pubkey

        let k = (await web3.PublicKey.createWithSeed(publicKey, STAKE_INDEX_SEED, programId)).toBase58();

        return k ;

    }


    async function readAllNFTs( addresses : Array<web3.PublicKey>) : Promise<Array<NFTStakeAddr>>{

        let nfts : Array<NFTStakeAddr> = [];

        addresses.map (async (a, i)=>{

            await readNftStake(a.toBase58(), (res : NFTStake |Error)=>{


                if ( !(res instanceof Error)){

                    let stake = new NFTStakeAddr({ address: a, nft: res });
                    nfts.push(stake);

                }

                
            });

        })

        return nfts; 

    }


    async function readNftStake( pubkey : string, completionHandler : (result : NFTStake | Error) => void  ){


        setLoading(true);
        
        let Pkey = new web3.PublicKey(pubkey) ;

        //pkey is the stake account pubkey

        try {

            let acc = await connection.getAccountInfo(Pkey);
            
            if ( acc != null ){

                parse_nft_stake2(acc.data, (res : NFTStake | Error) =>  {

                    if (res instanceof Error){
            
                        completionHandler(res);
                        setLoading(false);
            
                    }
                    else {
                        completionHandler(res);
                        setLoading(false);        
                    }
            
                });

                setLoading(false);
        
            }
            else {

                completionHandler(new Error("Account not found"));
                setLoading(false);
            }
        }
        catch( e  ){

            if (e instanceof Error){

                completionHandler(e);
          
            }
            
            setLoading(false);
        }
       
        
    }


    async function currentIndexCount( completion : (res: number | Error) =>void ){

        setLoading(true);

        let pkey = await stakeIndexPubkey();

        await readIndex(pkey, (res : Index | Error) =>{

            if (res instanceof Error){

                completion(res);
            }

            //console.log("res.nfts.length::", res.nfts.length);

            if ( res instanceof Index){

                completion( res.nfts.length );
            }
        
        }, false );

        
    }

    async function readIndex(pubkey : string,
        completionHandler : (result : Index | Error) => void, 
        setLoadingWhenCompleted : boolean = true   ){

        if (setLoadingWhenCompleted)
            setLoading(true);

        
        let idxPkey = new web3.PublicKey(pubkey) ;
        
        try {

            let acc = await connection.getAccountInfo(idxPkey);
            
            if ( acc != null ){

                parse_index(acc.data, (res : Index | Error) =>  {

                    if (res instanceof Error){
            
                        completionHandler(res);
                        if (setLoadingWhenCompleted )
                            setLoading(false);

            
                    }
                    else {
            
                        completionHandler(res);
                        if (setLoadingWhenCompleted )
                             setLoading(false);        
                    }
            
                });

                if (setLoadingWhenCompleted )
                    setLoading(false);
        
            }
            else {

                completionHandler(new Error("Account not found"));
               
                if (setLoadingWhenCompleted )
                    setLoading(false);
            }
        }
        catch( e  ){

            if (e instanceof Error){

                completionHandler(e);
          
            }
            if (setLoadingWhenCompleted )
                setLoading(false);
        }
        
        
    
    }


    function createRestakeBytes(for_month : number) : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(9);
        newInsArray[0] = 2; // the mod 2 is the staking mod 
        newInsArray[1] = 5; // the second element is the action in staking
        newInsArray[2] = for_month; // the 3rd is the month

        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }

    async function restake (nft_mint : string, for_month : number , 
        token_vault_acc : string, nfts : Array<web3.PublicKey> ,completionHandler: (result : boolean | Error , stakeKey : web3.PublicKey)=> void) {

        if (!publicKey){
            completionHandler(new Error("No wallet connected"), new web3.PublicKey(""));
            return; 
        }

      
        setLoading(true);
    
        let lastSeed = format_pub_key_shorter2(nft_mint);

        let stakeAccKey = await web3.PublicKey.createWithSeed(publicKey, lastSeed, programId);

        const allTxs = new web3.Transaction();
        
        if ( await connection.getAccountInfo(stakeAccKey) == null ){

            setLoading(false);
            completionHandler(new Error("Invalid stake account!"), new web3.PublicKey(""));
            return;

        }


        let indexAccountPubkey = await web3.PublicKey.createWithSeed(publicKey, STAKE_INDEX_SEED, programId);

        let tokenVaultAccKey = tryToGetPubkey(token_vault_acc) ?? web3.PublicKey.default;

        let nftMintPubkey = tryToGetPubkey(nft_mint);

        if (!nftMintPubkey){

            setLoading(false);
            completionHandler(new Error("Invalid mint"), new web3.PublicKey(""));
            return; 
    
        }
                    
        let nftTokenAccount = 
        await getTokenAccountFor(publicKey, nftMintPubkey, true );

        

        // return error if account not found !
        if (!nftTokenAccount || await connection.getAccountInfo(nftTokenAccount) == null ){
  
            setLoading(false);
            completionHandler(new Error("Invalid NFT token mint account"), new web3.PublicKey(""));
            return; 
    
        }
          
        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true , isWritable: false },
            { pubkey: nftTokenAccount, isSigner: false , isWritable: true  },   
            { pubkey: tokenVaultAccKey, isSigner: false , isWritable: true  }, 
            { pubkey: new web3.PublicKey(NFT_TOKEN_VAULT_FILE_WALLET), isSigner: false , isWritable: true  }, 
            { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: true },  
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
            { pubkey: indexAccountPubkey, isSigner: false , isWritable: true  },
            { pubkey: stakeAccKey, isSigner: false , isWritable: true  },
        ];

        nfts.map((value)=>{
            if (value.toBase58 () !== web3.PublicKey.default.toBase58() && stakeAccKey.toBase58().toString() != value.toBase58().toString())
			accounts.push({pubkey: value?? web3.PublicKey.default, isSigner: false, isWritable: true});
        })

        let data = createRestakeBytes(nfts.length);

        const restakeTxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
        allTxs.add(
            new web3.Transaction().add(restakeTxIns), 
        );

        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res, new web3.PublicKey(""));
                setLoading(false);
    
            }
            else {
    

                console.log("tx.id::" + res);
                completionHandler(true, stakeAccKey);
                setLoading(false);        
            }
    
        });

    }

    async function createNFTStake (nft_mint : string, for_month : number , 
        token_vault_acc : string, metadata_key : string, nfts : Array<web3.PublicKey>,
        completionHandler: (result : boolean | Error, 
            possiblyAlreadyStaked : boolean , StakeKey : web3.PublicKey)=> void) {

        if (!publicKey){
            completionHandler(new Error("No wallet connected"), false, new web3.PublicKey(""));
            return; 
        }
      
        setLoading(true);
    
        let lastSeed = format_pub_key_shorter2(nft_mint);


        let stakeAccKey = await web3.PublicKey.createWithSeed(publicKey, lastSeed, programId);
    

        const allTxs = new web3.Transaction();

        
        if ( await connection.getAccountInfo(stakeAccKey) == null ){

            const acLp = await connection.getMinimumBalanceForRentExemption(STAKE_ACCOUNT_DATA_SIZE) ;

            const createNFTAccTx = new web3.Transaction().add(
                web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: lastSeed,
                newAccountPubkey: stakeAccKey,
                lamports: acLp, space: STAKE_ACCOUNT_DATA_SIZE ,programId,
                }),
            );

            allTxs.add(createNFTAccTx);
        }


        let tokenVaultAccKey = tryToGetPubkey(token_vault_acc) ?? web3.PublicKey.default;

        let nftMintPubkey = tryToGetPubkey(nft_mint);

        if (!nftMintPubkey){

            setLoading(false);
            completionHandler(new Error("Invalid mint"), false, new web3.PublicKey(""));
            return; 
    
        }


       // let destTokenAcc = await findAssociatedTokenAddress(publicKey, new web3.PublicKey(nft_mint));
                    
        let nftTokenAccount = await getTokenAccountFor(publicKey, nftMintPubkey, true );

         // return error if account not found !
        if (!nftTokenAccount || await connection.getAccountInfo(nftTokenAccount) == null ){
  
             setLoading(false);

             completionHandler(new Error("invalid token mint account or you've already staked!"), true , new web3.PublicKey(""));

             return;
           
        }

        
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

            allTxs.add(createIndexAccTx);

        }

        let metaAccount = new web3.PublicKey(metadata_key);

        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true , isWritable: false },
            { pubkey: nftMintPubkey, isSigner: false, isWritable: false },
            { pubkey: nftTokenAccount, isSigner: false , isWritable: true  },   
            { pubkey: tokenVaultAccKey, isSigner: false , isWritable: true  },   
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
            { pubkey: indexAccountPubkey, isSigner: false , isWritable: true  }, 
            { pubkey: metaAccount, isSigner: false , isWritable: true  }, 
            { pubkey: new web3.PublicKey(NFT_TOKEN_VAULT_FILE_WALLET), isSigner: false , isWritable: true  }, 
            { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: true },   
            { pubkey: stakeAccKey, isSigner: false , isWritable: true },
        ];

        nfts.map((value)=>{
            if (value.toBase58 () !== web3.PublicKey.default.toBase58() && stakeAccKey.toBase58().toString() != value.toBase58().toString())
			accounts.push({pubkey: value?? web3.PublicKey.default, isSigner: false, isWritable: true});
        })

        let data = createStakeNFTBytes(nfts.length);

        const createStakeTxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
        allTxs.add(
            new web3.Transaction().add(createStakeTxIns), 
        );

        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res, false,stakeAccKey);
                setLoading(false);
    
            }
            else {
    
                console.log("tx.id::" + res);
                completionHandler(true, false,stakeAccKey);
                setLoading(false);        
            }
    
        });



        
    }


    function calculateTokenEarned( dateStaked : Date | undefined, rate : number, 
        initialReward : number = 0, 
        upToDate : Date = new Date() ) : number{

        let diff = upToDate.getTime() - (dateStaked?.getTime() ?? upToDate.getTime());

        let msPerDay = REWARD_BASED_ON_TIME;

        return (( diff * rate ) / msPerDay) + initialReward;

    }



    return [createNFTStake, readIndex, stakeIndexPubkey, 
        readNftStake, calculateTokenEarned, currentIndexCount, 
        loading, setLoading, restake, readAllNFTs] as const;

}