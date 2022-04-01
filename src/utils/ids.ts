import * as web3 from '@solana/web3.js';

export const FIRST_CREATOR_IS_LAST_INDEX = false ;//false; // change to false for mainnet as it's the first index 
                                                // instead of last


export const NETWORK = "mainnet-beta";

export const programId : web3.PublicKey = 

new web3.PublicKey("274tyvf6nmbqqQXZyczwvVZhEev8gfcfDV52LmTbVFuw");

// for $DAWG token 
export const DC_TOKEN_DECIMAL = 6; 

export const DC_TOKEN_MINT = "FNpCzhQy5NZgEbmcJLedQebpRKRvw8sBGizhYj1uifGX";

//"9QKHcZihXMdBgYdrWgqXCP6o6GWWb9ttsqS7WXSVuJZ8";

// This is the wallet address that created the $DAWG token vault
export const DC_TOKEN_VAULT_OWNER = "FDYc2wEuUYi7anHdzPrnQpXnq6wkE7WXhdtNPF2U4HoJ";


// NFT token vault API URI
export const NFT_TOKEN_VAULT_API = "https://degen-dao-backend.vercel.app/api/tokenvault?mint=";

export const NFT_TOKEN_VAULT_FILE_WALLET = "2yGbDnUWTB8GP8Hic994QCrcj6px58E4yZhGs1AygUJM";

export const STAKE_DATA_API = "https://degen-dao-backend.vercel.app/api/stakeData";


export const SIGN_IN_API = "https://degen-dao-backend.vercel.app/api/signin";


export const SIGN_OUT_API = "https://degen-dao-backend.vercel.app/api/signout";

// for DC NFT 
export const DC_UPDATE_AUTHORITY = "Aj6MnLfii2minSEbDfkPDBLh4txQXn9DbqmUXuYxQMZz";

export const DC_VALID_FIRST_CREATOR = "";
