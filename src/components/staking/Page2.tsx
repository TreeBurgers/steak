import { useState, useMemo, useEffect , useRef} from "react";
import * as web3 from "@solana/web3.js";
import styled from "styled-components";
import { Spin } from "antd";
import Icon from "../Icon";
import useNFTStaking from "../../hooks/useNFTStaking";
import { Index, NFTStake} from "../../states";
import { StakeRow } from "../StakeRow";
import useWithdrawal from "../../hooks/useWIthdrawal";
import { success, error, info } from "../../utils/Mesg";
import { STAKE_DATA_API } from "../../utils/ids";


const StakingPage2 = () => {

	const [, withdraw] = useWithdrawal();
	const [,readIndex,indexPubKey,readNFTStake] = useNFTStaking();
	const [addresses, setAddresses] = useState<Array<web3.PublicKey>>([]);
	const [indexKey, setIndexKey] = useState("");
	const [totalEarned, setTotalEarned] = useState(0);
	const [unstakedDawg, setunstakedDawg] = useState(0);
	const [working, setWorking] = useState(false);
	const [nfts, setNfts] = useState<Array<web3.PublicKey>>([]);
	const [viewAll, setViewAll] = useState(false);
	let tDawgEarned = 0 ;
	let uDawg = useRef(0);

	// const completion = (res: boolean | Error) => {
	// 	if (res instanceof Error) {
	// 		alert(res.message);
	// 	} else {
	// 		alert("Success!");
	// 	}
	// };


	const [list] = useState([
		{
			id: 0,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
		{
			id: 1,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
		{
			id: 2,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
		{
			id: 3,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
		{
			id: 4,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
		{
			id: 5,
			img: "small-doge",
			name: "Doge Capital#2528",
			nft: "knuf4xgbL",
			month: "DC Capital Main",
			createdAt: "18/11/2021",
			rate: "10 $DC/day",
		},
	]);

	async function readIndexes() {
		if (indexKey === "") {
			return;
		}


		readIndex(
			indexKey,

			(res: Index | Error) => {

				if (!(res instanceof Error)) {
					
					let tmpNfts: Array<web3.PublicKey> = [];
					let nftAddr : Array<web3.PublicKey> = [];	
					let count = 0;

					console.log(res);

					res.nfts.map((resnft)=>{	

						readNFTStake(resnft.toBase58() ,
        
							(stakenft : NFTStake | Error) =>  {
					
								if (!(stakenft instanceof Error)){

									tmpNfts.push(resnft);	
		
								if(stakenft.stat==0 && stakenft.nft_mint.toBase58()!="11111111111111111111111111111111" && res.stat!=0)
									nftAddr.push(resnft)
								
								if(stakenft.stat==1 && stakenft.nft_mint.toBase58()!="11111111111111111111111111111111" && res.stat!=0){	

								uDawg.current+=stakenft.token_reward;
								setunstakedDawg(uDawg.current);
					
							}
								
									if(count==(res.nfts.length-1) && addresses.length<nftAddr.length){
									setAddresses(nftAddr);	
									setNfts(tmpNfts);
								 	}

									count+=1;

								
								  
								}
							
							}) 
					
						}

					)
					
				}
			}
		);

	}

	useEffect(() => {
		indexPubKey().then((v) => {
			setIndexKey(v);
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		readIndexes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indexKey]);


	const transactions = useMemo(() => {
		if (viewAll) {
			return list;
		}

		return list.slice(0, 3);
	}, [list, viewAll]);

	const handleViewAllBtn = () => {
		if (viewAll) {
			return setViewAll(false);
		}

		setViewAll(true);
	};


	const rows =
		(addresses.map.length ?? 0) > 0 ? (
			addresses.map((addr, index) => {

				return (
						<StakeRow
						pubkey={addr.toBase58()}
						key={addr.toBase58()}
						index={index}
						setTokenEarnedAt={(index, value) => {
				
							tDawgEarned = tDawgEarned + value;	

							if(index==(addresses.length-1))
							 setTotalEarned( tDawgEarned );
			
						}}

					/>
				);
			})
		) : (
			<div style={{color:"red"}}>NO NFTs have been staked here or you've withdrawn</div>
		);

	return (
		<Article className="mt-7">
			<table style={{ width: "100%" }}>
				<thead>
					<tr>
						<th style={{textAlign:"left"}} colSpan={2}>Staked NFT</th>
						<th>Type</th>
						<th>Date Staked</th>
						<th>&cong;$BREAD Earned</th>
						<th>Rate</th>
					</tr>
				</thead>
				<tbody>{<div style={{position:"relative",marginTop:"3vw",left:"25vw",display:nfts.length==0?"":"none"}}>NO NFTS FOUND</div>} {rows}</tbody>
				<tfoot>
					<tr>
						<td>&nbsp;&nbsp;Total&nbsp;&nbsp;</td>
						<td> 
							{totalEarned > 0 ? (
								<> {totalEarned.toFixed(2)} + {unstakedDawg.toFixed(2)} (from unstaked NFTs)  = {(totalEarned+unstakedDawg).toFixed(2)}</>
							) : (
								<Spin size="small"/>
							)}
						</td>
						<td>&nbsp;</td>
						<td>
							<button
								onClick={() => {

									if(nfts.length==0){
									error(
										"!! You haven't staked any NFTs",
										90
									);
									return;
									}

								    setWorking(true);
									
									withdraw(
										nfts,
										() => {

											info(
												"Transfering your $BREAD tokens to your wallet ",
												90
											);
										},

										(res: string | Error , _requireUnstake : boolean) => {
											setWorking(false);
											if (res instanceof Error) {
												error(res.message, 10);
											} 
											else {

												success("Success", 3);

												fetch(STAKE_DATA_API, {
													method: 'POST',
													credentials: 'include',
													headers: { 'Content-Type': 'application/json' },
													body: JSON.stringify({ "stakedMain": 0, "burned": 0, "stakedSup": (totalEarned+unstakedDawg) })
												});

												let tempAddr : Array<web3.PublicKey> = [];
												
												nfts.map((value,index)=>{
													
													if(res!=value.toBase58())
													tempAddr.push(value);
													
													if(index==(nfts.length-1))	
													 setNfts(tempAddr)
													
												})

												setTimeout(() => {

													window.location.reload();
													
												}, 1000); 

											}
										}
									);
								}}
							>
								{working ? (
									<Spin size="small"/>
								) : (
									<div className="relative flex flex-col items-center">
										<Icon icon="unstake-btn" width={150}/>
										<p className="top-1 absolute" style={{top:"0.75rem"}}>Withdraw $BREAD</p>
									</div>
								)}
							</button>
						</td>
					</tr>
				</tfoot>
			</table>
		</Article>
	);
};

const Article = styled.article`
	background: linear-gradient(
		237.15deg,
		rgba(123, 123, 123, 0.2) -7.38%,
		rgba(0, 0, 0, 0.2) 97.96%
	);
	border: 2px solid rgba(255, 255, 255, 0.14);
	box-sizing: border-box;
	box-shadow: -13px 18px 21px rgba(0, 0, 0, 0.31);
	backdrop-filter: blur(4px);
	border-radius: 21px;
	border-collapse: collapse;

	& table {
		width: 97%;
		margin: 0 auto;

		& thead {
			& tr {
				border-bottom: 1px solid #676767;
				width: 95%;

				& th {
					padding: 0.8rem 0.5rem;
				}
			}
		}
		& tbody {
			& tr {
				text-align: center;

				& td {
					padding: 1rem 0.2rem 0.2rem;

					& p {
						font-size: 16px;
						color: #fa8519;
					}
				}
			}
		}

		& tfoot {
			& tr {
				border-bottom: 1px solid #676767;

				& td {
					padding-top: 1.5rem;
				}
			}
		}
	}
`;

export default StakingPage2;
