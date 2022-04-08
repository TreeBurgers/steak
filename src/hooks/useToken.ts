import * as web3 from '@solana/web3.js';
import useSolana from './useSolana';
import * as splToken from "@solana/spl-token";
import { num_to_u64 } from '../states';
import { programs } from '@metaplex/js';
import { programId, DC_UPDATE_AUTHORITY, DC_VALID_FIRST_CREATOR, FIRST_CREATOR_IS_LAST_INDEX } from '../utils/ids';
import { NFTMeta } from '../states';
import { MetaStorage } from '../utils/meta-storage';
import { Metadata as Metadata2 } from '@metaplex-foundation/mpl-token-metadata';

const {metadata : {Metadata}} = programs;

// the metaplex connection, use metaplex's own
// connection instead of the wallet's connection
//const metaConn = new Connection(METAPLEX_CONN_NET);


export default function useToken(){

    const [connection, publicKey,  , , , setLoading, sendTxs] = useSolana();

    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: web3.PublicKey = new web3.PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      );
      

  

    async function findAssociatedTokenAddress(walletAddress: web3.PublicKey, 
        tokenMintAddress: web3.PublicKey): Promise<web3.PublicKey> {
        return (await web3.PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                splToken.TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
            ],
            SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        ))[0];
    }

    // dogefather - Might need to modify to include 355 NFTs 
    
    async function getTokenAccountFor(walletAddress: web3.PublicKey, 
        tokenMintAddress: web3.PublicKey, filterForNFT : boolean = true ) : Promise<web3.PublicKey> {
    
                
            let acc = 
            await connection.getTokenAccountsByOwner(walletAddress, {mint : tokenMintAddress});
    
    
            let pkey = acc.value[0].pubkey;

            if ( filterForNFT) {

                let accountInfo = await connection.getTokenAccountBalance(pkey);

                if (accountInfo.value.amount === "1" && accountInfo.value.decimals === 0 ){

                    return pkey;
                }

                return new web3.PublicKey(""); 
            }
           
            return pkey;

    }


    

    /**
     * 
     * This function is marked deprecated , keeping it here first, will be removed in the 
     * future. This is a very inefficient function using the Metadata.findByOwnerV2
     * which is going through the solana rpc call getProgramAccounts 
     * https://docs.solana.com/developing/clients/jsonrpc-api#getprogramaccounts
     * 
     * Please use getListOfTokenAccountsV3() instead 
     * @deprecated
     * 
     */
    async function getListOfTokenAccountsV2() : 
    Promise <Array<NFTMeta>|undefined>{

        if ( !publicKey){

            return; 
        }

        try {


            const ownedMetadata = await Metadata.findByOwnerV2(connection, publicKey);

            let nftMetas : Array<NFTMeta> = []

           
            ownedMetadata.map((m,_i)=>{

               let creators = m.data.data.creators;

               
               let idx = FIRST_CREATOR_IS_LAST_INDEX ? (creators ? creators.length - 1 : 0) : 0 ;

               
               let firstCreator = creators ? creators[ idx ].address : "";
 
              
               if  (m.data.updateAuthority === DC_UPDATE_AUTHORITY || m.data.updateAuthority=="4RkKLyZDmyXhCNapQYrM2aJf14PvaVqUmG4PcWArDnCX"){

                    let md : NFTMeta = { mint: m.data.mint, updateAuthority : m.data.updateAuthority,
                    firstCreator : firstCreator, uri: m.data.data.uri , address : m.pubkey.toBase58()};

                    nftMetas.push(md);

                           
               }

                     

            })


            MetaStorage.set(nftMetas);

            return nftMetas;
        }
        catch(err){

            console.log("meta.err:x:", err);
        }


    }



    async function getMetadataByMint (mint : web3.PublicKey ) : Promise<NFTMeta>{

        
        const pda = await Metadata2.getPDA(mint);

        const m = await Metadata2.load(connection, pda);

        let creators = m.data.data.creators;

        let firstCreator =  creators? creators[ 0 ].address:"";


        let md : NFTMeta = { mint: m.data.mint, updateAuthority : m.data.updateAuthority,
            firstCreator : firstCreator, uri: m.data.data.uri , address : m.pubkey.toBase58()};

        return md ; 
    }




    async function getListOfTokenAccountsV3() : 
    Promise <Array<NFTMeta>|undefined>{

        if ( !publicKey) {

            return; 
        }



        let pid = splToken.TOKEN_PROGRAM_ID;

        // use getParsedTokenAccountsByOwner instead for easy extracting
        // of token mint 
        const accounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,{programId : pid}
        );
         
       
        let nftMetas : Array<NFTMeta> = []

        try{
 
        for (let i = 0; i < accounts.value.length; i++){

            let pkey = accounts.value[i].pubkey ;
            
            
            let accountInfo = await connection.getTokenAccountBalance(pkey);

           
            if (accountInfo.value.amount === "1" && accountInfo.value.decimals === 0 ){

                let mint = accounts.value[i].account.data.parsed.info.mint;

                let nftmeta = await getMetadataByMint(mint);

                nftMetas.push(nftmeta);

            }
        }
    }
    catch(e){
        console.log("error loading",e)
}

        return nftMetas;
    }

    

    function createTokenIns(amount : number, decimal : number, finalized : number) : Buffer {

        const newInsArray : Uint8Array = new Uint8Array(19);
        newInsArray[0] = 1; // the mod 1 is the token minting 
        newInsArray[1] = 1; // the second element is the action in token minting
        
        var offset = 2 ;

        let abytes = num_to_u64(amount);

        for (var r=0; r < abytes.length; r++){

            newInsArray[offset+r] = abytes[r];
        }

        offset += abytes.length; 

        let dbytes = num_to_u64(decimal);

        for (var r=0; r < dbytes.length; r++){

            newInsArray[offset+r] = dbytes[r];
        }

        offset += dbytes.length; 

        newInsArray[offset] = finalized; 

        const dataBuffer = Buffer.from(newInsArray);

        return dataBuffer;
       
    }

    function randomSeed() : string {

        let seed = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + s4() + s4();
        }

        return seed(); 
    }
 

    async function createTokenAcc (walletAddress: web3.PublicKey, 
        tokenMintAddress: web3.PublicKey, filterForNFT : boolean = true ,
         completionHandler: (result : boolean | Error )=> void) {

            const allTxs = new web3.Transaction();
            let mintAcc = await findAssociatedTokenAddress(walletAddress, tokenMintAddress);

            //await getTokenAccountFor(publicKey, mint);
    
            
    
            if ( await connection.getAccountInfo(mintAcc) == null ){
    
                allTxs.add(
    
                    splToken.Token.createAssociatedTokenAccountInstruction(
                        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID,
                        tokenMintAddress,mintAcc,walletAddress, new web3.PublicKey("6dWYBATRHmnqn73WwAVnWgUYPniB5HJt8vzXbdTcBJfJ")),
        
                );

                allTxs.feePayer = new web3.PublicKey("6dWYBATRHmnqn73WwAVnWgUYPniB5HJt8vzXbdTcBJfJ");


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
            else {
    
                console.log("mintAcc.already.exists!::", mintAcc.toBase58());
            }


        }
  
   
    async function createToken (amount : number, decimal : number, finalized : number  , 
        completionHandler: (result : boolean | Error )=> void) {

        if (!publicKey){
            completionHandler(new Error("No wallet connected"));
            return; 
        }

      
        setLoading(true);

        const allTxs = new web3.Transaction();

        const tkSeed = "TK" + randomSeed();

        //const mint = web3.Keypair.generate().publicKey;//.toBase58();
        const mint = await web3.PublicKey.createWithSeed(publicKey, tkSeed, splToken.TOKEN_PROGRAM_ID);
       

        allTxs.add(

            web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey : publicKey,
                seed: tkSeed,
                newAccountPubkey: mint,
                space: splToken.MintLayout.span,
                lamports: await splToken.Token.getMinBalanceRentForExemptMint(connection),
                programId: splToken.TOKEN_PROGRAM_ID,
            }),

            /** 
             web3.SystemProgram.createAccount({
                fromPubkey: publicKey,
                newAccountPubkey: mint,
                space: splToken.MintLayout.span,
                lamports: await splToken.Token.getMinBalanceRentForExemptMint(connection),
                programId: splToken.TOKEN_PROGRAM_ID,
              }),
             */

            splToken.Token.createInitMintInstruction(
                splToken.TOKEN_PROGRAM_ID, // program id,
                mint, // mint public key
                decimal, // decimals
                publicKey, // mint authority
                publicKey // freeze authority
            ),

        );


        let mintAcc = await findAssociatedTokenAddress(publicKey, mint);

        //await getTokenAccountFor(publicKey, mint);

        

        if ( await connection.getAccountInfo(mintAcc) == null ){

            allTxs.add(

                splToken.Token.createAssociatedTokenAccountInstruction(
                    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, splToken.TOKEN_PROGRAM_ID,
                    mint,mintAcc,publicKey, publicKey),
    
            );
        
        }
        else {

            console.log("mintAcc.already.exists!::", mintAcc.toBase58());
        }



        let accounts : Array<web3.AccountMeta> = [
            { pubkey: publicKey, isSigner: true   , isWritable: false },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: mintAcc, isSigner: false, isWritable: true },
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false , isWritable: false  },
        ];


        let data = createTokenIns(amount, decimal, finalized);

        const createTokenTxIns = new web3.TransactionInstruction({
            programId, keys: accounts, data: data, });
        
        allTxs.add(
            new web3.Transaction().add(createTokenTxIns), 
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


    async function fetchTokenImage ( uri : string,  completionHandler: (result : string | Error )=> void) {

        const res = await fetch(uri);

        res.json().then(v=>{

            completionHandler(v.image);
        })
        .catch((e)=>{

            completionHandler(e);
        })

    }


    async function loadMetadata ( metaKey : web3.PublicKey, completionHandler : (result : string | Error)=> void){

        let meta = await Metadata2.load(connection, metaKey);
        completionHandler( meta.data.data.uri); 

    }

    return [findAssociatedTokenAddress, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,createToken, getTokenAccountFor, 
        getListOfTokenAccountsV3, fetchTokenImage, loadMetadata, getListOfTokenAccountsV2,createTokenAcc,getMetadataByMint] as const;


}