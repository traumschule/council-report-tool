import { ElectedCouncil } from '@/types';

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