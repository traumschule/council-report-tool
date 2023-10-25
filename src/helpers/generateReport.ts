import { ApiPromise } from "@polkadot/api";
import {
  getBalance,
  getBlockHash,
  getCouncilBudget,
  getChannelStatus,
  getMembershipStatus,
  getProposals,
  getVideoNftStatus,
  getVideoStatus,
  getTotalSupply,
  getForumStatus,
  getWorkingGroupStatus,
  getMembershipCount,
  getOfficialCirculatingSupply,
  getOfficialTotalSupply,
  getWorkingGroupBudget,
  getWGRefillProposal,
  getWGSpendingProposal,
  client as graphQLClient,
  getSdk,
  getWorkingGroups,
  getStorageStatusByBlock,
  getWorkingGroupSalary,
  getCouncilReward,
  getWGSpendingBudget,
  getFundingProposal,
  getCreatorPayoutReward,
  getCouncilRefill,
  getWGSpendingWithReceiverID,
  getValidatorReward

} from "@/api";
import { MEXC_WALLET } from "@/config";
import { toJoy } from "./bn";
import { BN } from "bn.js";
import { GroupIdName, ProposalStatus, GroupIdToGroupParam } from "@/types";
import { decimalAdjust } from "./utils";
const INITIAL_SUPPLY = 1_000_000_000;

