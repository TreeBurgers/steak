import {FC,useState,useEffect} from "react" ;
import { copy } from "../../utils/funcs";
import { CopyOutlined } from "@ant-design/icons";
import { TokenImageView } from "../TokenImageView";
import { DC_UPDATE_AUTHORITY,STAKE_DATA_API } from "../../utils/ids";
import { Index, NFTMeta, NFTStake } from "../../states";
import { Button } from "antd";
import { format_pub_key_shorter } from "../../utils/funcs";
import { success, error } from "../../utils/Mesg";
import "../css/StakingForm.css";
import useCreateStake from "../../hooks/useCreateStake";
import Icon from "../Icon";
import useNFTStaking from "../../hooks/useNFTStaking";
import useTokenVault from "../../hooks/useTokenVault";
import { web3 } from "@project-serum/anchor";

export interface StakeFormRowProps {
	
    index : number ,

    meta : NFTMeta,

    parentNeedsRefresh ( refresh : boolean, index : number ): void ,
}


export const StakeFormRow : FC <StakeFormRowProps>= ({index, meta,  parentNeedsRefresh }) => {

    
    const [createStake,creating] = useCreateStake();

    const [, , , readTokenVault] = useTokenVault();

    const [stat,setStat] = useState(0);

    const [month,setMonth] = useState(0);

	const [indexKey, setIndexKey] = useState("");

    const [loading, setLoading] = useState(false);

	const [,readIndex,indexPubKey,readNFTStake,,,,,restake] = useNFTStaking();

	const [nfts, setNfts] = useState<Array<web3.PublicKey>>([]);

    let tempindexKey: string;

    let tmpNfts : Array<web3.PublicKey> = [];

    useEffect(() => {
		indexPubKey().then((v) => {
			setIndexKey(v);
            tempindexKey=v;
		    readIndexes();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [indexKey]);

	async function readIndexes() {
		if (indexKey === "") {
			return;
		}


		readIndex(
			tempindexKey,

			(res: Index | Error) => {
				if (!(res instanceof Error)) {

                    res.nfts.map((publicKey)=>{

                        tmpNfts.push(publicKey);
                        setNfts(tmpNfts);

                        readNFTStake(publicKey.toBase58() ,
        
                            (res : NFTStake | Error) =>  {
                    
                                if (!(res instanceof Error)){

                                    setMonth(res.for_month);

                                   if(meta.mint===res.nft_mint.toBase58()){ 
                    
                                   setStat(1);

                                   }
                                  
                                }
                            
                            }) 

                    });

				}
			}
		);

	}

 
    const completion = (res: boolean | Error, possiblyAlreadyStaked : boolean, stakeKey : web3.PublicKey) => {
		if (res instanceof Error) {
			error(res.message, 5);

            if ( possiblyAlreadyStaked){
                parentNeedsRefresh (false , index );
            }
      
		} 
        else {
			success(res ? "Success" : "Error!", 3);


            tmpNfts = nfts;

            tmpNfts.push(stakeKey);
                                
            setNfts(tmpNfts);

            fetch(STAKE_DATA_API, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "stakedMain": 1, "burned": 0, "stakedSup": 0 })
            });

            setTimeout(()=>{
                parentNeedsRefresh (true, index );
            }, 500);
                
		}
	};


	


    return <div className="nftRow" key={"nftRow_" + index}>
		<div className="col">{index + 1}.</div>
		<div className="col" title={meta.mint} style={{ cursor: "pointer"}}>
                <TokenImageView key={meta.uri} uri={meta.uri} />
                {format_pub_key_shorter(meta.mint)}
                <Button shape="circle" style={{ marginLeft: "10px" }} onClick={() => { copy(meta.mint);}}>
                <CopyOutlined /></Button>
            </div>

            <div className="col type-class">
                {meta.updateAuthority === DC_UPDATE_AUTHORITY ? "Main" : ""}
            </div>

            <div className="col">

                <button id="stake-btn"
                    style={{display: meta.updateAuthority === DC_UPDATE_AUTHORITY 
                                ? "block" : "none",}}
                    onClick={async  () => {

                        if(stat==1){
                        readTokenVault(meta.mint, (acc: string | Error) => {
                            if (!(acc instanceof Error)) {

                                setLoading(true);

                                restake(meta.mint, 0, acc, nfts,(res : boolean | Error, stakeKey : web3.PublicKey) =>  {
                                    if ( res instanceof Error){
                                
                                        error(res.message);
                                        setLoading(false);
                                
                                    }
                                    else {
                                        if ( res ){

                                            success(res ? "Sucesss" : "Error"); 

                                            setLoading(false);
            
                                            completion(true,false,stakeKey);
                                            
                                        }
                                    
                                    }
                                });

                            
                            } else {
                                error("Unable to fetch token vault account", 3);
                            }
                        });
                     }else{

                        await createStake(meta,nfts,completion);

                     }               

                    }}>
                        <div className="relative hover:bg-black rounded-2xl flex flex-col items-center">
									<Icon icon="unstake-btn" />
                                    { creating || loading ? <div style={{position:"absolute"}}>Stake<span className="ant-spin-dot ant-spin-dot-spin" style={{marginLeft: "1vw", position: "relative",top: "0.5vw"}}> <i className="ant-spin-dot-item"/> <i className="ant-spin-dot-item"/> <i className="ant-spin-dot-item"/> <i className="ant-spin-dot-item"/>  </span></div>: <p className="absolute text-sm top-1.5">Stake</p> }
								</div>
                </button>
            </div>
          
        </div>
}


