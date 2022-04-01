import React , {useState, useEffect, useRef} from 'react';
import { format_pub_key_shorter } from '../utils/funcs';
import useNFTStaking from '../hooks/useNFTStaking';
import { Index, NFTStake } from '../states';
import './css/stakeRow.css';
import {Button, Spin} from 'antd';
import {CopyOutlined} from '@ant-design/icons'
import useTokenVault from '../hooks/useTokenVault';
import useWithdrawal from '../hooks/useWIthdrawal';
import { copy } from '../utils/funcs';
import { timeSince } from '../utils/funcs';
import { DC_TOKEN_DECIMAL,STAKE_DATA_API } from '../utils/ids';
import { success, error } from '../utils/Mesg';
import useToken from '../hooks/useToken';
import { TokenImageView } from './TokenImageView';
import { web3 } from '@project-serum/anchor';

export interface StakeRowProps {

    pubkey : string,

    index : number ,

    setTokenEarnedAt : ( index : number, value : number) => void ,

}

export const StakeRow : React.FC <StakeRowProps> = ({pubkey, index, 
    setTokenEarnedAt}) => {

    const [,readIndex,indexPubKey,readNFTStake, calTokenEarned,,,,] = useNFTStaking();

    const [unstake] = useWithdrawal();

    const [,,,readTokenVault] = useTokenVault();

    const [,,,,,,loadMetadata] = useToken();

    const [forMonth, setForMonth] = useState(0);

    const [rate , setRate] = useState(0);

    const [dateStaked, setDateStaked] = useState<Date>();

    const [lastUpdated, setLastUpdated] = useState<Date>();

    const [created, setCreated] = useState<Date>();

    const [toLoad, setToLoad] = useState(false);

    const [tokenEarned, setTokenEarned] = useState(0);

    const [nftMint, setNftMint] = useState("");
    
    const [pdaKey, setPdaKey] = useState("");

    const [tokenRewarded, setTokenRewarded] = useState(0.0);

    const [stat, setStat] = useState(0);

    const [imageUrl, setImageUrl] = useState<string>();

    const [working, setWorking] = useState(false);

    const [indexKey, setIndexKey] = useState("");

    const timePauseToFetchAfterAction = 2000;

    let tmpNfts : Array<web3.PublicKey> = [];

    const [nfts, setNfts] = useState<Array<web3.PublicKey>>([]);

    let tempindexKey : string;


    async function readNFTNoAddingToParent(){

        await readNFT(false);

    }
  
    async function readNFT(toAddNFT : boolean = true){
    
        readNFTStake(pubkey ,
        
        (res : NFTStake | Error) =>  {

            if (!(res instanceof Error)){
                
               setForMonth(res.for_month);

               let d = new Date(res.stake_date * 1000);

               setDateStaked( d);

               setRate(res.rate);

               let lupd = new Date(res.last_update * 1000);

               setLastUpdated(lupd);

               setTokenRewarded(res.token_reward);

               let tkRw = res.token_reward;

               let t = res.stat === 0 ? calTokenEarned( lupd , res.rate, tkRw) : tkRw; 
       
                //calTokenEarned( d , res.rate , lupd);

               setTokenEarned(t);
              
               setNftMint(res.nft_mint.toBase58());

               setPdaKey(res.pda.toBase58());

               setStat(res.stat);

               let _created = new Date(res.created * 1000);

               setCreated(_created);

               if (toAddNFT ){

                  loadMetadata(res.meta_key, ( res: string |Error)=>{

                    if ( !(res instanceof Error)){

                        setImageUrl(res);
                    }
                  
                  })
               }

              
            }

            setWorking(false);
        
        }) 

    }

    useEffect(() => {

        readNFT();

        return;

    }, []);


    useEffect(() => {
		indexPubKey().then((v) => {
			setIndexKey(v);
            tempindexKey = v;
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

                    });

				}
			}
		);

	}

    useEffect(() => {

        let tkRw = tokenRewarded;

        let t = stat === 0  ? calTokenEarned( lastUpdated , rate ,tkRw) : tkRw; 
        //calTokenEarned(dateStaked, rate, lastUpdated);

        let nextReloadTime;

        if(tokenEarned==0){
            nextReloadTime = 500;
        }
        else{
            nextReloadTime = 3000;
        }

        setTokenEarned(t);

        setTokenEarnedAt(index, t);
      

        setTimeout(()=> {

            setToLoad( !toLoad );
        
        }, nextReloadTime);

        return;
        
    }, [toLoad]);


    async function buttonAction() {

        readTokenVault(nftMint, (acc : string | Error) => {

            if ( !(acc instanceof Error)){


                setWorking(true);

                if (stat != 1 ){

                   setWorking(true);

                    unstake(nftMint, pubkey, pdaKey, 
                        acc ,nfts ,(res : boolean | Error,stakeAcc : web3.PublicKey) =>  {
                        if ( res instanceof Error){
                            setWorking(false);
                            error(res.message);
                            setWorking(false);
                    
                        }
                        else {
                            if ( res ){

                                setWorking(false);

                                success("Success", 3);

                                tmpNfts = nfts; 

                                let index = tmpNfts.findIndex((value)=> stakeAcc.toBase58().toString() == value.toBase58().toString());

                                tmpNfts.splice(index,1);

                                setNfts(tmpNfts);

								fetch(STAKE_DATA_API, {
								    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ "stakedMain": -1, "burned": 0, "stakedSup": 0 })
								});

                                setTimeout(readNFTNoAddingToParent, timePauseToFetchAfterAction);

                            }
                        
                        }
                    });
                }
            
            }

        });

        
    }

  
    return <tr className="stakeRow" style={{verticalAlign:"top",display:stat==1?"none":""}}>
        <td style={{width:"7%", margin:"10px", verticalAlign:"top"}} title={nftMint}>
        {imageUrl ? <TokenImageView uri={imageUrl}/> : <Spin style={{marginRight:"5px"}} size="small"/>}
        </td>
        <td style={{width:"20%", textAlign:"left", margin:"10px", verticalAlign:"top"}} title={nftMint}>
        
        {format_pub_key_shorter(nftMint)}
        <Button shape="circle" style={{marginLeft:"10px"}} onClick={()=>{
            copy(nftMint);
        }}><CopyOutlined /></Button>
        </td>
        <td style={{width:"10%", margin:"10px"}}>{forMonth === 0 ? "Arcryptian" : "Supplementary"}</td>
        <td title={(dateStaked?.toLocaleString() ?? "none" ) + " first staked on "+ created?.toLocaleString() ?? ""}
        style={{textAlign :"justify", width:"10%", margin:"10px", paddingLeft:"4vw"}}>
        {dateStaked ? timeSince(dateStaked) : ""}
        </td>
        <td style={{textAlign:"justify", width:"10%", margin:"10px", paddingLeft:"2vw"}}>
        {tokenEarned.toFixed(5)} 
        </td>
        <td style={{width:"10%", margin:"10px"}}>{rate} $ARC / day</td> 
            <td style={{width:"10%", margin:"10px"}}>         
                <Button className="stakeButton" onClick={async ()=>{await buttonAction();}}>
                {working ? <Spin size="small"/> : <span>{stat === 1 ? "Stake" : "Unstake" }</span>}    
                </Button>
            </td>   
     </tr>
}
