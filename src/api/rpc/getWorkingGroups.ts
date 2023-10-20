import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";

import { toJoy } from "@/helpers";
import { GroupIdToGroupParam, GroupIdName } from "@/types";

export async function getWorkingGroups(api: ApiPromise, block?: HexString) {
  const _api = block ? await api.at(block) : api;
  const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
    const group = _group as GroupIdName;
    let workerNumber = 0;
    let activeWorkerNumber = 0;
    const budget = toJoy(await _api.query[group].budget());
    const currentLead = await _api.query[group].currentLead();
    const leadIdInWG = currentLead.isNone ? undefined : currentLead.unwrap();
    const leadMembershipId = leadIdInWG
      ? (await _api.query[group].workerById(leadIdInWG)).unwrap().memberId
      : undefined;
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
          activeWorkerNumber++;
        }
        workerNumber++;
      }
    }
    const wg = {
      id: group,
      leadMemebership: leadMembershipId
        ? leadMembershipId.toNumber()
        : undefined,
      budget,
      workers: activeWorkerNumber,
    };
    return wg;
  });
  const wgs = await Promise.all(promises);
  return wgs;
}
