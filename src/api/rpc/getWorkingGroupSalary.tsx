import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import { wgSalaryType } from "./type";
import { GroupIdToGroupParam, GroupIdName } from "@/types";
import { getWorkerByMemberId, getWGSpendingWithReceiverID } from "..";
import { string2Joy } from "@/helpers";

export async function getWorkingGroupSalary(api: ApiPromise, block: HexString, startDate: Date, endDate: Date, startBlockNumber: number, endBlockNumber: number) {

    const _api = block ? await api.at(block) : api;
    let salary = {} as {
        [key in GroupIdName]: wgSalaryType
    };
    const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
        const group = _group as GroupIdName;
        let workerNumber = 0;
        let wgSalary = {
            leadSalary: 0,
            workerSalary: 0,
            daoSpendingBudget: 0
        };
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
                    const memberId = workerInfo.memberId.toString();
                    const accounts: Array<string> = [];
                    const workerData = await getWorkerByMemberId(memberId);
                    accounts.push(workerData[0].roleAccount);
                    accounts.push(workerData[0].rewardPerBlock);
                    accounts.push(workerData[0].membership.controllerAccount);
                    accounts.push(workerData[0].membership.rootAccount);
                    const daoSpendingBudget = await getWGSpendingWithReceiverID(startBlockNumber, endBlockNumber, accounts);
                    let payout = 0;
                    workerData
                        .map((a) => {
                            a.payouts
                                .filter((a) => {
                                    return new Date(a.createdAt) >= startDate && new Date(a.createdAt) <= endDate;
                                })
                                .map((a) => {
                                    payout += string2Joy(a.amount);
                                })
                        });
                    wgSalary.daoSpendingBudget += Math.ceil(daoSpendingBudget);
                    if (i == Number(currentLead)) {
                        wgSalary.leadSalary += Math.ceil(daoSpendingBudget);
                        wgSalary.leadSalary += Math.ceil(payout);
                    } else {
                        wgSalary.workerSalary += Math.ceil(daoSpendingBudget);
                        wgSalary.workerSalary += Math.ceil(payout);
                    }

                }
                workerNumber++;
            }
        }
        salary[_group as GroupIdName] = wgSalary;
    });
    await Promise.all(promises);
    return salary;
}
