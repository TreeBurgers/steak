import { FC, useState } from "react";
import useCreateStake from "../hooks/useCreateStake";
import { error, success } from "../utils/Mesg";
import { Button } from "antd";


export const CantStakeInsView: FC = () => {

    const[,,createIndexAccount]	= useCreateStake();


    return <div>
        <span style={{marginRight:"10px"}}>
        If your wallet is having problems to stake, please create an index account first: </span>
        <Button style={{borderRadius:"30px"}}
        onClick={()=>{

            createIndexAccount((res : string | Error)=>{

                if ( res instanceof Error){

                    error(res.message, 5);
                }
                else {

                    success("Success : "+res);
                }
            });

        }} >Create Index Account</Button></div>

    
}