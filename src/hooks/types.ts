import { ElectedCouncil } from '@/types';
import BN from 'bn.js';

export interface ForSelectedCouncil {
  council?: ElectedCouncil;
}


export type DailyData = {
  date: Date;
  count: number;
};

export type ChannelData = {
  id: string,
  createdAt: Date
}

export type VideoData = {
  id: string,
  createdAt: string
}

export type BudgetData = {
  groupId: string,
  amount: number
}

export type CouncilBudgetData = {
  memberId: string,
  amount: number
}