import { FC, useState } from "react";
import styled from "styled-components";
import StakingButtonBorder from "./StakingBorder";
import StakingPage1 from "./staking/Page1";
import StakingPage2 from "./staking/Page2";
import StakingInstructions from "./staking/instructions";

export const HomePageView: FC = () => {
	const [activeTab, setActiveTab] = useState(0);
	// const [viewType, setViewType] = useState(ViewType.StakingForm);

	// const switchView = (viewType: ViewType): any => {
	// 	switch (viewType) {
	// 		case ViewType.Menu:
	// 			return <ViewTxView />;
	// 		case ViewType.TokenForm:
	// 			return <TokenForm setViewType={setViewType} />;
	// 		case ViewType.StakingForm:
	// 			return <StakingForm setViewType={setViewType} />;
	// 		case ViewType.StakingList:
	// 			return <StakeRowList />;
	// 		case ViewType.SysForm:
	// 			return <SysForm setViewType={setViewType} />;
	// 	}
	// };

	return (
		<>
			<Wrapper className="mx-6 mt-20 mb-4">
				<section className="home-wrap pt-7">
					<article className="flex home-btn justify-center">
						<button
							onClick={() => setActiveTab(0)}
							className="relative flex flex-col items-center"
						>
							<StakingButtonBorder active={activeTab === 0} />
							<p
								style={{ color: activeTab === 0 ? "#fff" : "#676767" }}
								className="absolute top-2.5"
							>
								STAKE YOUR NFT
							</p>
						</button>
						<button
							onClick={() => setActiveTab(1)}
							className="relative ml-6 flex flex-col items-center"
						>
							<StakingButtonBorder active={activeTab === 1} />
							<p
								style={{ color: activeTab === 1 ? "#fff" : "#676767" }}
								className="absolute top-3"
							>
								YOUR STAKING LIST
							</p>
						</button>
					</article>

					{activeTab === 0 ? (
						<>
						<StakingInstructions index={0}/>
						<StakingPage1 />
						</>
					) : (
						<>
						<StakingInstructions index={1}/>
						<StakingPage2 />
						</>
					)}
				</section>
			</Wrapper>
		</>
	);
};

const Wrapper = styled.div`

    margin-left:15vw;
	margin-right:15vw;
	font-family: var(--font-family-2) !important;
	color: #fff !important;

	& > section {

		@media screen and (min-width: 600px) and (max-width: 850px) {
			position: relative;
    		top: 12vw;
			& button {
				zoom: 0.7;
				margin: 20px;
			}	
	}


	@media screen and (max-width: 600px) {
		position: relative;
		top: 25vw;
		& button {
			zoom: 0.7;
			margin: 20px;
		}
		.home-btn{
			flex-direction:column;
			align-items: self-start;
		}
}



        padding:3%;
		background: linear-gradient(
			237.15deg,
			rgba(123, 123, 123, 0) -7.38%,
			rgba(0, 0, 0, 0.2) 97.96%
		) !important;
		filter: drop-shadow(-13px 18px 21px rgba(0, 0, 0, 0.31));
		backdrop-filter: blur(4px);
		border-radius: 21px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-collapse: collapse;

		

		& article > button {
			& p {
				font-size: 20px;
			}
		}
	}
`;
