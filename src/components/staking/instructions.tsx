import styled from "styled-components";
import { STAKE_DATA_API } from '../../utils/ids';
import { useState,useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export interface instructionProps {
	
    index : number 
}



const StakingInstructions: React.FC<instructionProps> = ({index}) => {

    const [doge,setDoge ] = useState(0);
	const [withdrawn,setWithdrawn ] = useState(0);
	async function getStats(){

			const res = await fetch(STAKE_DATA_API,{
				method: 'GET',
				credentials: 'include',
			});
			res.json().then(v=>{
    
                setDoge(v.stakedMain);
                setWithdrawn(v.stakedSup);
                
            })
            .catch((e)=>{
    
                console.log(e);

            })
		
	};	

 	useEffect(()=>{

		getStats();	

 	})


  return (

	index==0?(
    <Article className="mt-7 p-6">
      <div className="mr-5 pl-14 pr-14 text-xl">
	  DDAC NFT Staking : <br /><br />
		<ul className="list-none md:list-disc">
			<li>Stake reward is increased based on number of nfts you stake</li><br/>  
          <li>Clicking the 'Withdraw' button in 'Your Staking List' transfers total $BREAD you earned till date to your wallet</li><br/>
          <li>Clicking 'Unstake' button in 'Your Staking List' transfers that particular NFT to your wallet </li><br/>
        </ul>
      </div>
    </Article>
	):(
		<Article className="mt-7 p-6">
		<div className="mr-5 pl-14 pr-14 text-xl" style={{textAlign:"center",paddingLeft:"0px",paddingRight:"0px"}}>
		  <span style={{whiteSpace: "nowrap"}}>NUMBER OF NFTS STAKED : &nbsp; {doge} &nbsp; &nbsp;&nbsp;</span>
		  <span style={{whiteSpace: "nowrap"}}>$BREAD WITHDRAWN : &nbsp; {withdrawn.toFixed(2)} &nbsp;</span> 
		</div>
	  </Article>

	)

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
				font-size: 18px;
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
			font-size: 18px;
			color: #676767;
		}
	}
`;

export default StakingInstructions;
