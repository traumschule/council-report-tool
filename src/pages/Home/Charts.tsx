import { useState } from "react";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import ReactJson from "react-json-view";

import {
  getVideoChartData,
  getVideoNftChartData,
  getChannelChartData,
  getMembershipChartData,
  getStorageChartData,
} from "@/api";
import { useRpc } from "@/hooks";
import { DailyData } from "@/hooks/types";

function JoyChart({ data, title }: { data: DailyData[]; title: string }) {
  if (data.length === 0) return <></>;
  return (
    <div className="p-2">
      <h3>{title}</h3>
      <BarChart width={730} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(val: Date) => {
            const date = val.toLocaleDateString("en-US");
            return date.slice(0, date.length - 5);
          }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name={title} />
      </BarChart>
      <ReactJson src={{ title, data }} theme="monokai" collapsed />
    </div>
  );
}

export default function Charts({ start, end, storageStatus }: { start: number; end: number; storageStatus: boolean }) {
  const [videoData, setVideoData] = useState<DailyData[]>([]);
  const [videoNftData, setVideoNftData] = useState<DailyData[]>([]);
  const [channelData, setChannelData] = useState<DailyData[]>([]);
  const [membershipData, setMembershipData] = useState<DailyData[]>([]);
  const [storageData, setStorageData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(false);
  const { api } = useRpc();

  // const generate = useCallback(() => {
  //   if (!startTimestamp || !endTimestamp) return;
  //   getVideoChartData(startTimestamp, endTimestamp).then(setVideoData);

  //   getVideoNftChartData(startTimestamp, endTimestamp).then(setVideoNftData);

  //   // getChannelChartData(end, startTimestamp).then(setChannelData);

  // getMembershipChartData(startTimestamp, endTimestamp).then(
  //   setMembershipData
  // );
  //   // getStorageChartData(startTimestamp, endTimestamp).then(setStorageData);
  // }, [startTimestamp, endTimestamp]);

  const generate = async () => {
    if (!start || !end) return;
    if (!api) return;
    setLoading(true);
    const startHash = await api.rpc.chain.getBlockHash(start);
    const startTimestamp = new Date(
      (await (await api.at(startHash)).query.timestamp.now()).toNumber()
    );
    const endHash = await api.rpc.chain.getBlockHash(
      end === 0 ? undefined : end
    );
    const endTimestamp = new Date(
      (await (await api.at(endHash)).query.timestamp.now()).toNumber()
    );

    const videoChartData = await getVideoChartData(start, end);
    setVideoData([...videoChartData]);
    getVideoNftChartData(startTimestamp, endTimestamp).then(setVideoNftData);
    // const channelChartData = await getChannelChartData(end, startTimestamp);
    // setChannelData([...channelChartData]);
    const memberShipChartData = await getMembershipChartData(startTimestamp, endTimestamp);
    setMembershipData([...memberShipChartData])
    if (storageStatus) {
      const storageChartData = await getStorageChartData(startTimestamp, endTimestamp);
      setStorageData([...storageChartData])
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        className="btn mr-0 my-5 mx-4"
        onClick={generate}
        disabled={!api || loading}
      >
        {loading ? "Generating..." : "Generate Chart"}
      </button>
      <JoyChart data={videoData} title="Videos" />
      <JoyChart data={videoNftData} title="Video NFTs" />
      <JoyChart data={channelData} title="Non-empty channels" />
      <JoyChart data={membershipData} title="Membership" />
      {storageStatus ? (<JoyChart data={storageData} title="Storage(MBytes)" />
      ) : null
      }
    </div>
  );
}
