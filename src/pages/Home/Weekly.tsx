import { useState, useEffect } from "react";
import ReactJson from "react-json-view";
import Select, {
  components,
  OptionProps,
  SingleValueProps,
} from "react-select";
import moment from "moment";

import { useRpc } from "@/hooks";
import { generateReport2 } from "@/helpers";

import Charts from "./Charts";
import { start } from "repl";

export default function Weekly() {
  const { api } = useRpc();
  const baseStartDate = "2023-03-06"
  const weeksPerYear = 52;
  const baseBlockNumber = 1242742;
  const baseTimeStamp = 1678084488000;
  const [report2, setReport2] = useState({});
  const [loading, setLoading] = useState(false);
  const [storageFlag, setStorageFlag] = useState(false);
  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);
  const [week, setWeek] = useState(null);
  const [totalWeek, setTotalWeek] = useState(0);

  const generate = async () => {
    if (!api) return;
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
    const index = e.target.value;
    if (index > 0) {
      const startDate = moment().day(6).week(index).format('YYYY-MM-DD');
      const endDate = moment().day(6).week(index).add('day', 7).format('YYYY-MM-DD');
      const diff = moment(endDate).diff(new Date(), 'days');
      const startBlock = Math.ceil(moment(startDate).diff(baseTimeStamp, 'seconds') / 6);
      if (diff <= 0) {
        const endBlock = Math.ceil(moment(endDate).diff(baseTimeStamp, 'seconds') / 6);
        setStartBlock(startBlock + baseBlockNumber + 1);
        setEndBlock(endBlock + baseBlockNumber);
      } else {
        if (!api) return;
        const blockHeader = await api.rpc.chain.getHeader();
        const currentBlockNumber = blockHeader.number.toNumber();
        setStartBlock(startBlock + baseBlockNumber);
        setEndBlock(currentBlockNumber);
      }
    }
  }

  useEffect(() => {
    let weeks = 0;
    weeks += moment().week();
    setTotalWeek(weeks);
  }, [])

  return (
    <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
      <h3>Weekly Report Data</h3>
      <div className="justify-content-center">
        <div>Weeks </div>
        <select onChange={onWeekSelectHandler} style={{ width: '100%', borderColor: 'grey', borderWidth: '2px', borderStyle: 'solid', borderRadius: '6px', padding: '8px' }}>
          <option value={0}></option>
          {
            [...Array(totalWeek).keys()].map(
              i => moment().day(6).week(totalWeek - i).diff(baseStartDate, 'days') > 0 && moment().day(6).week(totalWeek - i).diff(new Date(), 'days') < 0 ?
                (<option value={totalWeek - i} key={totalWeek - i}>{moment().day(6).week(totalWeek - i).format('DD MMMM YYYY')} ~ {moment().day(6).week(totalWeek - i).add('day', 7).format('DD MMMM YYYY')}</option>) :
                null)
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
