import { useState, useEffect } from "react";
import ReactJson from "react-json-view";
import moment from "moment";

import { useRpc } from "@/hooks";
import { generateReport2 } from "@/helpers";

import Charts from "./Charts";

export default function Weekly() {
  const { api } = useRpc();
  const baseStartDate = "2023-08-11"
  const baseStartBlockNumber: number = 3531601;
  const blocksPerWeek: number = 100800;
  const [report2, setReport2] = useState({});
  const [loading, setLoading] = useState(false);
  const [storageFlag, setStorageFlag] = useState(false);
  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);
  const [activeWeek, setActiveWeek] = useState(-1);
  const [diffweeks, setDiffWeeks] = useState(0);
  const style = {
    fontWeight: 800,
  }

  const generate = async () => {
    if (!api) return;

    if (startBlock * endBlock == 0)
      return;
    setLoading(true);
    const [report2] = await Promise.all([
      generateReport2(api, storageFlag, startBlock, endBlock),
    ]);
    setReport2(report2);
    setLoading(false);
  }

  const storageFlagHandler = () => {
    setStorageFlag(!storageFlag);
  }


  const onWeekSelectHandler = async (e: any) => {
    if (!api) return;
    const index: number = e.target.value;
    if (index > 0) {
      setActiveWeek(index);
      const endDate = moment(baseStartDate).add(((+index + 1) * 7 + 1), 'day');
      const diff = moment(endDate).diff(new Date(), 'days');
      const startBlock = +baseStartBlockNumber + index * blocksPerWeek + +index;
      if (diff <= 0) {
        const endBlock = +baseStartBlockNumber + (+index + 1) * blocksPerWeek + +index;
        setStartBlock(startBlock);
        setEndBlock(endBlock);
      } else {
        const blockHeader = await api.rpc.chain.getHeader();
        const currentBlockNumber = blockHeader.number.toNumber();
        setStartBlock(startBlock);
        setEndBlock(currentBlockNumber);
      }
    }
  }

  useEffect(() => {
    const diff = moment().diff(baseStartDate, 'weeks');
    setDiffWeeks(diff);
  }, [])

  return (
    <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
      <h3>Weekly Report Data</h3>
      <div className="justify-content-center">
        <div>Weeks </div>
        <select onChange={onWeekSelectHandler} style={{ width: '100%', borderColor: 'grey', borderWidth: '2px', borderStyle: 'solid', borderRadius: '6px', padding: '8px' }}>
          <option value={0}>Select ...</option>
          {
            [...Array(diffweeks).keys()].map(
              i => moment(baseStartDate).add((diffweeks - i) * 7 + 1, 'day').diff(new Date(), 'days') < 0 ? (
                <option value={diffweeks - i} key={diffweeks - i} style={(diffweeks - i) == activeWeek ? style : {}} >
                  {moment(baseStartDate).add((diffweeks - i) * 7 + 1, 'day').format('DD MMMM YYYY')}
                  ~
                  {
                    moment(baseStartDate).add((diffweeks - i + 1) * 7 + 1, 'day').diff(new Date(), 'days') < 0 ? (
                      moment(baseStartDate).add((diffweeks - i + 1) * 7 + 1, 'day').format('DD MMMM YYYY')
                    ) : (
                      <> Progress </>
                    )
                  }
                </option>
              ) : null
            )
          }
        </select>
      </div>
      <div className="rounded-sm p-2 border-2 border-[#fff]">
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
        />
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
      <ReactJson src={report2} theme="monokai" collapsed />
      <Charts start={startBlock} end={endBlock} storageStatus={storageFlag} />
    </div>
  );
}
