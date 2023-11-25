import { ApiPromise } from "@polkadot/api";
import moment from "moment";
import {
  getBalance,
  getBlockHash,
  getChannelStatus,
  getMembershipStatus,
  getProposals,
  getVideoNftStatus,
  getVideoStatus,
  getTotalSupply,
  getMembershipCount,
  getOfficialCirculatingSupply,
  getOfficialTotalSupply,
  getWorkingGroupBudget,
  getWGRefillProposal,
  client as graphQLClient,
  getSdk,
  getWorkingGroups,
  getStorageStatus,
  getWorkingGroupSalary,
  getCouncilReward,
  getFundingProposal,
  getCreatorPayoutReward,
  getValidatorReward,
  getWGWorkerStatus,
  getElectionRoundWithUniqueID,
  getElectedCouncils
} from "@/api";
import { MEXC_WALLET, defaultDateTimeFormat } from "@/config";
import { toJoy, string2Joy, } from "./bn";
import BN from "bn.js";
import {
  GroupIdName,
  ProposalStatus,
  GroupIdToGroupParam,
  GroupShortIDName,
  OverallBudgetKeys

} from "@/types";
import { decimalAdjust, decimal3DAdjust } from "./utils";
import { DailyData } from "@/hooks/types";
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
    const { endStorage } = await getStorageStatus(blockTimestamp);
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

  // // 5. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#dao-spending
  const councilReward = await getCouncilReward(startBlockNumber, endBlockNumber);
  const councilRewardBudget = councilReward.reduce((a, b) => a + b.amount, 0);
  const validatorRewardsBudget = await getValidatorReward(api, startBlockHash, endBlockHash);
  const wgSalary = await getWorkingGroupSalary(api, endBlockHash, startBlockTimestamp, endBlockTimestamp, startBlockNumber, endBlockNumber);
  const wgSpent = Object.keys(wgSalary)
    .reduce((a, b) => a + wgSalary[b as GroupIdName].leadSalary + wgSalary[b as GroupIdName].workerSalary, 0);

  const creatorPayoutRewardBudget = await getCreatorPayoutReward(startBlockNumber, endBlockNumber);
  const fundingProposalBudget = await getFundingProposal(startBlockNumber, endBlockNumber);
  const grandTotal = councilRewardBudget + wgSpent + fundingProposalBudget + creatorPayoutRewardBudget + validatorRewardsBudget;
  const daoSpending = {
    startIssuance,
    endIssuance,
    mintedToken: grandTotal,
    councilReward: councilRewardBudget,
    wgSpent: wgSpent,
    fundingProposals: fundingProposalBudget,
    creatorPayoutRewards: creatorPayoutRewardBudget,
    validatorRewards: validatorRewardsBudget,
    fees: grandTotal - issuanceChange,
    grandTotal
  };
  const totalSupply = await getOfficialTotalSupply();
  const circulatingSupply = await getOfficialCirculatingSupply();
  const supply = {
    totalSupply,
    inflationChanged,
    circulatingSupply,
    mintedToken: issuanceChange,
    burnedToken: grandTotal - issuanceChange,
  };

  // 8. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#videos
  const videos = await getVideoStatus(
    startBlockNumber,
    endBlockNumber
  );

  const mediaStorage = {
    startBlock: 0,
    endBlock: 0,
    growthQty: 0,
    growthPct: 0,
    chartData: [] as Array<DailyData>
  }

  if (storageFlag) {
    const { startStorage, endStorage, chartData } = await getStorageStatus(endBlockTimestamp, startBlockTimestamp);
    mediaStorage.startBlock = startStorage;
    mediaStorage.endBlock = endStorage;
    mediaStorage.growthQty = decimalAdjust(endStorage - startStorage);
    mediaStorage.growthPct = decimalAdjust((endStorage / startStorage - 1)) * 100;
    mediaStorage.chartData = chartData;
  }

  // 9. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#channels
  const nonEmptyChannelStatus = await getChannelStatus(
    endBlockNumber,
    startBlockTimestamp
  );
  const nonEmptyChannel = {
    startBlock: nonEmptyChannelStatus.startCount,
    endBlock: nonEmptyChannelStatus.endCount,
    growthQty: (nonEmptyChannelStatus.endCount - nonEmptyChannelStatus.startCount),
    growthPct: decimalAdjust((nonEmptyChannelStatus.endCount / nonEmptyChannelStatus.startCount - 1) * 100),
    chartData: nonEmptyChannelStatus.chartData
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
  const deciding = proposals
    .filter((p) => p.status === "deciding");
  // const notPassedStatuses: ProposalStatus[] = [
  //   "vetoed",
  //   "executionFailed",
  //   "slashed",
  //   "rejected",
  //   "expired",
  //   "cancelled",
  //   "canceledByRuntime",
  // ];
  // const notPassed = proposals
  //   .filter((p) =>
  //     notPassedStatuses.includes(p.status)
  //   );
  // const underReviewStatuses: ProposalStatus[] = [
  //   "deciding",
  //   "gracing",
  //   "dormant",
  // ];
  // const underReview = proposals
  //   .filter((p) =>
  //     underReviewStatuses.includes(p.status)
  //   );

  return {
    general,
    issuance,
    mexc,
    supply,
    daoSpending,
    videos,
    nonEmptyChannel,
    videoNFTs,
    membership,
    mediaStorage: storageFlag ? mediaStorage : undefined,
    proposals: {
      executed,
      deciding
    },
  };
}

