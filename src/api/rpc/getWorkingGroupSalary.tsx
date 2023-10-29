import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";


import BN from "bn.js";
import { Worker } from "./type";
import { GroupIdToGroupParam, GroupIdName } from "@/types";
import { toJoy } from "@/helpers";

export async function getWorkingGroupSalary(api: ApiPromise, block?: HexString) {
    const _api = block ? await api.at(block) : api;
    let salary = {} as {
        [key in GroupIdName]: Array<Worker>
    };
    const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
        const group = _group as GroupIdName;
        let workerList: Array<Worker> = [];
        let workerNumber = 0;
        const currentLead = await _api.query[group].currentLead();
        const _activeWorkers = await _api.query[group].activeWorkerCount();
        const _nextWorkerId = await _api.query[group].nextWorkerId();
        const activeWorkers = Number(_activeWorkers);
        const nextWorkerId = Number(_nextWorkerId);
        for (let i = 0; i < nextWorkerId; i++) {
            const _workerInfo = (await _api.query[group].workerById(i));
            if (activeWorkers == workerNumber)
                continue;
            if (!_workerInfo.isNone) {
                const workerInfo = _workerInfo.unwrap();
                if (workerInfo.startedLeavingAt.isNone) {
                    let worker = {
                        memeberId: Number(workerInfo.memberId),
                        handle: "",
                        reward: Number(workerInfo.rewardPerBlock),
                        isLead: false,
                        rewardAccount: String(workerInfo.rewardAccountId)
                    };
                    Object.keys(GroupIdToGroupParam)
                        .map((groupId) => {
                            if (salary[groupId as GroupIdName]) {
                                for (let j = 0; j < salary[groupId as GroupIdName].length; j++) {
                                    if (salary[groupId as GroupIdName][j].memeberId == Number(workerInfo.memberId)) {
                                        salary[groupId as GroupIdName][j].reward += Number(workerInfo.rewardPerBlock);
                                        worker.reward = salary[groupId as GroupIdName][j].reward
                                    }
                                }
                            }
                        })
                    if (i == Number(currentLead))
                        worker.isLead = true;
                    workerList.push(worker);
                }
                workerNumber++;
            }
        }
        salary[_group as GroupIdName] = workerList;
    });
    await Promise.all(promises);
    return salary;
}
