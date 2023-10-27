import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { useRpc } from "@/hooks";
import { generateReport4 } from "@/helpers";
import { useElectedCouncils } from "@/hooks";
import moment from "moment";

export default function Council() {
  const { api } = useRpc();
  const { data } = useElectedCouncils({});
  const [report4, setReport4] = useState({});
  const [loading, setLoading] = useState(false);
  const [storageFlag, setStorageFlag] = useState(false);

  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);


  const getCurrentBlockNumber = async () => {
    if (!api) return;
    const blockHeader = await api.rpc.chain.getHeader();
    const currentBlockNumber = blockHeader.number.toNumber();
    setEndBlock(currentBlockNumber);
  }

  const generate = async () => {
    if (!api) return;
    if (startBlock * endBlock == 0)
      return;
    setLoading(true);
    const [report4] = await Promise.all([
      generateReport4(api, startBlock, endBlock, storageFlag),
    ]);
    setReport4(report4);
    setLoading(false);
  }

  const storageFlagHandler = () => {
    setStorageFlag(!storageFlag);
  }

  const onCouncilChangeHandler = (e: any) => {
    if (!data) return;
    const index = e.target.value;
    if (index > 0) {
      const electedAt = data[index - 1].electedAt;
      const endAt = data[index - 1].endedAt;
      setStartBlock(electedAt.number);
      if (endAt)
        setEndBlock(endAt.number);
      else
        getCurrentBlockNumber();
    }
  }

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
        <h3>Council Report Data</h3>
        <div className="rounded-sm p-2 border-2 border-[#fff]">
          {
            data ? (
              <select onChange={onCouncilChangeHandler} style={{ width: '100%', borderColor: 'grey', borderWidth: '2px', borderStyle: 'solid', borderRadius: '6px', padding: '8px' }}>
                <option value={0}>Select ...</option>
                {data.map((e, key) =>
                  <option value={key + 1} key={key}>
                    {
                      moment(e.electedAt.timestamp).format('DD MMMM YYYY')
                    }
                    ~
                    {
                      e.endedAt ? (
                        <span>
                          {
                            moment(e.endedAt.timestamp).format('DD MMMM YYYY')
                          }
                        </span>
                      ) : <span>( Progress ) </span>
                    }
                  </option>
                )}
              </select>
            ) : (
              <div>Loading...</div>
            )
          }
          <label>Start block:</label>
          <input
            type="number"
            value={startBlock}
            onChange={(e) => setStartBlock(parseInt(e.target.value, 10))}
          />
          <label>End block:</label>
          <input
            type="number"
            value={endBlock}
            onChange={(e) => setEndBlock(parseInt(e.target.value, 10))}
          />'
          <input type="checkbox" checked={storageFlag} onChange={storageFlagHandler} />
          <label>Storage Status</label>
          <button
            className="btn mr-0 my-5 mx-4"
            onClick={generate}
            disabled={!api || loading}
          >
            {loading ? "Generating..." : "Generate report"}
          </button>
        </div>

        <ReactJson src={report4} theme="monokai" collapsed />
      </div>
    </div >
  );
}
