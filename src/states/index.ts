import * as web3 from "@solana/web3.js";
import * as BufferLayout from "buffer-layout";
import * as Layout from "./layout";

export const parse_token_vault = (
	data: Uint8Array,
	completionHandler: (result: Array<TokenVault> | Error) => void
) => {
	let len = data.slice(0, 1);

	let length = Buffer.from(len).readUInt8(0);

	var validTkvs: Array<TokenVault> = [];

	let keys = data.slice(1, data.length);

	for (var r = 0; r < length; r++) {
		let offset = r * 64;
		let key_arr = keys.slice(offset, offset + 64);

		let mint_arr = key_arr.slice(0, 32);
		let acc_arr = key_arr.slice(32, 64);

		let mint = new web3.PublicKey(mint_arr);
		let acc = new web3.PublicKey(acc_arr);

		if (mint.toBase58() !== web3.PublicKey.default.toBase58()) {
			validTkvs.push(new TokenVault({ mint: mint, account: acc }));
		}
	}

	completionHandler(validTkvs);
};

export const parse_index = (
	data: Uint8Array,
	completionHandler: (result: Index | Error) => void
) => {

	let owner = new web3.PublicKey(data.slice(0, 32));
	let first_date = Buffer.from(data.slice(32, 40)).readInt32LE(0);
	let stat = Buffer.from(data.slice(40, 41)).readUInt8(0);

	let len = data.slice(41, 42);

	let length = Buffer.from(len).readUInt8(0);

	var validPkeys: Array<web3.PublicKey> = [];

	let keys = data.slice(42, data.length);

	for (var r = 0; r < length; r++) {
		let offset = r * 32;
		let key_arr = keys.slice(offset, offset + 32);
		let pkey = new web3.PublicKey(key_arr);

		if (pkey.toBase58() !== web3.PublicKey.default.toBase58()) {
			validPkeys.push(pkey);
		}
	}

	let m = new Index({
		owner: owner,
		first_stake_date: first_date,
		stat: stat,
		nfts: validPkeys,
	});

	completionHandler(m);
};


export interface NFTMeta {

	mint : string, 

	updateAuthority : string, 

	firstCreator : string,

	uri : string,

	address : string, 
}

export class Index {
	owner: web3.PublicKey = web3.PublicKey.default;

	first_stake_date: number = 0;

	stat: number = 0;

	nfts: Array<web3.PublicKey> = [];

	constructor(index: {
		owner: web3.PublicKey;
		first_stake_date: number;
		stat: number;
		nfts: Array<web3.PublicKey>;
	}) {
		if (index) {
			this.owner = index.owner;
			this.first_stake_date = index.first_stake_date;
			this.stat = index.stat;
			this.nfts = index.nfts;
		}
	}

	static default(): Index {
		return new Index({
			owner: web3.PublicKey.default,
			first_stake_date: 0,
			stat: 0,
			nfts: [],
		});
	}
}

export class TokenVault {
	mint: web3.PublicKey = web3.PublicKey.default;

	account: web3.PublicKey = web3.PublicKey.default;

	constructor(tokenVault: { mint: web3.PublicKey; account: web3.PublicKey }) {
		if (tokenVault) {
			this.mint = tokenVault.mint;
			this.account = tokenVault.account;
		}
	}
}

export class Sys {
	token_account: web3.PublicKey = web3.PublicKey.default;

	token_pda: web3.PublicKey = web3.PublicKey.default;

	token_mint: web3.PublicKey = web3.PublicKey.default;

	date_added: number = 0;

	constructor(sys: {
		token_account: web3.PublicKey;

		token_pda: web3.PublicKey;

		token_mint: web3.PublicKey;

		date_added: number;
	}) {
		if (sys) {
			this.token_account = sys.token_account;
			this.token_pda = sys.token_pda;
			this.token_mint = sys.token_mint;
			this.date_added = sys.date_added;
		}
	}
}

export const parse_sys = (
	data: Uint8Array,
	completionHandler: (result: Sys | Error) => void
) => {
	let tokenAcc = new web3.PublicKey(data.slice(0, 32));
	let tokenPda = new web3.PublicKey(data.slice(32, 64));
	let tokenMint = new web3.PublicKey(data.slice(64, 96));
	let dateAdded = Buffer.from(data.slice(96, 104)).readUInt32LE(0);

	let m = new Sys({
		token_account: tokenAcc,
		token_pda: tokenPda,
		token_mint: tokenMint,
		date_added: dateAdded,
	});

	completionHandler(m);
};

export class NFTStakeAddr {
	address: web3.PublicKey = web3.PublicKey.default;
	nft: NFTStake | undefined;

	constructor(addr: {
		address: web3.PublicKey;
		nft: NFTStake;
	}) {
		if (addr) {
			this.address = addr.address;
			this.nft = addr.nft;
		}
	}
}

