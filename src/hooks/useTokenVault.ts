import * as web3 from '@solana/web3.js';
import useToken from './useToken';
import useSolana from './useSolana';
import * as splToken from "@solana/spl-token";
import { PUBKEY_BYTES } from './useSolana';
import { parse_token_vault, TokenVault } from '../states';
import { programId } from '../utils/ids';
import { NFT_TOKEN_VAULT_API } from '../utils/ids';

export const VAULT_STORE_SEED = "VAULT05";

export const VAULT_STORE_SIZE= 1 + ((PUBKEY_BYTES + PUBKEY_BYTES) * 25) ;


export default function useTokenVault(){


    const [connection, publicKey,  , , , setLoading, sendTxs] = useSolana();

    const [findAssociatedTokenAddress, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID] = useToken();



    function createTokenVaultBytes() : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(2);
        newInsArray[0] = 1; // the mod 2 is the staking mod 
        newInsArray[1] = 4; // the second element is the action of creating token vault in token manager
        
        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }

    /**
     * @deprecated The method should not be used, please use readTokenVaultFromApi
     */
    async function readTokenVault(mint : string, 
    pubkey : string |undefined = "D2rZxBmuJ6U1G3dQ1yCrC8gAf1LMmhQhbnTmC4xW4Bmo") : Promise <TokenVault|undefined> {

        let tks = await readTokenVaults(pubkey);
        if (!tks) {

            return;
        }

        var foundTk : TokenVault|undefined ;
    
        tks.map((t)=>{

            if (t.mint.toBase58() === mint){

                foundTk = t; 
            }

        })

        return foundTk;
    }

    /**
     * @deprecated The method should not be used, please use readTokenVaultFromApi
     * will be removed in the future
     */
    async function readTokenVaults(pubkey : string |undefined = "D2rZxBmuJ6U1G3dQ1yCrC8gAf1LMmhQhbnTmC4xW4Bmo") : Promise <Array<TokenVault>|undefined> {


        if ( !publicKey) {

            return ;
        }

        try {

            let vaultAccount = pubkey ? new web3.PublicKey(pubkey) : 
            await web3.PublicKey.createWithSeed(publicKey, VAULT_STORE_SEED, programId);
  
            
            let tkVaults : Array<TokenVault> = [];

            let acc = await connection.getAccountInfo(vaultAccount);
                
            if ( acc != null ){
    
                parse_token_vault(acc.data, (res : Array<TokenVault>  | Error) =>  {
    
                    if (!(res instanceof Error)){
            
                        res.map((tk)=>{

                            tkVaults.push(tk);
                        })

                    }
            
                });
    
                return tkVaults;
        
            }
            else {
    
                return ;
            }
    
    
        }
        catch(err){
            console.log(err);
            return ;

        }
    
    }
  
    /**
     * @deprecated The method should not be used, please use readTokenVaultFromApi
     * will be removed in the future
     */
    async function createTokenVault(mintString : string, 
        mintAccountCallback : (result :web3.PublicKey | undefined )=> void,
        completion : (result : string | Error) => void) {

        if ( !publicKey) {

            return; 
        }


        let mint = new web3.PublicKey(mintString);

        let mintAcc = await findAssociatedTokenAddress(publicKey, mint );

        mintAccountCallback(mintAcc);
        
        //alert("mintAcc.x::"+ mintAcc.toBase58());
       
        const allTxs = new web3.Transaction();
        
        if ( await connection.getAccountInfo(mintAcc) == null ){

            allTxs.add(

                splToken.Token.createAssociatedTokenAccountInstruction(
                    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID,
                    mint,mintAcc,publicKey, publicKey),
    
            );

        
        }
        else {

            completion(Error("Token vault account already exists! "));

            return;
        }


        let vaultAccount = await web3.PublicKey.createWithSeed(publicKey, VAULT_STORE_SEED, programId);
       

        if (await connection.getAccountInfo(vaultAccount) == null){


            const rqLp = await connection.getMinimumBalanceForRentExemption(VAULT_STORE_SIZE) ;


            const createVaultAccTx = new web3.Transaction().add(
                web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: VAULT_STORE_SEED,
                newAccountPubkey: vaultAccount,
                lamports: rqLp, space: VAULT_STORE_SIZE ,programId,
                }),
            );
    
            allTxs.add(createVaultAccTx);

        }
        

        /**
         *  let signer_account = next_account_info(account_info_iter)?; 
        let token_mint = next_account_info(account_info_iter)?;
        let token_account = next_account_info(account_info_iter)?;
        let vault_account = next_account_info(account_info_iter)?;
        let token_program = next_account_info(account_info_iter)?; 
         */
        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true     , isWritable: false },
            { pubkey: mint, isSigner: false, isWritable: false  },
            { pubkey: mintAcc, isSigner: false, isWritable: true },
            { pubkey: vaultAccount, isSigner: false , isWritable: true  },   
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
        ];

        let data = createTokenVaultBytes();

        const createStakeTxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
        allTxs.add(
            new web3.Transaction().add(createStakeTxIns), 
        );


        allTxs.feePayer = publicKey;

        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completion(res);
                setLoading(false);
    
            }
            else {
    

                completion(res);
                setLoading(false);     

            }
    
        });

    }


    async function readTokenVaultFromApi(mint : string,  completionHandler: (result : string | Error )=> void){

        let uri = NFT_TOKEN_VAULT_API + mint; 

       // console.log("uri:", uri);

        try {

            const res = await fetch( uri );

            res.json().then(v=>{
    
                completionHandler(v.account);
                
            })
            .catch((e)=>{
    
                completionHandler(e);
            })
    
        }
        catch(err){

            console.log("e", err);
            completionHandler(Error("Error!"));
        }
    }


    return [createTokenVault, readTokenVaults, readTokenVault, readTokenVaultFromApi] as const;


}
