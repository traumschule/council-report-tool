import { useState } from "react";
import axios from "axios";
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
import DomToImage from "dom-to-image";
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
    <div className="p-2" id="graph">
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

  const generateImg = () => {
    upldateImagewithFetch();
    // let node = document.getElementById('graph');
    // let options = { quality: 1 };
    // DomToImage.toPng(node as Node, options).then((imgUrl) => {
    //   let img = new Image();
    //   img.src = imgUrl;
    //   // document.body.appendChild(img);
    //   // var link = document.createElement('a');
    //   // link.download = 'my-image-name.jpeg';
    //   // link.href = imgUrl;
    //   // link.click();
    //   // uploadImage(imgUrl);
    // })
  }

  const upldateImagewithFetch = async () => {
    const body = {
      image: "https://i.imgur.com/F5LvVSE.png"
    }
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: "Client-ID aeb5866135440bd"
      },
      body: JSON.stringify(body)
    });
    const content = await response.json();
    console.log(content);
  }

  const uploadImage = () => {

    axios.post('https://api.imgur.com/3/image',
      { image: "https://i.imgur.com/F5LvVSE.png" },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: "Client-ID aeb5866135440bd"
        },
      },
    ).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    })
  }

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
    const channelChartData = await getChannelChartData(end, startTimestamp);
    setChannelData([...channelChartData]);
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
      <div className="d-flex">

      </div>
      <button
        className="btn mr-0 my-5 mx-4"
        onClick={generate}
        disabled={!api || loading}
      >
        {loading ? "Generating..." : "Generate Chart"}
      </button>
      <button className="btn mr-0 my-5 mx-4" onClick={generateImg}>
        Generat Image
      </button>
      <JoyChart data={videoData} title="New Videos" />
      <JoyChart data={videoNftData} title="New NFT Minted" />
      <JoyChart data={channelData} title="Non-empty channels" />
      <JoyChart data={membershipData} title="Membership" />
      {storageStatus ? (<JoyChart data={storageData} title="New Media Uploads (GB)" />
      ) : null
      }
    </div>
  );
}
