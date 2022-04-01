import "antd/dist/antd.css";
import { message } from "antd";
import "./css/Mesg.css";

message.config({
	top: 350,
	duration: 2,
	maxCount: 3,
	rtl: true,
	prefixCls: "",
});


export const success = (text: string, duration: number = 3) => {
	message.success(
		{
			content: text,
			className: "successDiv",
			style: {
				marginTop: "20vh",
			},
		},
		duration
	);
};

export const info = (text: string, duration: number = 3) => {
	message.info(
		{
			content: text,
			className: "successDiv",
			style: {
				marginTop: "20vh",
			},
		},
		duration
	);
};

export const error = (text: string, duration: number = 3) => {
	message.error(
		{
			content: text,
			className: "errorDiv",
			style: {
				marginTop: "20vh",
			},
		},
		duration
	);
};
