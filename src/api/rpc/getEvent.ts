import { ApiPromise } from "@polkadot/api";
import mysql from 'mysql2';
import { EventRecord, Balance } from "@polkadot/types/interfaces";
import { Vec } from "@polkadot/types";
import { GenericEventData } from "@polkadot/types/generic/Event";
import { CacheEvent } from "./type";
import { getBlockHash } from "./getBlockHash";

export async function getEvent(
    api: ApiPromise,
    startBlock: number,
    endBlock: number
): Promise<Map<number, CacheEvent[]>> {
    let blocksEvents = new Map<number, CacheEvent[]>();

    for (let block = startBlock; block <= endBlock; block++) {
        let mint = 0;
        let burn = 0;
        let reward = 0;
        let query = 'insert into block_event (block_number,valid_reward,burn) VALUES ( ' + block + " ,";
        let blockHash = await getBlockHash(api, block);
        let eventRecord = await api.query.system.events.at(blockHash) as Vec<EventRecord>;
        console.log("current block ", block);
        let cacheEvents = new Array();
        for (let event of eventRecord) {
            if (event.event.section.toLowerCase() == 'balances') {
                if (event.event.method.toLowerCase() == 'withdraw') {
                    let amount = event.event.data[1] as Balance;
                    console.log("withdraw")
                    burn += Number(amount);
                }
                if (event.event.method.toLowerCase() == 'deposit') {
                    let amount = event.event.data[2] as Balance;
                    burn -= Number(amount);
                    console.log("deposit")
                }
            }
            if (event.event.section.toLowerCase() == 'staking' && event.event.method.toLowerCase() == 'reward') {
                let amount = event.event.data[1] as Balance;
                reward += Number(amount);
            }
            cacheEvents.push(new CacheEvent(event.event.section, event.event.method, event.event.data as GenericEventData));
        }
        query += reward + " , " + burn + " )";
        // connection.query(query, (err) => {
        //     if (err) console.log(err)
        // })
        blocksEvents.set(block, cacheEvents);
    }
    return blocksEvents;
}