export class NFTStake {
	nft_mint: web3.PublicKey = web3.PublicKey.default;

	owner: web3.PublicKey = web3.PublicKey.default;

	for_month: number = 0;

	pda: web3.PublicKey = web3.PublicKey.default;

	nft_token_acc: web3.PublicKey = web3.PublicKey.default;

	rate: number = 0;

	token_reward: number = 0;

	stake_date: number = 0;

	last_update: number = 0;

	stat: number = 0;

	created: number = 0;

	meta_key: web3.PublicKey = web3.PublicKey.default;

	// added back by Christopher K Y Chee 
	// This is crucial, 01/Dec/21
	// the vault account is needed !
	vault_account: web3.PublicKey = web3.PublicKey.default;

	constructor(stake: {
		nft_mint: web3.PublicKey;

		owner: web3.PublicKey;

		for_month: number;

		pda: web3.PublicKey;

		nft_token_acc: web3.PublicKey;

		rate: number;

		token_reward: number;

		stake_date: number;

		last_update: number;

		stat: number;

		created: number;

		meta_key: web3.PublicKey;

		vault_account: web3.PublicKey;

	}) {
		if (stake) {
			this.owner = stake.owner;
			this.nft_mint = stake.nft_mint;
			this.for_month = stake.for_month;
			this.pda = stake.pda;
			this.nft_token_acc = stake.nft_token_acc;
			this.rate = stake.rate;
			this.token_reward = stake.token_reward;
			this.stake_date = stake.stake_date;
			this.last_update = stake.last_update;
			this.stat = stake.stat;
			this.created = stake.created;
			this.meta_key = stake.meta_key;
			this.vault_account = stake.vault_account;
		}
	}
}

export const NftStakeLayout: typeof BufferLayout.Structure =
	BufferLayout.struct([
		Layout.publicKey("nftMint"),
		Layout.publicKey("owner"),
		BufferLayout.u8("forMonth"),
		Layout.publicKey("pda"),
		Layout.uint64("rate"),
		Layout.uint64("tokenReward"),
		Layout.uint64("stakeDate"),
		Layout.uint64("lastUpdate"),
		BufferLayout.u8("stat"),
	]);

export const parse_nft_stake = (
	data: Uint8Array,
	completionHandler: (result: NFTStake | Error) => void
) => {
	const buffer = Buffer.from(data.buffer);
	const nftSt = NftStakeLayout.decode(buffer);


	completionHandler(nftSt);
};

export const parse_nft_stake2 = (
	data: Uint8Array,
	completionHandler: (result: NFTStake | Error) => void
) => {
	let nftMint = new web3.PublicKey(data.slice(0, 32));
	let owner = new web3.PublicKey(data.slice(32, 64));

	let forMonth = Buffer.from(data.slice(64, 65)).readUInt8(0);

	let pda = new web3.PublicKey(data.slice(65, 97));

	let nft_token_acc = new web3.PublicKey(data.slice(97, 129));

	let rate = Buffer.from(data.slice(129, 137)).readDoubleLE(0);

	let token_reward = Buffer.from(data.slice(137, 145)).readDoubleLE(0);

	let stakeDate = Buffer.from(data.slice(145, 153)).readUInt32LE(0);

	let lastUpdate = Buffer.from(data.slice(153, 161)).readUInt32LE(0);

	let stat = Buffer.from(data.slice(161, 162)).readUInt8(0);

	let created = Buffer.from(data.slice(162, 170)).readUInt32LE(0);

	let metaKey = new web3.PublicKey(data.slice(170, 202));


	// Added by Christopher K Y Chee 01/Dec/21
	// Vault account is needed for token to transfer
	// to and from user for staking, unstaking and withdrawal!!
	let vaultAccount = new web3.PublicKey(data.slice(202, 234));

	//console.log("sxx::", stat);

	let m = new NFTStake({
		nft_mint: nftMint,
		owner: owner,
		for_month: forMonth,
		pda: pda,
		nft_token_acc: nft_token_acc,
		rate: rate,
		token_reward: token_reward,
		stake_date: stakeDate,
		last_update: lastUpdate,
		stat: stat,
		created: created,
		meta_key: metaKey,
		vault_account : vaultAccount,
	});

	completionHandler(m);
};

export const num_to_u64 = (num: number) => {
	var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

	for (var i = 0; i < byteArray.length; i++) {
		let byte = num & 0xff;
		byteArray[i] = byte;
		num = (num - byte) / 256;
	}

	return byteArray;
};

export const num_to_u32 = (num: number) => {
	var byteArray = [0, 0, 0, 0];

	for (var i = 0; i < byteArray.length; i++) {
		let byte = num & 0xff;
		byteArray[i] = byte;
		num = (num - byte) / 256;
	}

	return byteArray;
};
