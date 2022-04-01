import * as web3 from "@solana/web3.js";

export const format_pub_key_shorter = (pubkey: string) => {
	return (
		pubkey.substring(0, 4) +
		".." +
		pubkey.substring(pubkey.length - 4, pubkey.length)
	);
};

export const format_pub_key_shorter2 = (pubkey: string) => {
	return (
		pubkey.substring(0, 15) +
		"xx" +
		pubkey.substring(pubkey.length - 15, pubkey.length)
	);
};

export function tryToGetPubkey(pubkey: string): web3.PublicKey | undefined {
	try {
		let pkey = new web3.PublicKey(pubkey);
		return pkey;
	} catch (err) {
		return;
	}
}

export function formatNumber(num: number) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function getRndInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function copy(value: string) {
	const el = document.createElement("input");
	el.value = value;
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);
}

class Interval {
	label: string = "";

	seconds: number = 0;

	constructor(i: { label: string; seconds: number }) {
		if (i) {
			this.label = i.label;
			this.seconds = i.seconds;
		}
	}
}

const intervals = [
	new Interval({ label: "yr", seconds: 31536000 }),
	new Interval({ label: "mon", seconds: 2592000 }),
	new Interval({ label: "day", seconds: 86400 }),
	new Interval({ label: "hr", seconds: 3600 }),
	new Interval({ label: "min", seconds: 60 }),
	new Interval({ label: "sec", seconds: 1 }),
];

export function timeSince(date: Date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	const interval: Interval | undefined = intervals.find(
		(i) => i.seconds < seconds
	);

	if (interval) {
		const count = Math.floor(seconds / interval.seconds);
		return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
	}

	return;
}
