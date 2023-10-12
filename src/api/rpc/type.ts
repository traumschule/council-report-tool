import { GenericEventData } from "@polkadot/types/generic/Event";

export class CacheEvent {

    constructor(public section: string, public method: string, public data: GenericEventData) {

    }
}