export async function generateReport1(api: ApiPromise, blockNumber: number, storageFlag: boolean) {
  const { GetVideoCount, GetChannelsCount, GetNftIssuedCount, GetMembers } =
    getSdk(graphQLClient);
  const blockHash = await getBlockHash(api, blockNumber);
  const blockTimestamp = new Date(
    (await (await api.at(blockHash)).query.timestamp.now()).toNumber()
  );
  const general = {
    block: blockNumber,
    hash: blockHash,
    timestamp: blockTimestamp,
  };
  const {
    videosConnection: { totalCount: videoCount },
  } = await GetVideoCount({
    where: { createdInBlock_lte: blockNumber },
  });
  const {
    channelsConnection: { totalCount: channelCount },
  } = await GetChannelsCount({
    where: {
      createdAt_lte: blockTimestamp,
    },
  });
  const { endCount } = await getChannelStatus(blockNumber);
  const {
    nftIssuedEventsConnection: { totalCount: nftCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: blockTimestamp },
  });
  let content = {
    videoCount,
    channelCount,
    nonEmptyChannelCount: endCount,
    nftCount,
    totalStorage: 0
  };
  if (storageFlag) {
    const { endStorage } = await getStorageStatusByBlock(blockTimestamp);
    content.totalStorage = endStorage
  }

  const totalSupply = toJoy(await getTotalSupply(api, blockHash));
  const currentTotalSupply = await getOfficialTotalSupply();
  const currentCirculatingSupply = await getOfficialCirculatingSupply();

  const inflation = ((totalSupply - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;

  const supply = {
    totalSupply,
    currentTotalSupply,
    currentCirculatingSupply,
    inflation,
  };

  const totalMembership = await getMembershipCount(blockTimestamp);
  const workingGroups = await getWorkingGroups(api, blockHash);

  const { memberships } = await GetMembers({
    where: {
      id_in: workingGroups.map((w) => w.leadMemebership?.toString() || ""),
    },
  });
  workingGroups.forEach((wg, idx) => {
    workingGroups[idx] = {
      ...workingGroups[idx],
      // @ts-ignore
      leadMemebership: memberships.find(
        (m) => m.id === workingGroups[idx].leadMemebership?.toString()
      )?.handle,
    };
  });

  return {
    general,
    content,
    supply,
    totalMembership,
    workingGroups,
  };
}

export async function generateReport2(
  api: ApiPromise,
  storageFlag: boolean,
  startBlockNumber: number,
  endBlockNumber: number,
) {
  // 1. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#general-1
  let storageStatus = {
    startBlock: 0,
    endBlock: 0,
    growthQty: 0,
    growth: 0
  };

  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );

  // const blockHeader = await api.rpc.chain.getBlock(startBlockHash);
  const startBlock = {
    number: startBlockNumber,
    hash: startBlockHash,
    timestamp: startBlockTimestamp,
  };

  // If end block number isn't provided use current block number
  if (!endBlockNumber) {
    const blockHeader = await api.rpc.chain.getHeader();
    const blockNumber = blockHeader.number.toNumber();
    endBlockNumber = blockNumber;
  }

  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlock = {
    number: endBlockNumber,
    hash: endBlockHash,
    timestamp: endBlockTimestamp,
  };

  // 2. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#issuance
  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));
  const issuanceChange = endIssuance - startIssuance;

  // 3. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#mexc-exchange-wallet
  const startBalance = toJoy(
    await getBalance(api, MEXC_WALLET, startBlockHash)
  );
  const endBalance = toJoy(
    await getBalance(api, MEXC_WALLET, endBlockHash));
  const mexcBalChange = endBalance - startBalance;

  // 4. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#supply-1

  const startInflation =
    ((startIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const endInflation = ((endIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const inflationChange = endInflation - startInflation;

  const supply = {
    inflationChange,
    TokensMinted: issuanceChange,
    // TokensBurned: burn,
  };

  // 5. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#dao-spending
  const councilReward = await getCouncilReward(startBlockNumber, endBlockNumber);
  const councilRewardBudget = councilReward.reduce((a, b) => a + b.amount, 0);
  let wgSpentBudget = 0;
  const validatorRewardsBudget = await getValidatorReward(api, startBlockHash, endBlockHash);
  const wgBudget = await getWorkingGroupBudget(api, startBlockHash, endBlockHash);
  const wgRefillProposal = await getWGRefillProposal(startBlockTimestamp, endBlockTimestamp);
  Object.keys(wgBudget).map((wgName) => {
    wgSpentBudget += wgBudget[wgName as GroupIdName].startBudget;
    wgSpentBudget -= wgBudget[wgName as GroupIdName].endBudget;
    if (wgRefillProposal[wgName as GroupIdName]) {
      wgSpentBudget += wgRefillProposal[wgName as GroupIdName];
    }
  });
  const creatorPayoutRewardBudget = await getCreatorPayoutReward(startBlockNumber, endBlockNumber);
  const fundingProposalBudget = await getFundingProposal(startBlockNumber, endBlockNumber);
  const daoSpending = {
    councilReward: councilRewardBudget,
    wgSpent: wgSpentBudget,
    fundingProposals: fundingProposalBudget,
    creatorPayoutRewards: creatorPayoutRewardBudget,
    validatorRewards: validatorRewardsBudget,
    grandTotal: (councilRewardBudget + wgSpentBudget + fundingProposalBudget + creatorPayoutRewardBudget + validatorRewardsBudget)
  };

  // 6. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#council-budget

  const { startCouncilBudget, endCouncilBudget } = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );
  const refillCouncilBudget = await getCouncilRefill(startBlockNumber, endBlockNumber);
  const councilBudget = {
    startCouncilBudget,
    spendingCouncilBudget: (councilRewardBudget + creatorPayoutRewardBudget + wgSpentBudget + fundingProposalBudget),
    refillCouncilBudget,
    endCouncilBudget
  }

  // 7. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#wg-budgets

  const wgBudgets = {} as {
    [key in GroupIdName]: {
      startBudget: number;
      totalRefilled: number;
      totalSpending: number;
      endBudget: number;
      leadSalary: number;
      workerSalary: number;
      spendingProposal: number;
    };
  };
  const wgSpendingProposal = await getWGSpendingProposal(startBlockNumber, endBlockNumber);
  const wgSpending = await getWGSpendingBudget(startBlockNumber, endBlockNumber);
  const wgSalary = await getWorkingGroupSalary(api, endBlockHash);
  const promises = Object.keys(GroupIdToGroupParam)
    .map(async (_group) => {
      let wgData = {
        startBudget: wgBudget[_group as GroupIdName].startBudget,
        endBudget: wgBudget[_group as GroupIdName].endBudget,
        totalRefilled: 0,
        totalSpending: 0,
        leadSalary: 0,
        workerSalary: 0,
        spendingProposal: 0
      }
      const leadMember = wgSalary[_group as GroupIdName]
        .find((a) => {
          return a.isLead == true;
        });

      if (leadMember) {
        const leadSpending = await getWGSpendingWithReceiverID(startBlockNumber, endBlockNumber, leadMember.rewardAccount);
        wgData.leadSalary += toJoy(new BN(leadMember.reward * (endBlockNumber - startBlockNumber))) + leadSpending;
        const leadCouncilReward = councilReward
          .filter((c) => {
            return Number(c.memberId) == leadMember.memeberId
          })
          .reduce((a, b) => a + b.amount, 0);
        wgData.leadSalary += leadCouncilReward;
      }
      wgData.workerSalary = wgSalary[_group as GroupIdName]
        .reduce((a, b) => a + b.reward * (endBlockNumber - startBlockNumber), 0);
      wgData.workerSalary = toJoy(new BN(wgData.workerSalary));
      wgData.totalSpending = wgData.workerSalary;
      if (wgSpending[_group as GroupIdName]) {

        wgData.workerSalary += wgSpending[_group as GroupIdName];
        wgData.totalSpending += wgSpending[_group as GroupIdName];
      }
      if (wgSpendingProposal[_group as GroupIdName]) {
        wgData.spendingProposal = wgSpendingProposal[_group as GroupIdName];
        wgData.totalSpending += wgSpendingProposal[_group as GroupIdName];
      }
      if (wgRefillProposal[_group as GroupIdName]) {
        wgData.totalRefilled = wgRefillProposal[_group as GroupIdName];
      }
      wgBudgets[_group as GroupIdName] = wgData;
    });
  await Promise.all(promises);
  // 8. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#videos
  const videoStatus = await getVideoStatus(
    startBlockNumber,
    endBlockNumber
  );
  if (storageFlag) {
    const { startStorage, endStorage } = await getStorageStatusByBlock(endBlockTimestamp, startBlockTimestamp);
    storageStatus.startBlock = startStorage;
    storageStatus.endBlock = endStorage;
    storageStatus.growthQty = decimalAdjust(endStorage - startStorage);
    storageStatus.growth = decimalAdjust((endStorage / startStorage - 1)) * 100;
  }

  // 9. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#channels
  const { startCount, endCount } = await getChannelStatus(
    endBlockNumber,
    startBlockTimestamp
  );
  const nonEmptyChannelStatus = {
    startCount,
    endCount,
    growthQty: (endCount - startCount),
    growth: (endCount / startCount - 1) * 100
  }

  // 11. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#video-nfts
  const videoNftStatus = await getVideoNftStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 12. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#membership-1
  const membershipStatus = await getMembershipStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 13. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#proposals
  const proposals = (
    await getProposals(startBlockTimestamp, endBlockTimestamp)
  ).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt,
    councilApprovals: p.councilApprovals,
  }));

  const executedProposals = proposals.filter((p) => p.status === "executed");

  const notPassedStatuses: ProposalStatus[] = [
    "vetoed",
    "executionFailed",
    "slashed",
    "rejected",
    "expired",
    "cancelled",
    "canceledByRuntime",
  ];
  const notPassedProposals = proposals.filter((p) =>
    notPassedStatuses.includes(p.status)
  );

  const underReviewStatuses: ProposalStatus[] = [
    "deciding",
    "gracing",
    "dormant",
  ];
  const underReviewProposals = proposals.filter((p) =>
    underReviewStatuses.includes(p.status)
  );

  return {
    general: {
      startBlock,
      endBlock,
    },
    issuance: {
      startIssuance,
      endIssuance,
      issuanceChange,
    },
    mexc: {
      startBalance,
      endBalance,
      mexcBalChange,
    },
    supply,
    daoSpending,
    councilBudget,
    wgBudgets,
    videoStatus,
    nonEmptyChannelStatus,
    videoNftStatus,
    membershipStatus,
    storageStatus,
    proposals: {
      proposals,
      executedProposals,
      notPassedProposals,
      underReviewProposals,
    },
  };
}

