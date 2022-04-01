import * as web3 from '@solana/web3.js';

export const FIRST_CREATOR_IS_LAST_INDEX = false ;//false; // change to false for mainnet as it's the first index 
                                                // instead of last


export const NETWORK = "mainnet-beta";

export const programId : web3.PublicKey = 

new web3.PublicKey("ARGxFPMh96v1kELhASJvvz8Qhc5FXQZQ8XiiDgPdupvR");

// for $DAWG token 
export const DC_TOKEN_DECIMAL = 6; 

export const DC_TOKEN_MINT = "ARCtXLM9CEDfhCt1XeTXgKNqhSaqbeMKdJmhBdXNyF4g";

//"9QKHcZihXMdBgYdrWgqXCP6o6GWWb9ttsqS7WXSVuJZ8";

// This is the wallet address that created the $DAWG token vault
export const DC_TOKEN_VAULT_OWNER = "BkjAhuC9FSMoY9foVMXW9niZXPEfnh47icnniVYLsYSk";


// NFT token vault API URI
export const NFT_TOKEN_VAULT_API = "https://arcryptian-backend.vercel.app/api/tokenvault?mint=";

export const NFT_TOKEN_VAULT_FILE_WALLET = "61pT9d8pdYDfTyVN8kerxa2AS7nZCTCLcTSiiycNBLyY";

export const STAKE_DATA_API = "https://arcryptian-backend.vercel.app/api/stakeData";


export const SIGN_IN_API = "https://arcryptian-backend.vercel.app/api/signin";


export const SIGN_OUT_API = "https://arcryptian-backend.vercel.app/api/signout";

// for DC NFT 
export const DC_UPDATE_AUTHORITY = "7aanXByELvwN87GRZsF1bNJqkQv1wRDikDcF9EQ6s5iv";

export const DC_VALID_FIRST_CREATOR = "";
