import * as web3 from '@solana/web3.js';
import useSolana from './useSolana';
import * as splToken from "@solana/spl-token";
import { num_to_u32, num_to_u64, Sys } from '../states';
import { PUBKEY_BYTES} from './useSolana';
import { tryToGetPubkey } from '../utils/funcs';
import { parse_sys } from '../states';
import useToken from './useToken';
import { programId } from '../utils/ids';


export const SYS_ACC_DATA_SIZE : number = PUBKEY_BYTES + PUBKEY_BYTES + PUBKEY_BYTES + 8;

export const SYS_SEED = "ARCESCROW03";


export default function useDcSys() {

    const [connection, publicKey,  , , , setLoading, sendTxs] = useSolana();

    const [findAssociatedTokenAddress, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID] = useToken();

    function createSysBytes() : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(2);
        newInsArray[0] = 1; // the mod 2 is the staking mod 
        newInsArray[1] = 2; // the second element is the action of creating sys in token manager
        
        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }
  

    async function createSys(tokenMint : string, 
        tokenAccountCallback : (result : string) => void,
        completionHandler: (result : boolean | Error )=> void) {

        if (!publicKey){
            completionHandler(new Error("No wallet connected"));
            return; 
        }

        setLoading(true);

        const allTxs = new web3.Transaction();

       
        let sysAccKey = await web3.PublicKey.createWithSeed(publicKey, SYS_SEED, programId);
    
        if ( await connection.getAccountInfo(sysAccKey) == null ){

            const acLp = await connection.getMinimumBalanceForRentExemption(SYS_ACC_DATA_SIZE) ;

            const createSysAccTx = new web3.Transaction().add(
                web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: SYS_SEED,
                newAccountPubkey: sysAccKey,
                lamports: acLp, space: SYS_ACC_DATA_SIZE ,programId,
                }),
            );

            allTxs.add(createSysAccTx);
        }
        else {

            setLoading(false);
            completionHandler(new Error("System account already exists"));
            return;

        }


        let mintPubkey = tryToGetPubkey(tokenMint);

        if (!mintPubkey){

            setLoading(false);
            completionHandler(new Error("Invalid mint"));
            return; 
    
        }
                    

        let tokenAccount = await findAssociatedTokenAddress(publicKey, mintPubkey );

        if (!tokenAccount){

            setLoading(false);
            completionHandler(new Error("Invalid token mint account"));
            return; 
        }

        tokenAccountCallback(tokenAccount.toBase58());
        

        if ( await connection.getAccountInfo(tokenAccount) == null ){

            allTxs.add(

                splToken.Token.createAssociatedTokenAccountInstruction(
                    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID,
                    mintPubkey,tokenAccount,publicKey, publicKey),
    
            );

          //  console.log("yes.going to create associated token acc!");
        
        }


        let pdaAccount = await web3.PublicKey.findProgramAddress([new TextEncoder().encode("arcescrow")], programId);

        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true     , isWritable: false },
            { pubkey: sysAccKey, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: mintPubkey, isSigner: false , isWritable: false  },    
            { pubkey: pdaAccount[0], isSigner: false , isWritable: true  },    
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
      
        ];


        let data = createSysBytes();

        const createStakeTxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
        allTxs.add(
            new web3.Transaction().add(createStakeTxIns), 
        );

        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res);
                setLoading(false);
    
            }
            else {
    

                console.log("tx.id::" + res);
                completionHandler(true);
                setLoading(false);        
            }
    
        });

    }


    async function readSys( completionHandler: (result : Sys | Error )=> void){

        if ( !publicKey ){

            completionHandler(new Error("Wallet not connected!"));
            return; 

        }

        let sysAccKey = await web3.PublicKey.createWithSeed(publicKey, SYS_SEED, programId);

        let sysAcc = await connection.getAccountInfo(sysAccKey) ;
        
        if (sysAcc === null ){

            completionHandler(new Error("System account does NOT exist yet, please create the system account first"));
            return;       
        }


        parse_sys(sysAcc.data, (res : Sys | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res);

                setLoading(false);
    
            }
            else {
                
                completionHandler(res);
            }
    
        });



    }


    async function sysAccountKey(pubKey : web3.PublicKey) : Promise<web3.PublicKey> {

        let sysAccKey = await web3.PublicKey.createWithSeed(pubKey, SYS_SEED, programId);
        return sysAccKey;

    }

    async function txDcTokenToSys(
        amount : number, decimal : number,  
        completionHandler: (result : boolean | Error )=> void) {

        if (!publicKey){
            completionHandler(new Error("No wallet connected"));
            return; 
        }

        let sysAccKey = await web3.PublicKey.createWithSeed(publicKey, SYS_SEED, programId);

        let sysAcc = await connection.getAccountInfo(sysAccKey) ;
        
        if (sysAcc == null ){

            completionHandler(new Error("System account does NOT exist yet, please create the system account first"));
            return; 
      
        }

        parse_sys(sysAcc.data, (res : Sys | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res);

                setLoading(false);
    
            }
            else {
                txToken(res, amount, decimal ,completionHandler);
            }
    
        });

    }



    function createTxTokenIns(amount : number, decimal : number) : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(19);
        newInsArray[0] = 1; // the mod 1 is the token minting 
        newInsArray[1] = 3; // the second element is the action 3  is tx token
        var offset = 2 ;

        let abytes = num_to_u64(amount);

        for (var r=0; r < abytes.length; r++){

            newInsArray[offset+r] = abytes[r];
        }

        offset += abytes.length; 

        let dbytes = num_to_u32(decimal);

        for (var r=0; r < dbytes.length; r++){

            newInsArray[offset+r] = dbytes[r];
        }

        offset += dbytes.length; 

        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }


    async function txToken (sys : Sys, amount : number, decimal : number ,
        completionHandler: (result : boolean | Error )=> void) {

        if (!publicKey){ return }

        const allTxs = new web3.Transaction();

        /**
        let signer_account = next_account_info(account_info_iter)?;
        let signer_token_account = next_account_info(account_info_iter)?; 
        let sys_token_account = next_account_info(account_info_iter)?;
        let sys_token_pda = next_account_info(account_info_iter)?;
        let token_program = next_account_info(account_info_iter)?;
        */

        let tokenAccount = sys.token_account;


        if (!tokenAccount){

            completionHandler(new Error("Invalid Token Account !"));
          
            return; 
        }

        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true     , isWritable: false },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: sys.token_pda, isSigner: false , isWritable: true  },  
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
         
        ];

        let data = createTxTokenIns(amount, decimal);

        const TxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
       
        allTxs.add(
            new web3.Transaction().add(TxIns), 
        );

        allTxs.feePayer = publicKey;


        sendTxs(allTxs, (res : string | Error) =>  {

            if (res instanceof Error){
    
                completionHandler(res);
                setLoading(false);
    
            }
            else {
    
                console.log("tx.token.id::" + res);
                completionHandler(true);
                setLoading(false);        
            }
    
        });

    }


    return [createSys, txDcTokenToSys, readSys,  sysAccountKey] as const;



}