// Council report
export async function generateReport4(
  api: ApiPromise,
  startBlockNumber: number,
  endBlockNumber: number,
  storageFlag: boolean
) {
  let storageStatus = {
    totalStorageUsed: 0,
    storageChanged: 0
  };
  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );

  // working group status

  const workingGroup = await getWorkingGroupStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // nonEmptyChannel

  const { startCount, endCount } = await getChannelStatus(endBlockNumber, startBlockTimestamp);
  const nonEmptyChannel = {
    startCount,
    endCount,
    growthQty: (endCount - startCount),
    growth: (endCount / startCount - 1) * 100
  }

  // video

  const video = await getVideoStatus(startBlockNumber, endBlockNumber);

  // storage

  if (storageFlag) {
    const { endStorage, startStorage } = await getStorageStatusByBlock(endBlockTimestamp, startBlockTimestamp);
    storageStatus.totalStorageUsed = endStorage;
    storageStatus.storageChanged = decimalAdjust(endStorage - startStorage);
  }

  // forum

  const forum = await getForumStatus(startBlockTimestamp, endBlockTimestamp);

  // proposal

  const proposals = await getProposals(startBlockTimestamp, endBlockTimestamp);
  const proposal = {
    total: proposals.length,
    passed: proposals.filter((p) => p.status === "executed").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
    expired: proposals.filter((p) => p.status === "expired").length,
  };

  // membership

  const membership = await getMembershipStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // available council budget

  const { startCouncilBudget, endCouncilBudget } = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );
  const refillCouncilBudget = await getCouncilRefill(startBlockNumber, endBlockNumber);
  const councilReward = await getCouncilReward(startBlockNumber, endBlockNumber);
  const councilRewardBudget = councilReward.reduce((a, b) => a + b.amount, 0);
  let wgSpentBudget = 0;
  const validatorRewardsBudget = await getValidatorReward(api, startBlockHash, endBlockHash);
  const wgBudget = await getWorkingGroupBudget(api, startBlockHash, endBlockHash);
  const wgRefillProposal = await getWGRefillProposal(startBlockTimestamp, endBlockTimestamp);
  Object.keys(wgBudget).map((wgName) => {
    wgSpentBudget += wgBudget[wgName as GroupIdName].startBudget;
    wgSpentBudget -= wgBudget[wgName as GroupIdName].endBudget;
    if (wgRefillProposal[wgName as GroupIdName]) {
      wgSpentBudget += wgRefillProposal[wgName as GroupIdName];
    }
  });
  const creatorPayoutRewardBudget = await getCreatorPayoutReward(startBlockNumber, endBlockNumber);
  const fundingProposalBudget = await getFundingProposal(startBlockNumber, endBlockNumber);
  const councilBudget = {
    startCouncilBudget,
    spendingCouncilBudget: (councilRewardBudget + creatorPayoutRewardBudget + wgSpentBudget + fundingProposalBudget),
    refillCouncilBudget,
    councilReward: councilRewardBudget,
    wgSpent: wgSpentBudget,
    fundingProposals: fundingProposalBudget,
    creatorPayoutRewards: creatorPayoutRewardBudget,
    validatorRewards: validatorRewardsBudget,
    endCouncilBudget
  }

  // inflation 

  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));
  const issuanceChange = endIssuance - startIssuance;
  const inflation = {
    startIssuance,
    endIssuance,
    termIssuance: issuanceChange,
    Inflation: (endIssuance / startIssuance - 1) * 100
  }

  // available working group budget
  let wgBudgets = {} as {
    [key in GroupIdName]: {
      startWGBudget: number
      endWGBudget: number;
      discretionarySpending: number;
      spendingProposal: number
      workerRewards: number;
      leadRewards: number;
    }
  }
  const wgSpendingProposal = await getWGSpendingProposal(startBlockNumber, endBlockNumber);
  const wgSpending = await getWGSpendingBudget(startBlockNumber, endBlockNumber);
  const wgSalary = await getWorkingGroupSalary(api, endBlockHash);
  Object.keys(GroupIdToGroupParam)
    .map(async (_group) => {
      let wgData = {
        startWGBudget: wgBudget[_group as GroupIdName].startBudget,
        endWGBudget: wgBudget[_group as GroupIdName].endBudget,
        discretionarySpending: 0,
        spendingProposal: 0,
        workerRewards: 0,
        leadRewards: 0,
      }
      const leadMember = wgSalary[_group as GroupIdName]
        .find((a) => {
          return a.isLead == true;
        });

      if (leadMember) {
        const leadSpending = await getWGSpendingWithReceiverID(startBlockNumber, endBlockNumber, leadMember.rewardAccount);
        wgData.leadRewards += toJoy(new BN(leadMember.reward * (endBlockNumber - startBlockNumber))) + leadSpending;
        const leadCouncilReward = councilReward
          .filter((c) => {
            return Number(c.memberId) == leadMember.memeberId
          })
          .reduce((a, b) => a + b.amount, 0);
        wgData.leadRewards += leadCouncilReward;
      }
      wgData.workerRewards = toJoy(new BN(
        wgSalary[_group as GroupIdName]
          .reduce((a, b) => a + b.reward * (endBlockNumber - startBlockNumber), 0)
      ));
      if (wgSpending[_group as GroupIdName]) {
        wgData.workerRewards += wgSpending[_group as GroupIdName];
      }
      if (wgSpendingProposal[_group as GroupIdName]) {
        wgData.spendingProposal = wgSpendingProposal[_group as GroupIdName];
      }
      wgBudgets[_group as GroupIdName] = wgData;
    });

  return {
    nonEmptyChannel,
    video,
    storage: storageStatus,
    councilBudget,
    inflation,
    wgBudgets,
    forum,
    proposal,
    membership,
    workingGroup,
  };
}
