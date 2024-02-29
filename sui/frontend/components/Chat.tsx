"use client";
import { useEffect, useState } from "react";
import { useSubmitTransaction } from "@thalalabs/surf/hooks";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { NextResponse } from "next/server";
import { hex2a, formatDate, formatAddress } from "@/util/functions";
import { SuiObjectData } from "@mysten/sui.js/client";

interface Message {
    sender: string;
    text: string,
    timestamp: number;
    ref_id: string;
    metadata: string;
}

// instantiate the client


const chatRoomId = "";
export default function Chat() {

    const currentAccount = useCurrentAccount();
    const [history, setHistory] = useState([] as Message[]);
    const [message, setMessage] = useState("hello");

    const {
        isIdle,
        reset,
        isLoading: submitIsLoading,
        error: submitError,
        submitTransaction,
        data: submitResult,
    } = useSubmitTransaction();

    function getCounterFields(data: SuiObjectData) {
        if (data.content?.dataType !== "moveObject") {
          return null;
        }
      
        return data.content.fields as { value: number; owner: string };
      }

    const getMessages = async () => {
        /* TODO: Replace with Sui syntax

        const [messages] = await client.useABI(abi).view.get_messages({
            functionArguments: [abi.address],
            typeArguments: [],
        })
        console.log(messages);
        console.log(account?.address)
        await reset();
        setHistory(messages as Message[]);
        */
    }

    useEffect(() => {
        getMessages();
        const intervalId = setInterval(getMessages, 5000); 

        return () => clearInterval(intervalId);
    }, [currentAccount?.address, submitResult, submitError, submitIsLoading])

    

    const executeMoveCall = (method: "increment" | "reset") => {
        const txb = new TransactionBlock();
    
        if (method === "reset") {
            txb.moveCall({
                arguments: [txb.object(id), txb.pure.u64(0)],
                target: `${counterPackageId}::counter::set_value`,
            });
        }   else {
            txb.moveCall({
                arguments: [txb.object(id)],
                target: `${counterPackageId}::counter::increment`,
          });
        }
    
        signAndExecute(
          {
            transactionBlock: txb,
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          },
          {
            onSuccess: (tx) => {
              client.waitForTransactionBlock({ digest: tx.digest }).then(() => {
                refetch();
              });
            },
          },
        );
      };

    const updateMessage = (e: any) => {
        setMessage(e.target.value);
    };

    return (
        <div className="grid grid-flow-col-1 group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 dark:border-neutral-700 dark:bg-neutral-800/30">
            <h1 className="text-lg">History</h1>
            <div className="">
                {history.map((message, index) => (

                    <div key={index} className={message.sender == account?.address ? "text-right border-b-[1px] border-stone-700 p-2" : "border-b-[1px] border-stone-700 p-2"}>
                        <p className={message.sender == account?.address ? "text-stone-400" : ""}>{message.sender == account?.address ? "You: " : formatAddress(message.sender as string) + ": "}{hex2a(message.text.slice(2))}</p>

                        <p className="text-xs">{formatDate(new Date(message.timestamp * 1000))}</p>
                    </div>
                ))}
            </div>
            <form className="" onSubmit={(e) => { e.preventDefault(); postMessage(); }}>
                <label className="p-2">Message
                    <input type="text" className="z-2000 text-white bg-black p-2 m-2 border-[1px]ot " defaultValue={"Hello"} onChange={updateMessage} />
                </label>
            </form>
            <button className="bg-black border-gray-300 rounded-lg border-[1px] text-white" onClick={postMessage}>Send</button>
        </div>
    )
}