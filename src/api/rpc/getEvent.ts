import { ApiPromise } from "@polkadot/api";
import { EventRecord, Balance, AccountId, Extrinsic } from "@polkadot/types/interfaces";
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
    let mint = 0;
    let burn = 0;
    let reward = 0;
    for (let block = startBlock; block <= endBlock; block++) {
        let blockHash = await getBlockHash(api, block);
        let eventRecord = await api.query.system.events.at(blockHash) as Vec<EventRecord>;
        console.log("current block ", block);
        let cacheEvents = new Array();
        for (let event of eventRecord) {
            if (event.event.section.toLowerCase() == 'balances') {
                if (event.event.method.toLowerCase() == 'balanceset') {
                    let amount = event.event.data[1] as Balance;
                    console.log("BalanceSet");
                    console.log(event);
                    console.log(Number(amount))
                }
                if (event.event.method.toLowerCase() == 'transfer') {
                    let amount = event.event.data[2] as Balance;
                    console.log("Transfer");
                    console.log(event);
                    console.log(Number(amount))
                }
            }
            if (event.event.section.toLowerCase() == 'staking' && event.event.method.toLowerCase() == 'reward') {
                console.log("staking");
                console.log(event);
                let amount = event.event.data[1] as Balance;
                console.log(Number(amount));
            }
            cacheEvents.push(new CacheEvent(event.event.section, event.event.method, event.event.data as GenericEventData));
        }
        blocksEvents.set(block, cacheEvents);
    }
    return blocksEvents;
}
