import { ApiPromise } from "@polkadot/api";
import moment from "moment";
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
  getValidatorReward,
  getWGApplication,
  getWGOpening,
  getWGFilledPosition

} from "@/api";
import { MEXC_WALLET, defaultDateTimeFormat } from "@/config";
import { toJoy } from "./bn";
import {
  GroupIdName,
  ProposalStatus,
  GroupIdToGroupParam,
  GroupShortIDName

} from "@/types";
import { decimalAdjust } from "./utils";
const INITIAL_SUPPLY = 1_000_000_000;

export async function generateReport1(api: ApiPromise, blockNumber: number, storageFlag: boolean) {
  const { GetVideoCount, GetChannelsCount, GetNftIssuedCount } =
    getSdk(graphQLClient);
  const blockHash = await getBlockHash(api, blockNumber);
  const blockTimestamp = new Date(
    (await (await api.at(blockHash)).query.timestamp.now()).toNumber()
  );
  const general = {
    block: blockNumber,
    hash: blockHash,
    timestamp: moment(blockTimestamp).format(defaultDateTimeFormat),
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

  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );

  const startBlock = {
    number: startBlockNumber,
    hash: startBlockHash,
    timestamp: moment(startBlockTimestamp).format(defaultDateTimeFormat),
  };

  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlock = {
    number: endBlockNumber,
    hash: endBlockHash,
    timestamp: moment(endBlockTimestamp).format(defaultDateTimeFormat),
  };
  const general = {
    startBlock,
    endBlock
  }
  // 2. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#issuance

  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));
  const issuanceChange = endIssuance - startIssuance;

  const issuance = {
    startBlock: startIssuance,
    endBlock: endIssuance,
    changedIssuance: issuanceChange
  }

  // 3. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#mexc-exchange-wallet

  const startBalance = toJoy(
    await getBalance(api, MEXC_WALLET, startBlockHash)
  );
  const endBalance = toJoy(
    await getBalance(api, MEXC_WALLET, endBlockHash));
  const mexcBalChange = endBalance - startBalance;
  const mexc = {
    startBlock: startBalance,
    endBlock: endBalance,
    changedBalance: mexcBalChange
  }

  // 4. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#supply-1

  const startInflation =
    ((startIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const endInflation = ((endIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const inflationChanged = endInflation - startInflation;

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
  const grandTotal = councilRewardBudget + wgSpentBudget + fundingProposalBudget + creatorPayoutRewardBudget + validatorRewardsBudget;
  const daoSpending = {
    councilReward: councilRewardBudget,
    wgSpent: wgSpentBudget,
    fundingProposals: fundingProposalBudget,
    creatorPayoutRewards: creatorPayoutRewardBudget,
    validatorRewards: validatorRewardsBudget,
    grandTotal
  };
  const supply = {
    inflationChanged,
    changedToken: issuanceChange,
    mintedToken: grandTotal,
    burnedToken: grandTotal - issuanceChange,
  };
  // 6. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#council-budget

  const { startCouncilBudget, endCouncilBudget } = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );
  const refillCouncilBudget = await getCouncilRefill(startBlockNumber, endBlockNumber);
  const councilBudget = {
    startBudget: startCouncilBudget,
    endBudget: endCouncilBudget,
    spendingBudget: (councilRewardBudget + creatorPayoutRewardBudget + wgSpentBudget + fundingProposalBudget),
    refillBudget: refillCouncilBudget,
  }

  // 7. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#wg-budgets

  const wgBudgets = {} as {
    [key in GroupShortIDName]: {
      startBudget: number;
      endBudget: number;
      totalRefilled: number;
      totalSpending: number;
      spendingProposals: number;
      leadSalary: number;
      workerSalary: number;
    }
  };
  const wgSpendingProposal = await getWGSpendingProposal(startBlockNumber, endBlockNumber);
  const wgSpending = await getWGSpendingBudget(startBlockNumber, endBlockNumber);
  const wgSalary = await getWorkingGroupSalary(api, endBlockHash, startBlockTimestamp, endBlockTimestamp, startBlockNumber, endBlockNumber);
  const promises = Object.keys(GroupIdToGroupParam)
    .map(async (_group) => {
      let wgData = {
        startBudget: wgBudget[_group as GroupIdName].startBudget,
        endBudget: wgBudget[_group as GroupIdName].endBudget,
        totalRefilled: 0,
        totalSpending: 0,
        leadSalary: wgSalary[_group as GroupIdName].leadSalary,
        workerSalary: wgSalary[_group as GroupIdName].workerSalary,
        spendingProposals: 0
      }
      wgData.totalSpending = wgData.leadSalary + wgData.workerSalary;
      if (wgSpending[_group as GroupIdName]) {
        wgData.totalSpending += wgSpending[_group as GroupIdName];
      }
      if (wgSpendingProposal[_group as GroupIdName]) {
        wgData.spendingProposals = wgSpendingProposal[_group as GroupIdName];
        wgData.totalSpending += wgSpendingProposal[_group as GroupIdName];
      }
      if (wgRefillProposal[_group as GroupIdName]) {
        wgData.totalRefilled = wgRefillProposal[_group as GroupIdName];
      }
      wgBudgets[GroupIdToGroupParam[_group as GroupIdName] as GroupShortIDName] = wgData;
    });

  await Promise.all(promises);
  // 8. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#videos
  const videos = await getVideoStatus(
    startBlockNumber,
    endBlockNumber
  );

  const mediaStorage = {
    startBlock: 0,
    endBlock: 0,
    growthQty: 0,
    growthPct: 0
  }

  if (storageFlag) {
    const { startStorage, endStorage } = await getStorageStatusByBlock(endBlockTimestamp, startBlockTimestamp);
    mediaStorage.startBlock = startStorage;
    mediaStorage.endBlock = endStorage;
    mediaStorage.growthQty = decimalAdjust(endStorage - startStorage);
    mediaStorage.growthPct = decimalAdjust((endStorage / startStorage - 1)) * 100;
  }

  // 9. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#channels
  const { startCount, endCount } = await getChannelStatus(
    endBlockNumber,
    startBlockTimestamp
  );
  const nonEmptyChannel = {
    startBlock: startCount,
    endBlock: endCount,
    growthQty: (endCount - startCount),
    growthPct: (endCount / startCount - 1) * 100
  }

  // 11. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#video-nfts
  const videoNFTs = await getVideoNftStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 12. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#membership-1
  const membership = await getMembershipStatus(
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


  const executed = proposals
    .filter((p) => p.status === "executed");

  const notPassedStatuses: ProposalStatus[] = [
    "vetoed",
    "executionFailed",
    "slashed",
    "rejected",
    "expired",
    "cancelled",
    "canceledByRuntime",
  ];
  const notPassed = proposals
    .filter((p) =>
      notPassedStatuses.includes(p.status)
    );
  const underReviewStatuses: ProposalStatus[] = [
    "deciding",
    "gracing",
    "dormant",
  ];
  const underReview = proposals
    .filter((p) =>
      underReviewStatuses.includes(p.status)
    );

  return {
    general,
    issuance,
    mexc,
    supply,
    daoSpending,
    councilBudget,
    wgBudgets,
    videos,
    nonEmptyChannel,
    videoNFTs,
    membership,
    mediaStorage: storageFlag ? mediaStorage : undefined,
    proposals: {
      executed,
      notPassed,
      underReview,
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
  let mediaStorage = {
    startBlock: 0,
    endBlock: 0,
    growthQty: 0,
    growthPct: 0
  };
  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );

  // nonEmptyChannel

  const { startCount, endCount } = await getChannelStatus(endBlockNumber, startBlockTimestamp);
  const nonEmptyChannel = {
    startBlock: startCount,
    endBlock: endCount,
    growthQty: (endCount - startCount),
    growthPct: (endCount / startCount - 1) * 100
  }

  // video

  const videos = await getVideoStatus(startBlockNumber, endBlockNumber);

  // storage

  if (storageFlag) {
    const { endStorage, startStorage } = await getStorageStatusByBlock(endBlockTimestamp, startBlockTimestamp);
    mediaStorage.startBlock = startStorage;
    mediaStorage.endBlock = endStorage;
    mediaStorage.growthQty = decimalAdjust(endStorage - startStorage);
    mediaStorage.growthPct = (endStorage / startStorage - 1) * 100;
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
    startBlock: startIssuance,
    endBlock: endIssuance,
    changedIssuance: issuanceChange,
    Inflation: issuanceChange / Math.pow(10, 9)
  }

  // available working group budget
  let wgBudgets = {} as {
    [key in GroupShortIDName]: {
      startWGBudget: number
      endWGBudget: number;
      refillBudget: number;
      discretionarySpending: number;
      spendingProposal: number
      workerRewards: number;
      leadRewards: number;
    }
  }
  const daoSpending = await getWGSpendingBudget(startBlockNumber, endBlockNumber);
  const wgSpendingProposal = await getWGSpendingProposal(startBlockNumber, endBlockNumber);
  const wgSalary = await getWorkingGroupSalary(api, endBlockHash, startBlockTimestamp, endBlockTimestamp, startBlockNumber, endBlockNumber);
  Object.keys(GroupIdToGroupParam)
    .map(async (_group) => {
      let wgData = {
        startWGBudget: wgBudget[_group as GroupIdName].startBudget,
        endWGBudget: wgBudget[_group as GroupIdName].endBudget,
        discretionarySpending: daoSpending[_group as GroupIdName],
        spendingProposal: 0,
        refillBudget: 0,
        workerRewards: wgSalary[_group as GroupIdName].workerSalary,
        leadRewards: wgSalary[_group as GroupIdName].leadSalary,
      }
      if (wgSpendingProposal[_group as GroupIdName]) {
        wgData.spendingProposal = wgSpendingProposal[_group as GroupIdName];
      }
      if (wgRefillProposal[_group as GroupIdName]) {
        wgData.refillBudget = wgRefillProposal[_group as GroupIdName];
      }
      wgBudgets[GroupIdToGroupParam[_group as GroupIdName] as GroupShortIDName] = wgData;
    });
  // Working Group Opening Application FilledPosition
  const wgOpening = await getWGOpening(startBlockTimestamp, endBlockTimestamp);
  const wgApplication = await getWGApplication(startBlockTimestamp, endBlockTimestamp);
  const wgFilledPosition = await getWGFilledPosition(startBlockTimestamp, endBlockTimestamp);

  return {
    nonEmptyChannel,
    videos,
    mediaStorage: storageFlag ? mediaStorage : undefined,
    councilBudget,
    inflation,
    wgBudgets,
    forum,
    proposal,
    membership,
    wgOpening,
    wgApplication,
    wgFilledPosition
  };
}
