const StakingButtonBorder: React.FC<{ active: boolean }> = ({ active }) => {
	return (
		<svg
			width="287"
			height="48"
			viewBox="0 0 287 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="9.47241"
				width="268.096"
				height="4"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				x="9.47241"
				y="44"
				width="268.096"
				height="4"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				x="0.267578"
				y="8"
				width="4.60251"
				height="32"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				width="4.60251"
				height="32"
				transform="matrix(-1 0 0 1 286.775 8)"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				x="4.87036"
				y="4"
				width="4.60251"
				height="4"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				width="4.60251"
				height="4"
				transform="matrix(-1 0 0 1 282.171 4)"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				x="4.87036"
				y="40"
				width="4.60251"
				height="4"
				fill={active ? "#FFF" : "#676767"}
			/>
			<rect
				width="4.60251"
				height="4"
				transform="matrix(-1 0 0 1 282.171 40)"
				fill={active ? "#FFF" : "#676767"}
			/>
		</svg>
	);
};

export default StakingButtonBorder;
