import { useState, useEffect, useRef} from "react";
import styled from "styled-components";
import Icon from "../Icon";
import useSolana from "../../hooks/useSolana";
import { format_pub_key_shorter } from "../../utils/funcs";
import useToken from "../../hooks/useToken";
import { Spin } from "antd";
import { NFTMeta } from "../../states";
import { StakeFormRow } from "../forms/StakeFormRow";
import { error} from "../../utils/Mesg";
import { DC_UPDATE_AUTHORITY, DC_VALID_FIRST_CREATOR } from "../../utils/ids";
import * as splToken from "@solana/spl-token";
import { Button } from "@solana/wallet-adapter-react-ui/lib/Button";


const StakingPage1: React.FC = () => {

	const [connection, wallet] = useSolana();
	
	const [copied, setCopied] = useState(false);
	
	const [, , , , , , , , , getMetadataByMint] = useToken();
	
	const [importLoading, setImportLoading] = useState(false);

	const [metas, setMetas] = useState<Array<NFTMeta>>();
	
	let nftMetas : Array<NFTMeta> = [];

	let count = 0 ;

	let nftCount = useRef(0) ;
	
	const fetchNFTs = async () => { 

		if(wallet){
		setImportLoading(true);
		}
		else{
			error("!!  Please connect your wallet before you import ", 5);
			return;
		}

		if(nftCount.current!=0){

			metas?.map((meta) =>{
				nftMetas.push(meta);
			});
		}

		if (importLoading && nftCount.current===0){
			error("!!  It's importing.... be patient ", 5);
			return;
		}
        
		

		if ( !wallet) {

            return; 

        }

		let pid = splToken.TOKEN_PROGRAM_ID;

        // use getParsedTokenAccountsByOwner instead for easy extracting
        // of token mint 
        const accounts = await connection.getParsedTokenAccountsByOwner(
            wallet,{programId : pid}

			
        );

		let localcount = nftMetas.length;

		for (nftCount.current; nftCount.current < accounts.value.length; nftCount.current++){

				let pkey = accounts.value[nftCount.current].pubkey ;

				let accountInfo;
				
				try{

				 accountInfo = await connection.getTokenAccountBalance(pkey);

				}catch(e){

					nftCount.current++;
					continue;

				}
			   
				if (accountInfo.value.amount === "1" && accountInfo.value.decimals === 0 ){

					let mint = accounts.value[nftCount.current].account.data.parsed.info.mint;

					let nftmeta;

					try{
						
						 nftmeta = await getMetadataByMint(mint);
	   
					   }catch(e){
	   
						   nftCount.current++;
						   continue;
	   
					   }

					if (nftmeta.updateAuthority==DC_UPDATE_AUTHORITY){
						
					nftMetas.push(nftmeta);

					// control the number of NFTs that are loaded at a time , currently set to 10 

					if(nftMetas.length>(localcount+9)){
						nftCount.current++;
						break;
					}
						
					}

				}
			}

			setMetas(nftMetas);
			setImportLoading(false);

	};

	useEffect(() => {
		setTimeout(() => {
			setCopied(false);
		}, 1500);
	}, [copied]);


	const loadmore = () => {
		if(!importLoading)
			fetchNFTs();
	}


	const parentNeedsRefresh = ( refresh : boolean , index : number ) : void => {

		if ( refresh ){



			if (metas) {

				let newMetas = metas.filter((_, i) => i !== index);
				
				setMetas (newMetas);

			}
	
			//setTimeout(fetchNFTs, 200);

		}
	}


	const nftlist = (metas?.map.length ?? 0) > 0 ? 
					metas?.map((meta) => { 
				   
										   if(meta)	
										   return <StakeFormRow meta={meta} index ={count++} key={"srow"+count} 
										   parentNeedsRefresh={parentNeedsRefresh} />
								   
									   }) :<></>	
	
	return (
		<Article className="mt-7 pb-14"> 
			<div
				role="button"
				onClick={fetchNFTs}
				className="cta hover:opacity-75 w-max mx-auto mt-8 mb-7 flex items-center py-3 px-14 rounded-lg"
			>
				<div className="mr-5">
					<h4>Import from wallet</h4>
					<p className="text-center">
						{format_pub_key_shorter(wallet?.toBase58() ?? "")}
					</p>
					<Spin
						size="default"
						style={{
							marginLeft: "10px",
							marginTop: "4px",
							display: importLoading ? "inline-block" : "none",
						}}
					/>
				</div>
				<Icon icon="treasure-box" />
			</div>
			{wallet && (
				<>
					<div className="import w-10/12 mx-auto flex items-center justify-between py-3.5 px-7">
						<div>
							{(metas?.length ?? 0) > 0 ? (
								<div>
									<div className="nftList">
										{nftlist}
									</div>
									<Button onClick={loadmore}>Load More</Button>
								</div>
							) : (
								<div style={{ fontWeight: "bolder" }}>
									{importLoading ? "Woofing..." : "Click to import Arcryptian NFTs from your wallet"}
								</div>
							)}
						</div>
					</div>
					{/* <p className="text-center my-3 text-grey">-- or --</p> */}
				</>
			)}
			<br/><br/>
			{/* <p><InputNFTForm/></p> */}
		</Article>
	);
};

const Article = styled.article`
	h2,
	h3,
	h4,
	h5 {
		color: #fff !important;
	}

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

	@media screen and (max-width: 850px) {

		& .cta { 
			display: block;
			padding: 20px;
		}
}


	& .cta {
		background: linear-gradient(263.97deg, #4a4a4a -11.97%, #2d2d2d 93.86%);
		box-shadow: -7px 20px 30px rgba(0, 0, 0, 0.25);
		border-radius: 11px;

		& > div {
			& h4 {
				font-size: 19px;
				color: #fff !important;
			}
		}
	}

	& .import,
	form {
		background: #353535;
		box-shadow: -7px 20px 30px rgba(0, 0, 0, 0.25);
		border-radius: 11px;
	}

	& form {
		& label {
			font-size: 15px;
		}

		& input,
		select {
			outline: none;
			font-size: 14px;
			color: #676767;
		}
	}
`;

export default StakingPage1;
