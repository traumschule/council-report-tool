import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";

import { toJoy } from "@/helpers";
import { GroupIdToGroupParam, GroupIdName } from "@/types";
import { getFilledWorkers, getTerminateWorkers, getExitedWorkers } from "..";

export async function getWorkingGroups(api: ApiPromise, block?: HexString) {
  const _api = block ? await api.at(block) : api;
  const filled = await getFilledWorkers();
  const terminated = await getTerminateWorkers();
  const exited = await getExitedWorkers();
  const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
    const group = _group as GroupIdName;
    const budget = toJoy(await _api.query[group].budget());
    const currentLead = await _api.query[group].currentLead();
    const leadIdInWG = currentLead.isNone ? undefined : currentLead.unwrap();
    const leadMembershipId = leadIdInWG
      ? (await _api.query[group].workerById(leadIdInWG)).unwrap().memberId
      : undefined;
    const filledCount = filled.filter((a) => {
      return a.groupId == _group;
    }).length;
    const terminatedCount = terminated.filter((a) => {
      return a.groupId == _group;
    }).length;
    const exitedCount = exited.filter((a) => {
      return a.groupId == _group;
    }).length;
    const workers = filledCount - terminatedCount - exitedCount;
    // const workers = await _api.query[group].activeWorkerCount();
    const wg = {
      id: group,
      leadMemebership: leadMembershipId
        ? leadMembershipId.toNumber()
        : undefined,
      budget,
      workers,
    };
    return wg;
  });

  const wgs = await Promise.all(promises);

  return wgs;
}