// Council report
export async function generateReport4(
  api: ApiPromise,
  roundNumber: string,
  startBlockNumber: number,
  endBlockNumber: number,
  prevEMA: number,
  curEMA: Number,
  storageFlag: boolean,
) {
  // general
  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );
  let currentTerm = 0;
  const general = {
    startBlock: {
      block: startBlockNumber,
      hash: startBlockHash,
      timeStamp: moment(startBlockTimestamp).format(defaultDateTimeFormat)
    },
    endBlock: {
      block: endBlockNumber,
      hash: endBlockHash,
      timeStamp: moment(endBlockTimestamp).format(defaultDateTimeFormat)
    }
  }
  // composition 
  const electionRound = await getElectionRoundWithUniqueID(roundNumber);
  let composition = undefined;
  if (!electionRound) {
    composition = undefined;
  } else {
    const castVotes = electionRound.castVotes.reduce((a, b) => a + string2Joy(b.stake), 0);
    currentTerm = electionRound.cycleId;
    const candiates: Array<{
      member: string,
      pct: number
    }> = [];
    electionRound.candidates.map((c) => {
      let candiate = {
        member: c.member.handle,
        pct: Math.ceil(string2Joy(c.votePower) / castVotes * 100)
      }
      candiates.push(candiate);
    })
    composition = {
      id: electionRound.id,
      candiates
    }
  }

  // EMA 30

  const EMA30 = {
    prevEMA,
    curEMA
  }
  // inflation 

  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));
  const startInflation = ((startIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const endInflation = ((endIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const inflationChange = endInflation - startInflation;
  const issuanceChange = endIssuance - startIssuance;

  let projectInflations: Array<{
    term: number;
    mintedToken: number;
    inflation: number;
  }> = [];
  const electedCouncils = await getElectedCouncils();

  const promise = electedCouncils.map(async (e, index) => {
    if (e.endedAtBlock) {
      let inflation_tmp = {
        term: index + 1,
        mintedToken: 0,
        inflation: 0
      }
      const startElectedBlockHash = await getBlockHash(api, e.electedAtBlock);
      const endElectedBlockHash = await getBlockHash(api, e.endedAtBlock);
      const startElectedIssuance = toJoy(await getTotalSupply(api, startElectedBlockHash));
      const endElectedIssuance = toJoy(await getTotalSupply(api, endElectedBlockHash));
      const changedIssuanceOfElection = (endElectedIssuance - startElectedIssuance) / Math.pow(10, 6);
      const startElectedInflation = ((startElectedIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
      const endElectedInflation = ((endElectedIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
      const inflationChanged = endElectedInflation - startElectedInflation;
      inflation_tmp.inflation = decimal3DAdjust(inflationChanged);
      inflation_tmp.mintedToken = decimalAdjust(changedIssuanceOfElection);
      projectInflations.push(inflation_tmp);
    }
  });

  await Promise.all(promise);
  projectInflations = projectInflations.sort((a, b) => {
    return a.term - b.term;
  })
  let yearMintedToken = projectInflations.reduce((a, b) => a + b.mintedToken, 0);
  let yearInflation = projectInflations.reduce((a, b) => a + b.inflation, 0);
  if (projectInflations.length < 24) {
    const leftCouncil = 24 - projectInflations.length;
    yearMintedToken += leftCouncil * issuanceChange / Math.pow(10, 6);
    yearInflation += leftCouncil * inflationChange;
  }
  const inflation = {
    startBlock: startIssuance,
    endBlock: endIssuance,
    changedIssuance: issuanceChange,
    Inflation: inflationChange,
    yearMintedToken: decimalAdjust(yearMintedToken),
    yearInflation: decimal3DAdjust(yearInflation)
  }

  const wgWorkerStatus = await getWGWorkerStatus(api, endBlockHash, startBlockTimestamp, endBlockTimestamp);

  // nonEmptyChannel

  // const { startCount, endCount } = await getChannelStatus(endBlockNumber, startBlockTimestamp);
  // const nonEmptyChannel = {
  //   startBlock: startCount,
  //   endBlock: endCount,
  //   growthQty: (endCount - startCount),
  //   growthPct: (endCount / startCount - 1) * 100
  // }

  // video

  // const videos = await getVideoStatus(startBlockNumber, endBlockNumber);

  // storage
  let mediaStorage = {
    startBlock: 0,
    endBlock: 0,
    growthQty: 0,
    growthPct: 0
  };
  if (storageFlag) {
    const { endStorage, startStorage } = await getStorageStatus(endBlockTimestamp, startBlockTimestamp);
    mediaStorage.startBlock = startStorage;
    mediaStorage.endBlock = endStorage;
    mediaStorage.growthQty = decimalAdjust(endStorage - startStorage);
    mediaStorage.growthPct = (endStorage / startStorage - 1) * 100;
  }

  // membership

  // const membership = await getMembershipStatus(
  //   startBlockTimestamp,
  //   endBlockTimestamp
  // );

  // calculate the current WG budget
  let wgBudgetsOfJoy = {} as {
    [key in GroupShortIDName]: {
      startWGBudget: number
      endWGBudget: number;
      refillBudget: number;
      workerRewards: number;
      leadRewards: number;
      actualSpending: number;
    }
  }
  let wgBudgetsOfUsd = {} as {
    [key in GroupShortIDName]: {
      startWGBudget: number
      endWGBudget: number;
      refillBudget: number;
      workerRewards: number;
      leadRewards: number;
      actualSpending: number;
    }
  }
  let wgSpending = {} as {
    [key in GroupShortIDName]: {
      prevSpendingOfJoy: number;
      prevSpendingOfUsd: number;
      currentSpendingOfJoy: number;
      currentSpendingOfUsd: number;
    }
  }
  const currentWGRefillProposal = await getWGRefillProposal(startBlockTimestamp, endBlockTimestamp);
  const currentWGBudget = await getWorkingGroupBudget(api, startBlockHash, endBlockHash);
  const currentWGSalary = await getWorkingGroupSalary(api, endBlockHash, startBlockTimestamp, endBlockTimestamp, startBlockNumber, endBlockNumber);
  const prevTermStartBlock = electedCouncils[currentTerm - 2].electedAtBlock;
  let prevTermEndBlock = electedCouncils[currentTerm - 2].endedAtBlock;
  if (!prevTermEndBlock)
    prevTermEndBlock = prevTermStartBlock;
  const prevTermStartBlockHash = await getBlockHash(api, prevTermStartBlock);
  const prevTermEndBlockHash = await getBlockHash(api, prevTermEndBlock);
  const prevWGSalary = await getWorkingGroupSalary(api, prevTermEndBlockHash, new Date(electedCouncils[currentTerm - 1].electedAtTime), new Date(electedCouncils[currentTerm - 1].endedAtTime), prevTermStartBlock, prevTermEndBlock);
  const prevStartElectedIssuance = toJoy(await getTotalSupply(api, prevTermStartBlockHash));
  const prevEndElectedIssuance = toJoy(await getTotalSupply(api, prevTermEndBlockHash));
  const prevTermissuanceChange = prevEndElectedIssuance - prevStartElectedIssuance;

  Object.keys(GroupIdToGroupParam)
    .map(async (_group) => {
      let wgDataOfJoy = {
        startWGBudget: currentWGBudget[_group as GroupIdName].startBudget,
        endWGBudget: currentWGBudget[_group as GroupIdName].endBudget,
        refillBudget: 0,
        actualSpending: currentWGSalary[_group as GroupIdName].workerSalary + currentWGSalary[_group as GroupIdName].leadSalary,
        workerRewards: currentWGSalary[_group as GroupIdName].workerSalary,
        leadRewards: currentWGSalary[_group as GroupIdName].leadSalary,
      }
      if (currentWGRefillProposal[_group as GroupIdName]) {
        wgDataOfJoy.refillBudget = currentWGRefillProposal[_group as GroupIdName];
      }
      let wgDataOfUsd = {
        startWGBudget: wgDataOfJoy.startWGBudget * Number(EMA30.curEMA),
        endWGBudget: wgDataOfJoy.endWGBudget * Number(EMA30.curEMA),
        actualSpending: wgDataOfJoy.actualSpending * Number(EMA30.curEMA),
        refillBudget: wgDataOfJoy.refillBudget * Number(EMA30.curEMA),
        workerRewards: wgDataOfJoy.workerRewards * Number(EMA30.curEMA),
        leadRewards: wgDataOfJoy.leadRewards * Number(EMA30.curEMA),
      }
      const prevSpendingOfJoy = prevWGSalary[_group as GroupIdName].leadSalary + prevWGSalary[_group as GroupIdName].workerSalary;
      let wgSpending_tmp = {
        prevSpendingOfJoy: prevSpendingOfJoy,
        prevSpendingOfUsd: Math.ceil(prevSpendingOfJoy * Number(EMA30.curEMA)),
        currentSpendingOfJoy: wgDataOfJoy.actualSpending,
        currentSpendingOfUsd: Math.ceil(wgDataOfJoy.actualSpending * Number(EMA30.curEMA))
      }
      wgSpending[GroupIdToGroupParam[_group as GroupIdName] as GroupShortIDName] = wgSpending_tmp;
      wgBudgetsOfUsd[GroupIdToGroupParam[_group as GroupIdName] as GroupShortIDName] = wgDataOfUsd;
      wgBudgetsOfJoy[GroupIdToGroupParam[_group as GroupIdName] as GroupShortIDName] = wgDataOfJoy;
    });

  // Overall Budget

  const currentOverallBudget = {} as {
    [key in OverallBudgetKeys]: {
      spendingOfJoy: number;
      spendingOfUsd: number;
    }
  }

  const prevOverallBudget = {} as {
    [key in OverallBudgetKeys]: {
      spendingOfJoy: number;
      spendingOfUsd: number;
    }
  }

  const councilReward = await getCouncilReward(startBlockNumber, endBlockNumber);
  const councilRewardBudget = councilReward.reduce((a, b) => a + b.amount, 0);
  currentOverallBudget["councilReward"] = {
    spendingOfJoy: councilRewardBudget,
    spendingOfUsd: Math.ceil(councilRewardBudget * Number(EMA30.curEMA))
  }
  const fundingProposalBudget = await getFundingProposal(startBlockNumber, endBlockNumber);
  currentOverallBudget["fundingProposal"] = {
    spendingOfJoy: fundingProposalBudget,
    spendingOfUsd: Math.ceil(fundingProposalBudget * Number(EMA30.curEMA))
  }
  const creatorPayoutRewardBudget = await getCreatorPayoutReward(startBlockNumber, endBlockNumber);
  currentOverallBudget["creatorPayoutReward"] = {
    spendingOfJoy: creatorPayoutRewardBudget,
    spendingOfUsd: Math.ceil(creatorPayoutRewardBudget * Number(EMA30.curEMA))
  }
  const validatorRewardsBudget = await getValidatorReward(api, startBlockHash, endBlockHash);
  currentOverallBudget["validatorReward"] = {
    spendingOfJoy: validatorRewardsBudget,
    spendingOfUsd: Math.ceil(validatorRewardsBudget * Number(EMA30.curEMA))
  }
  const totalWgSpending = Object.keys(wgSpending)
    .reduce((a, b) => a + wgSpending[b as GroupShortIDName].currentSpendingOfJoy, 0);
  currentOverallBudget["wgSpending"] = {
    spendingOfJoy: totalWgSpending,
    spendingOfUsd: Math.ceil(totalWgSpending * Number(EMA30.curEMA))
  }
  const grandTotal = councilRewardBudget + totalWgSpending + fundingProposalBudget + creatorPayoutRewardBudget + validatorRewardsBudget
  currentOverallBudget["grandTotal"] = {
    spendingOfJoy: grandTotal,
    spendingOfUsd: Math.ceil(grandTotal * Number(EMA30.curEMA))
  }
  const fees = grandTotal - issuanceChange;
  currentOverallBudget["fees"] = {
    spendingOfJoy: fees,
    spendingOfUsd: Math.ceil(fees * Number(EMA30.curEMA))
  }

  const prevCouncilReward = await getCouncilReward(prevTermStartBlock, prevTermEndBlock);
  const prevCouncilRewardBudget = prevCouncilReward.reduce((a, b) => a + b.amount, 0);
  prevOverallBudget["councilReward"] = {
    spendingOfJoy: prevCouncilRewardBudget,
    spendingOfUsd: Math.ceil(prevCouncilRewardBudget * Number(EMA30.prevEMA))
  }
  const prevFundingProposalBudget = await getFundingProposal(prevTermStartBlock, prevTermEndBlock);
  prevOverallBudget["fundingProposal"] = {
    spendingOfJoy: prevFundingProposalBudget,
    spendingOfUsd: Math.ceil(prevFundingProposalBudget * Number(EMA30.prevEMA))
  }
  const prevCreatorPayoutRewardBudget = await getCreatorPayoutReward(prevTermStartBlock, prevTermEndBlock);
  prevOverallBudget["creatorPayoutReward"] = {
    spendingOfJoy: prevCreatorPayoutRewardBudget,
    spendingOfUsd: Math.ceil(prevCreatorPayoutRewardBudget * Number(EMA30.prevEMA))
  }
  const prevValidatorRewardsBudget = await getValidatorReward(api, prevTermStartBlockHash, prevTermEndBlockHash);
  prevOverallBudget["validatorReward"] = {
    spendingOfJoy: prevValidatorRewardsBudget,
    spendingOfUsd: Math.ceil(prevValidatorRewardsBudget * Number(EMA30.prevEMA))
  }
  const prevTotalWgSpending = Object.keys(wgSpending)
    .reduce((a, b) => a + wgSpending[b as GroupShortIDName].prevSpendingOfJoy, 0);
  prevOverallBudget["wgSpending"] = {
    spendingOfJoy: prevTotalWgSpending,
    spendingOfUsd: Math.ceil(prevTotalWgSpending * Number(EMA30.prevEMA))
  }
  const prevGrandTotal = prevCouncilRewardBudget + prevTotalWgSpending + prevFundingProposalBudget + prevCreatorPayoutRewardBudget + prevValidatorRewardsBudget
  prevOverallBudget["grandTotal"] = {
    spendingOfJoy: prevGrandTotal,
    spendingOfUsd: Math.ceil(prevGrandTotal * Number(EMA30.prevEMA))
  }
  const prevFees = prevGrandTotal - prevTermissuanceChange;
  prevOverallBudget["fees"] = {
    spendingOfJoy: prevFees,
    spendingOfUsd: Math.ceil(prevFees * Number(EMA30.prevEMA))
  }


  return {
    general,
    composition,
    EMA30,
    projectInflations,
    inflation,
    // nonEmptyChannel,
    // videos,
    mediaStorage: storageFlag ? mediaStorage : undefined,
    wgBudgetsOfJoy,
    wgBudgetsOfUsd,
    wgSpending,
    wgWorkerStatus,
    currentOverallBudget,
    prevOverallBudget,
    // forum,
    // proposal,
    // membership,
  };
}
