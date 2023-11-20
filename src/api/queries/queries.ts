import { GraphQLClient } from "graphql-request";
import { BN, BN_ZERO } from "@polkadot/util";
import moment from "moment";
import { QN_URL } from "@/config";
import {
  asElectedCouncil,
  asProposal,
  asWorkingGroup,
  Block,
  ElectedCouncil,
  Proposal,
  WorkingGroup,
} from "@/types";

import { getSdk } from "./__generated__/gql";
import { toJoy, decimalAdjust, string2Joy } from "@/helpers";
import { GroupIdToGroupParam, GroupIdName } from "@/types";
import { DailyData, ChannelData } from "@/hooks/types";
export { getSdk } from "./__generated__/gql";

export const client = new GraphQLClient(QN_URL);

// StorageDataObjects

export const getStorageChartData = async (start: Date, end: Date) => {
  const { GetStorageDataObjectsCount, GetStorageDataObjects } = getSdk(client);
  const defaultLimit = 5000;
  let curDate = moment(start).format('YYYY-MM-DD');
  let data: Array<DailyData> = [];
  let storageSize = 0;
  const { storageDataObjectsConnection: { totalCount } } = await GetStorageDataObjectsCount({
    where: {
      createdAt_lte: end,
      createdAt_gt: start
    }
  });
  const loop = Math.ceil(totalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { storageDataObjects } = await GetStorageDataObjects({
      where: {
        createdAt_lte: end,
        createdAt_gt: start
      },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    storageDataObjects.map((a) => {
      if (moment(a.createdAt).format('YYYY-MM-DD') == curDate) {
        storageSize += parseInt(a.size) / 1024 / 1024 / 1024;
      } else {
        data.push({
          date: new Date(curDate),
          count: storageSize
        });
        storageSize = parseInt(a.size) / 1024 / 1024 / 1024;
        curDate = moment(a.createdAt).format('YYYY-MM-DD');
      }
    })
  }
  data.push({
    date: new Date(curDate),
    count: storageSize
  });
  return data;
};

export const getStorageStatusByBlock = async (end: Date, start?: Date) => {
  const { GetStorageDataObjects, GetStorageDataObjectsCount } = getSdk(client);
  const defalultOffset = 5000;
  const { storageDataObjectsConnection } = await GetStorageDataObjectsCount({
    where: {
      createdAt_lte: end
    }
  })
  const { totalCount } = storageDataObjectsConnection;
  let loop = Math.ceil(totalCount / defalultOffset);
  let startStorage = 1;
  let endStorage = 1;
  for (let i = 0; i < loop; i++) {
    const { storageDataObjects } = await GetStorageDataObjects({
      where: {
        createdAt_lte: end
      },
      limit: defalultOffset,
      offset: defalultOffset * i
    });
    storageDataObjects.map((storage) => {
      if (start) {
        let storageCreateAt = new Date(storage.createdAt);

        if (storageCreateAt <= start) {
          startStorage += parseInt(storage.size) / 1024 / 1024 / 1024;
        }
      }
      endStorage += parseInt(storage.size) / 1024 / 1024 / 1024;
    })
  }
  return {
    startStorage: decimalAdjust(startStorage),
    endStorage: decimalAdjust(endStorage)
  }
}

// NonEmptyChannel

export const getChannelStatus = async (endBlockNumber: number, startDate?: Date) => {
  const { GetVideoCount, GetNonEmptyChannel } = getSdk(client);
  const defaultLimit = 5000;
  let startCount: string[] = [];
  let endCount: string[] = [];
  const { videosConnection: { totalCount: videoCount } } = await GetVideoCount({
    where: {
      createdInBlock_lte: endBlockNumber
    }
  })
  const loop = Math.ceil(videoCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { videos } = await GetNonEmptyChannel({
      where: {
        createdInBlock_lte: endBlockNumber
      },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    videos.map((video) => {
      let flag = endCount.filter((a) => {
        return a == video.channelId;
      })
      if (flag.length == 0) {
        if (startDate) {
          let channelCreatedAt = new Date(video.channel.createdAt);
          if (channelCreatedAt <= startDate) {
            startCount.push(video.channelId);
          }
        }
        endCount.push(video.channelId);
      }
    })
  }

  return {
    startCount: startCount.length,
    endCount: endCount.length
  };
};

export const getChannelChartData = async (endBlock: number, startDate: Date) => {
  const { GetVideoCount, GetNonEmptyChannel } = getSdk(client);
  const defaultLimit = 1000;
  let channelCount: number = 0;
  const totalChannels: Array<ChannelData> = [];
  const channelChart: Array<DailyData> = [];
  let curDate = moment(startDate).format('YYYY-MM-DD');
  const { videosConnection: { totalCount } } = await GetVideoCount({
    where: {
      createdInBlock_lte: endBlock
    }
  });
  const loop = Math.ceil(totalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { videos } = await GetNonEmptyChannel({
      where: {
        createdInBlock_lte: endBlock
      },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    videos.map((video) => {
      let flag = totalChannels.find((channel) => {
        return channel.id == video.channelId;
      });
      if (!flag) {
        totalChannels.push(video.channel);
      };
    })
  };
  totalChannels.sort((a1, a2) => {
    if (a1.createdAt <= a2.createdAt) {
      return -1;
    } else {
      return 1;
    }
  })
    .filter((a) => {
      return new Date(a.createdAt) > startDate;
    })
    .map((a) => {
      if (moment(a.createdAt).format('YYYY-MM-DD') == curDate) {
        channelCount += 1;
      } else {
        channelChart.push({
          count: channelCount,
          date: new Date(curDate)
        });
        channelCount = 1;
        curDate = moment(a.createdAt).format('YYYY-MM-DD');
      };
    });
  channelChart.push({
    count: channelCount,
    date: new Date(curDate)
  });
  return channelChart;
};

// VideoNFT

export const getVideoNftStatus = async (start: Date, end: Date) => {
  const { GetNftIssuedCount, GetNftSales, GetNftSaleCount, GetAuctions, GetAuctionsTotalCount } =
    getSdk(client);
  const defaultLimit = 100;
  let loop = 0;
  let totalVolume = BN_ZERO;
  let auctionVolume = BN_ZERO;
  const {
    nftIssuedEventsConnection: { totalCount: startCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: start },
  });
  const {
    nftIssuedEventsConnection: { totalCount: endCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: end },
  });
  const growthQty = endCount - startCount;
  const growthPct = (growthQty / startCount) * 100;

  const {
    nftBoughtEventsConnection: { totalCount: boughtEventTotalCount },
  } = await GetNftSaleCount({
    where: { createdAt_gte: start, createdAt_lte: end },
  });
  const { auctionsConnection: { totalCount: auctionTotalCount } } = await GetAuctionsTotalCount({
    where: { createdAt_gte: start, createdAt_lte: end, isCompleted_eq: true }
  });
  loop = Math.ceil(boughtEventTotalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { nftBoughtEvents } = await GetNftSales({
      where: { createdAt_gte: start, createdAt_lte: end },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    totalVolume = nftBoughtEvents.reduce(
      (total, { price }) => total.add(new BN(price)),
      BN_ZERO
    );
  }
  loop = Math.ceil(auctionTotalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { auctions } = await GetAuctions({
      where: { createdAt_gte: start, createdAt_lte: end, isCompleted_eq: true },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    auctionVolume = auctions.reduce(
      (total, { topBid }) => total.add(new BN(topBid ? topBid.amount : 0)),
      BN_ZERO
    );
  }
  totalVolume = totalVolume.add(auctionVolume);
  return {
    startBlock: startCount,
    endBlock: endCount,
    growthQty,
    growthPct,
    soldVolume: toJoy(totalVolume),
    soldQty: boughtEventTotalCount,
  };
};

export const getVideoNftChartData = async (start: Date, end: Date) => {
  const { GetNftIssuedCount } = getSdk(client);

  const startDate = new Date(
    `${start.toISOString().slice(0, 11)}00:00:00.000Z`
  );
  const endDate = new Date(`${end.toISOString().slice(0, 11)}00:00:00.000Z`);
  const data = [];

  const {
    nftIssuedEventsConnection: { totalCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000) },
  });
  let prevCount = totalCount;
  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.getTime() + 24 * 3600 * 1000)
  ) {
    const {
      nftIssuedEventsConnection: { totalCount },
    } = await GetNftIssuedCount({
      where: { createdAt_lte: date.toISOString() },
    });
    data.push({
      date: date,
      count: totalCount - prevCount,
    });
    prevCount = totalCount;
  }
  return data;
};

// Videos

export const getVideoStatus = async (start: number, end: number) => {
  const { GetVideoCount } = getSdk(client);
  const {
    videosConnection: { totalCount: startCount },
  } = await GetVideoCount({
    where: { createdInBlock_lte: start },
  });
  const {
    videosConnection: { totalCount: endCount },
  } = await GetVideoCount({
    where: { createdInBlock_lte: end },
  });
  const growthQty = endCount - startCount;
  const growthPct = (growthQty / startCount) * 100;
  return {
    startBlock: startCount,
    endBlock: endCount,
    growthQty,
    growthPct,
  };
};

export const getVideoChartData = async (start: number, end: number) => {
  const { GetNonEmptyChannel, GetVideoCount } = getSdk(client);
  const defaultLimit = 1000;
  let curDate = "";
  let count = 0;
  const videoChart: Array<DailyData> = [];
  const { videosConnection: { totalCount } } = await GetVideoCount({
    where: {
      createdInBlock_gt: start,
      createdInBlock_lte: end
    }
  });
  let loop = Math.ceil(totalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { videos } = await GetNonEmptyChannel({
      where: {
        createdInBlock_gt: start,
        createdInBlock_lte: end
      },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    if (curDate == "") {
      curDate = moment(videos[0].createdAt).format('YYYY-MM-DD');
    }
    videos.map((video) => {
      if (moment(video.createdAt).format('YYYY-MM-DD') == curDate)
        count++;
      else {
        videoChart.push({
          date: new Date(curDate),
          count
        });
        count = 1;
        curDate = moment(video.createdAt).format('YYYY-MM-DD');
      }
    });
  }
  videoChart.push({
    date: new Date(curDate),
    count
  });
  return videoChart
};

// Forum

export const getForumCategoryStatus = async (start: Date, end: Date) => {
  const { GetForumCategoriesCount } = getSdk(client);

  const {
    forumCategoriesConnection: { totalCount: startCount },
  } = await GetForumCategoriesCount({
    where: { createdAt_lte: start },
  });
  const {
    forumCategoriesConnection: { totalCount: endCount },
  } = await GetForumCategoriesCount({
    where: { createdAt_lte: end },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getForumThreadStatus = async (start: Date, end: Date) => {
  const { GetForumThreadsCount } = getSdk(client);

  const {
    forumThreadsConnection: { totalCount: startCount },
  } = await GetForumThreadsCount({
    where: { createdAt_lte: start },
  });
  const {
    forumThreadsConnection: { totalCount: endCount },
  } = await GetForumThreadsCount({
    where: { createdAt_lte: end },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getForumPostStatus = async (start: Date, end: Date) => {
  const { GetForumPostsCount } = getSdk(client);

  const {
    forumPostsConnection: { totalCount: startCount },
  } = await GetForumPostsCount({
    where: { createdAt_lte: start },
  });
  const {
    forumPostsConnection: { totalCount: endCount },
  } = await GetForumPostsCount({
    where: { createdAt_lte: end },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getForumStatus = async (start: Date, end: Date) => {
  const [category, thread, post] = await Promise.all([
    getForumCategoryStatus(start, end),
    getForumThreadStatus(start, end),
    getForumPostStatus(start, end),
  ]);

  return { category, thread, post };
};

// membership

export const getMembershipCount = async (date: Date) => {
  const { GetMembersCount } = getSdk(client);

  const {
    membershipsConnection: { totalCount },
  } = await GetMembersCount({
    where: { createdAt_lte: date },
  });
  return totalCount;
};

export const getMembershipStatus = async (start: Date, end: Date) => {
  const { GetMembersCount } = getSdk(client);
  const {
    membershipsConnection: { totalCount: startCount },
  } = await GetMembersCount({
    where: { createdAt_lte: start },
  });
  const {
    membershipsConnection: { totalCount: endCount },
  } = await GetMembersCount({
    where: { createdAt_lte: end },
  });
  const growthQty = endCount - startCount;
  const growthPct = (growthQty / startCount) * 100;
  return {
    startBlock: startCount,
    endBlock: endCount,
    growthQty,
    growthPct,
  };
};

export const getMembershipChartData = async (start: Date, end: Date) => {
  const { GetMembersCount, GetMembers } = getSdk(client);
  const defaultLimit = 1000;
  let curDate = "";
  let count = 0;
  const chartData: Array<DailyData> = [];
  const { membershipsConnection: { totalCount } } = await GetMembersCount({
    where: {
      createdAt_gt: start,
      createdAt_lte: end
    }
  });
  let loop = Math.ceil(totalCount / defaultLimit);
  for (let i = 0; i < loop; i++) {
    const { memberships } = await GetMembers({
      where: {
        createdAt_gt: start,
        createdAt_lte: end
      },
      limit: defaultLimit,
      offset: defaultLimit * i
    });
    if (curDate == "")
      curDate = moment(memberships[0].createdAt).format('YYYY-MM-DD');
    memberships.map((member) => {
      if (moment(member.createdAt).format('YYYY-MM-DD') == curDate)
        count++;
      else {
        chartData.push({
          date: new Date(curDate),
          count
        });
        count = 1;
        curDate = moment(member.createdAt).format('YYYY-MM-DD');
      }
    });
  }
  chartData.push({
    date: new Date(curDate),
    count
  });
  return chartData;
};

export const getMemeberShipHandle = async (id: string) => {
  const { GetMembers } = getSdk(client);
  const { memberships } = await GetMembers({
    where: {
      id_eq: id
    }
  });

  return memberships[0].handle;
}

// proposal

export const getProposals = async (
  start: Date,
  end: Date
): Promise<Proposal[]> => {
  const { getProposals } = getSdk(client);
  const { proposals } = await getProposals({
    where: {
      createdAt_gt: start,
      createdAt_lt: end,
    },
  });

  return proposals.map(asProposal);
};

// workers

export const getFilledWorkers = async () => {
  const { getOpeningFilled, getOpeningFilledTotalCount } = getSdk(client);
  const { openingFilledEventsConnection: { totalCount } } = await getOpeningFilledTotalCount();
  const { openingFilledEvents } = await getOpeningFilled({ limit: totalCount })
  return openingFilledEvents
}

export const getTerminateWorkers = async () => {
  const { getTerminatedWorker, getTerminatedWorkerTotalCount } = getSdk(client);
  const { terminatedWorkerEventsConnection: { totalCount } } = await getTerminatedWorkerTotalCount();
  const { terminatedWorkerEvents } = await getTerminatedWorker({ limit: totalCount });
  return terminatedWorkerEvents;
}

export const getExitedWorkers = async () => {
  const { getWorkerExited, getWorkerExitedTotalCount } = getSdk(client);
  const { workerExitedEventsConnection: { totalCount } } = await getWorkerExitedTotalCount();
  const { workerExitedEvents } = await getWorkerExited({ limit: totalCount });
  return workerExitedEvents;
}

export const getWorkerByMemberId = async (memberId: string) => {
  const { GetWorkers } = getSdk(client);
  const { workers } = await GetWorkers({
    where: {
      membership: {
        id_eq: memberId
      }
    }
  });
  return workers;
}

// council Reward

export const getCouncilReward = async (start: number, end: number) => {
  const { GetCouncilReward, GetCouncilRewardTotalCount } = getSdk(client);
  const { rewardPaymentEventsConnection: { totalCount } } = await GetCouncilRewardTotalCount({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    }
  });
  const { rewardPaymentEvents } = await GetCouncilReward({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    },
    limit: totalCount
  });
  const councilReward = rewardPaymentEvents.map((r) => {
    return {
      memberId: r.councilMember.memberId,
      amount: toJoy(new BN(r.paidBalance))
    }
  });
  return councilReward;
}

// council refill 

export const getCouncilRefill = async (start: number, end: number) => {
  const { GetCouncilReFill, GetCouncilReFillTotalCount } = getSdk(client);
  const { budgetRefillEventsConnection: { totalCount } } = await GetCouncilReFillTotalCount({
    where: {
      inBlock_gt: start,
      inBlock_lte: end
    }
  });
  const { budgetRefillEvents } = await GetCouncilReFill({
    where: {
      inBlock_gt: start,
      inBlock_lte: end
    },
    limit: totalCount
  });
  const _refillBudget = budgetRefillEvents
    .map((e) => new BN(e.balance))
    .reduce((a, b) => a.add(b), BN_ZERO);
  return toJoy(_refillBudget);
}

// creator payout reward
export const getCreatorPayoutReward = async (start: number, end: number) => {

  const { GetCreatorPayoutReward, GetCreatorPayoutRewardTotalCount } = getSdk(client);
  const { channelRewardClaimedEventsConnection: { totalCount } } = await GetCreatorPayoutRewardTotalCount({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    }
  });
  const { channelRewardClaimedEvents } = await GetCreatorPayoutReward({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    },
    limit: totalCount
  });
  const amount = channelRewardClaimedEvents
    .map((c) => new BN(c.amount))
    .reduce((a, b) => a + toJoy(b), 0)
  return amount;
}

// funding proposals
export const getFundingProposal = async (start: number, end: number) => {
  const { getFundingProposalTotalCount, getFundingProposals } = getSdk(client);
  const { requestFundedEventsConnection: { totalCount } } = await getFundingProposalTotalCount({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    }
  });
  const { requestFundedEvents } = await getFundingProposals({
    where: {
      inBlock_gte: start,
      inBlock_lte: end,
    },
    limit: totalCount
  });
  const paid = requestFundedEvents
    .map((e) => new BN(e.amount))
    .reduce((a, b) => a.add(b), BN_ZERO);

  return toJoy(paid);
};

// wg spending budget
export const getWGSpendingBudget = async (start: number, end: number,) => {
  const { GetBudgetSpending, GetBudgetSpendingEventsTotalCount } = getSdk(client);
  const spendingBudget = {} as {
    [key in GroupIdName]: number
  };
  const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
    const { budgetSpendingEventsConnection: { totalCount } } = await GetBudgetSpendingEventsTotalCount({
      where: {
        inBlock_gte: start,
        inBlock_lte: end,
        group: { id_eq: _group }
      }
    });
    const { budgetSpendingEvents } = await GetBudgetSpending({
      where: {
        inBlock_gte: start,
        inBlock_lte: end,
        group: { id_eq: _group }
      },
      limit: totalCount
    });
    spendingBudget[_group as GroupIdName] = budgetSpendingEvents
      .map((b) => new BN(b.amount))
      .reduce((a, b) => a + toJoy(b), 0);
  });
  await Promise.all(promises);
  return spendingBudget
}

// wg refill proposal budget

export const getWGRefillProposal = async (start: Date, end: Date) => {
  const { getProposals, getProposalTotalCount } = getSdk(client);
  const { proposalsConnection: { totalCount } } = await getProposalTotalCount({
    where: {
      isFinalized_eq: true,
      details_json: { isTypeOf_eq: "UpdateWorkingGroupBudgetProposalDetails" },
      status_json: { isTypeOf_eq: "ProposalStatusExecuted" },
      createdAt_gte: start,
      createdAt_lte: end,
    }
  });
  const refills = {} as {
    [key in WorkingGroup["id"]]: number;
  };

  const { proposals } = await getProposals({
    where: {
      isFinalized_eq: true,
      details_json: { isTypeOf_eq: "UpdateWorkingGroupBudgetProposalDetails" },
      status_json: { isTypeOf_eq: "ProposalStatusExecuted" },
      createdAt_gte: start,
      createdAt_lte: end,
    },
    limit: totalCount
  });

  for (const proposal of proposals) {
    const {
      group: { id },
      amount,
    } = proposal.details as {
      __typename: string;
      group: {
        id: WorkingGroup["id"];
        __typename: string;
      };
      amount: string;
    };
    refills[id] =
      toJoy(new BN(amount)) + (isNaN(refills[id]) ? 0 : refills[id]);
  }
  return refills;
};

// wg spending proposal budget

export const getWGSpendingProposal = async (start: number, end: number) => {
  const { getFundingProposalTotalCount, getFundingProposals, GetWorkersCount, GetWorkers } = getSdk(client);
  const { requestFundedEventsConnection: { totalCount } } = await getFundingProposalTotalCount({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    }
  });
  const spendingProposal = {} as {
    [key in GroupIdName]: 0;
  };
  const { requestFundedEvents } = await getFundingProposals({
    where: {
      inBlock_gte: start,
      inBlock_lte: end
    },
    limit: totalCount
  });
  const promises = Object.keys(GroupIdToGroupParam).map(async (_groupId) => {
    const { workersConnection: { totalCount: workerCount } } = await GetWorkersCount({
      where: {
        groupId_eq: _groupId,
        isActive_eq: true
      }
    });
    const { workers } = await GetWorkers({
      where: {
        groupId_eq: _groupId,
        isActive_eq: true
      },
      limit: workerCount
    });
    workers.map((w) => {
      const budget = requestFundedEvents
        .filter((a) => {
          return a.account == w.rewardAccount;
        })
        .reduce((a, b) => a + toJoy(new BN(b.amount)), 0);
      if (budget)
        spendingProposal[_groupId as GroupIdName] += budget;
    });
  });
  await Promise.all(promises);
  return spendingProposal;
}

// wg status 

export const getWorkingGroupStatus = async (start: Date, end: Date) => {
  const {
    GetWorkingGroupApplicationsTotalCount,
    GetWorkingGroupOpeningsTotalCount,
    GetOpeningFilledEventsConnection,
    GetTerminatedWorkerEventsConnection,
    GetWorkerExitedEventsConnection,
  } = getSdk(client);
  const { workingGroupOpeningsConnection: { totalCount: startOpeningCount } } = await GetWorkingGroupOpeningsTotalCount({
    where: {
      createdAt_lte: start,
      status_json: { isTypeOf_eq: "OpeningStatusOpen" },
    },
  });
  const { workingGroupOpeningsConnection: { totalCount: endOpeningCount } } = await GetWorkingGroupOpeningsTotalCount({
    where: {
      createdAt_lte: end,
      status_json: { isTypeOf_eq: "OpeningStatusOpen" },
    },
  });
  const {
    workingGroupApplicationsConnection: {
      totalCount: startApplicationCount
    }
  } = await GetWorkingGroupApplicationsTotalCount({
    where: {
      createdAt_lte: start
    }
  });
  const {
    workingGroupApplicationsConnection: {
      totalCount: endApplicationCount
    }
  } = await GetWorkingGroupApplicationsTotalCount({
    where: {
      createdAt_lte: start
    }
  });

  const {
    openingFilledEventsConnection: { totalCount: filledCount },
  } = await GetOpeningFilledEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const {
    terminatedWorkerEventsConnection: { totalCount: terminatedCount },
  } = await GetTerminatedWorkerEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const {
    workerExitedEventsConnection: { totalCount: leftCount },
  } = await GetWorkerExitedEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  return {
    openings: endOpeningCount,
    openingsChange: (endOpeningCount - startOpeningCount),
    applications: endApplicationCount,
    applicationsChange: (endApplicationCount - startApplicationCount),
    filledCount,
    terminatedCount,
    leftCount,
  };
};

// wg spending with receiver ID

export const getWGSpendingWithReceiverID = async (start: number, end: number, accountID: Array<string>, groupID: string) => {
  const { GetBudgetSpending, GetBudgetSpendingEventsTotalCount } = getSdk(client);
  const { budgetSpendingEventsConnection: { totalCount } } = await GetBudgetSpendingEventsTotalCount({
    where: {
      inBlock_gte: start,
      inBlock_lte: end,
      reciever_in: accountID
    }
  });
  const { budgetSpendingEvents } = await GetBudgetSpending({
    where: {
      inBlock_gte: start,
      inBlock_lte: end,
      reciever_in: accountID,
      group: {
        id_eq: groupID
      }
    },
    limit: totalCount
  });
  const spendingBudget = budgetSpendingEvents
    .reduce((a, b) => a + string2Joy(b.amount), 0);
  return spendingBudget
}

export const getCurrentWorkingGroups = async (): Promise<WorkingGroup[]> => {
  const { GetWorkingGroups } = getSdk(client);
  const { workingGroups } = await GetWorkingGroups();
  return workingGroups.map(asWorkingGroup);
};

export const getWorkingGroupSpending = async (
  start: Block & { hash: string },
  end: Block & { hash: string }
) => {
  const workingGroups = await getCurrentWorkingGroups();
  const { GetBudgetSpending, getFundingProposals } = getSdk(client);

  // calculate working group budgets
  const spending = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for await (const workingGroup of workingGroups) {
    const { budgetSpendingEvents } = await GetBudgetSpending({
      where: {
        group: { id_eq: workingGroup.id },
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const wgSpending = budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );

    spending[workingGroup.id] = toJoy(wgSpending);
  }

  const leadSalary = {} as {
    [key in WorkingGroup["id"]]: number | undefined;
  };
  for (const workingGroup of workingGroups) {
    const { leader } = workingGroup;
    if (!leader) {
      continue;
    }
    let salary = BN_ZERO;
    const rewards = leader.rewardPerBlock.mul(
      new BN(end.number - start.number)
    );
    salary = salary.add(rewards);

    const proposalPaidPromise = getFundingProposals({
      where: {
        account_in: leader.membership.boundAccounts,
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const directPaysPromise = GetBudgetSpending({
      where: {
        reciever_in: leader.membership.boundAccounts,
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const [proposalPaid, directPays] = await Promise.all([
      proposalPaidPromise,
      directPaysPromise,
    ]);

    const paid = proposalPaid.requestFundedEvents
      .map((e) => new BN(e.amount))
      .reduce((a, b) => a.add(b), BN_ZERO);
    salary = salary.add(paid);

    const discretionarySpending = directPays.budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );
    salary = salary.add(discretionarySpending);
    leadSalary[workingGroup.id] = toJoy(salary);
  }

  const workersSalary = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for await (const workingGroup of workingGroups) {
    const salariesPromise = workingGroup.workers.map(async (worker) => {
      let salary = BN_ZERO;
      salary = salary.add(
        worker.rewardPerBlock.mul(new BN(end.number - start.number))
      );

      const proposalPaidPromise = getFundingProposals({
        where: {
          account_in: worker.membership.boundAccounts,
          createdAt_gte: start.timestamp,
          createdAt_lte: end.timestamp,
        },
      });
      const directPaysPromise = GetBudgetSpending({
        where: {
          reciever_in: worker.membership.boundAccounts,
          createdAt_gte: start.timestamp,
          createdAt_lte: end.timestamp,
        },
      });
      const [proposalPaid, directPays] = await Promise.all([
        proposalPaidPromise,
        directPaysPromise,
      ]);

      const paid = proposalPaid.requestFundedEvents
        .map((e) => new BN(e.amount))
        .reduce((a, b) => a.add(b), BN_ZERO);
      salary = salary.add(paid);

      const discretionarySpending = directPays.budgetSpendingEvents.reduce(
        (total, { amount }) => total.add(new BN(amount)),
        BN_ZERO
      );

      salary = salary.add(discretionarySpending);
      return salary;
    });

    const salaries = await Promise.all(salariesPromise);
    const groupSalary = salaries.reduce((a, b) => a.add(b), BN_ZERO);
    workersSalary[workingGroup.id] = toJoy(groupSalary);
  }

  return { discretionarySpending: spending, leadSalary, workersSalary };
};

// council


export const getElectedCouncils = async (): Promise<ElectedCouncil[]> => {
  const { GetElectedCouncils } = getSdk(client);

  const councils = await GetElectedCouncils();

  return councils.electedCouncils.map(asElectedCouncil);
};

export const getElectedCouncilById = async (
  id: string
): Promise<ElectedCouncil> => {
  const { GetElectedCouncils } = getSdk(client);

  const council = await GetElectedCouncils({ where: { id_eq: `${id}` } });

  if (council.electedCouncils.length !== 1) {
    throw new Error(`No council found with id ${id}`);
  }

  return asElectedCouncil(council.electedCouncils[0]);
};





