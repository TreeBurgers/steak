import styled from "styled-components";
import Icon from "./Icon";

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
	return (
		<Footerclass className="text-white pl-3 pr-6 pb-4 mt-20">
			<div className="flex items-end justify-between">
				<Icon icon="logo" width={120} height={50} color="white"/>
				
			</div>
			<div className="mt-6 flex sm:flex-row flex-col-reverse items-center sm:items-baseline sm:justify-between pl-2">
				<p className="text-center">Powered by Doge Capital</p>
				<div className="flex items-end sm:mt-0 mb-2">
					<a
						className="block m-0 text-white underline"
						href="https://twitter.com/DDApeClub"
						target="_blank"
						rel="noreferrer"
					>
						<Icon icon="twitter" height={20} width={35} />
					</a>
					<a
						className="block ml-8"
						href="https://discord.com/invite/ddac"
						target="_blank"
						rel="noreferrer"
					>
						<Icon icon="discord" height={20} width={35} />
					</a>
				</div>
			</div>
		</Footerclass>
	);
};


const Footerclass = styled.section`

@media screen and (min-width: 400px) and (max-width: 450px) {
		position: relative;
		top:30vw;
}
`;

export default Footer;
