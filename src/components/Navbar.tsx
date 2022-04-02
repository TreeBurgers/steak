import styled from "styled-components";
import logo from './../assets/img/logo.png';

const Navbar: React.FC = () => {
	return (
		<Nav className="z-20 bg-black sm:bg-transparent relative top-0 flex sm:flex-row flex-col items-center justify-between text-white sm:pl-2 sm:pr-6 pt-1 pb-6">
			<div className="flex flex-wrap marginLeft:200px">
				
				<a href="https://ddapeclub.io/">

				 <img className="nav-logo" src={logo} alt="" style={{ alignItems:"right", width:"25%", padding: "0 0 0 0" }}  />
			
			</a>
			</div>
			<div className="flex flex-wrap sm:justify-start justify-center md:mt-0 mt-4" style={{width:"100%"}}>
				<a href="https://ddapeclub.io/">HOME</a>
				<a href="https://ddapeclub.io/" className="mx-5">BLACK PAPER</a>
				<a href="https://ddapeclub.io/" className="mx-5">ROAD MAP</a>
				<a href="https://ddapeclub.io/" className="mx-5">FAQ</a>
			</div>
		</Nav>
	);
};

const Nav = styled.nav`
	font-family: var(--font-family-2);

	& a {
		color: #fff !important;
	}

	nav-logo {
		width: 100px;
	  }

	@media screen and (max-width: 639px) {
		background-color: rgba(0, 0, 0, 0.1);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
	}
`;

export default Navbar;
