export const QN_URL =
  import.meta.env.VITE_QN_URL || "https://query.joystream.org/graphql";
export const NODE_SOCKET =
  import.meta.env.VITE_NODE_SOCKET || "wss://rpc.joystream.org:9944";

export const MEXC_WALLET = "5CFYPwkpP4oEeCUviVafWBNwpRPF7SjUpL4q8A7KtJJhQ1gJ";
export const defaultDateTimeFormat = "YYYY-MM-DDTHH:mm:ss.000z";

export const weeklyReportTemplateWithMediaStatus = `
### ** General **

** Start Block **
- Start Block: { _general_startBlock_number }
- Start Block Hash: { _general_startBlock_hash }
- Start Block Time: { _general_startBlock_timestamp }

** End Block **
- End Block: { _general_endBlock_number }
- End Block Hash: { _general_endBlock_hash }
- End Block Time: { _general_endBlock_timestamp }

### ** Issuance **

- Issuance by start block: { _issuance_startBlock }
- Issuance by end block: { _issuance_endBlock }
- Issuance, ** Δ ** : { _issuance_changedIssuance }

### MEXC exchange wallet

- Balance(Start Block): { _mexc_startBlock }
- Balance(End Block): { _mexc_endBlock }
- Balance change: { _mexc_changedBalance }

### Supply

Data over period:

- JOY inflation: { _supply_inflationChanged }
- Tokens Changed: { _supply_changedToken }
- Tokens Minted: { _supply_mintedToken }
- Tokens Burned: { _supply_burnedToken }

### DAO spending

| Description | Total minted, JOY |
| --- | --- |
| Council rewards | { _daoSpending_councilReward } |
| WG spent | { _daoSpending_wgSpent } |
| Funding proposals | { _daoSpending_fundingProposals } |
| Creator payout rewards | { _daoSpending_creatorPayoutRewards } |
| Validator rewards | { _daoSpending_validatorRewards } |
| Grand Total | { _daoSpending_grandTotal } |

### ** Council Budget **

| Item | Tokens, JOY |
| --- | --- |
| Starting Council budget | { _councilBudget_startBudget } |
| Spending from Council budget | { _councilBudget_spendingBudget } |
| Refill of Council budget | { _councilBudget_refillBudget } |
| Ending Council budget | { _councilBudget_endBudget } |

### WG budgets

  | Working group | Start budget, JOY | Total refilled, JOY | Total spending(actual), JOY | End budget, JOY |
| --- | --- | --- | --- | --- |
| Builders | { _wgBudgets_Builders_startBudget } | { _wgBudgets_Builders_totalRefilled } | { _wgBudgets_Builders_totalSpending } | { _wgBudgets_Builders_endBudget } |
| Storage | { _wgBudgets_Storage_startBudget } | { _wgBudgets_Storage_totalRefilled } | { _wgBudgets_Storage_totalSpending } | { _wgBudgets_Storage_endBudget } |
| Distribution | { _wgBudgets_Distribution_startBudget } | { _wgBudgets_Distribution_totalRefilled } | { _wgBudgets_Distribution_totalSpending } | { _wgBudgets_Distribution_endBudget } |
| Forum | { _wgBudgets_Forum_startBudget } | { _wgBudgets_Forum_totalRefilled } | { _wgBudgets_Forum_totalSpending } | { _wgBudgets_Forum_endBudget } |
| Apps | { _wgBudgets_Apps_startBudget } | { _wgBudgets_Apps_totalRefilled } | { _wgBudgets_Apps_totalSpending } | { _wgBudgets_Apps_endBudget } |
| Content | { _wgBudgets_Content_startBudget } | { _wgBudgets_Content_totalRefilled } | { _wgBudgets_Content_totalSpending } | { _wgBudgets_Content_endBudget } |
| HR | { _wgBudgets_HR_startBudget } | { _wgBudgets_HR_totalRefilled } | { _wgBudgets_HR_totalSpending } | { _wgBudgets_HR_endBudget } |
| Membership | { _wgBudgets_Membership_startBudget } | { _wgBudgets_Membership_totalRefilled } | { _wgBudgets_Membership_totalSpending } | { _wgBudgets_Membership_endBudget } |
| Marketing | { _wgBudgets_Marketing_startBudget } | { _wgBudgets_Marketing_totalRefilled } | { _wgBudgets_Marketing_totalSpending } | { _wgBudgets_Marketing_endBudget } |

| Working group | Lead salary, JOY | Workers salary, JOY | Spending proposals, JOY |
| --- | --- | --- | --- |
| Builders | { _wgBudgets_Builders_leadSalary } | { _wgBudgets_Builders_workerSalary } | { _wgBudgets_Builders_spendingProposals } |
| Storage | { _wgBudgets_Storage_leadSalary } | { _wgBudgets_Storage_workerSalary } | { _wgBudgets_Storage_spendingProposals } |
| Distribution | { _wgBudgets_Distribution_leadSalary } | { _wgBudgets_Distribution_workerSalary } | { _wgBudgets_Distribution_spendingProposals } |
| Forum | { _wgBudgets_Forum_leadSalary } | { _wgBudgets_Forum_workerSalary } | { _wgBudgets_Forum_spendingProposals } |
| Apps | { _wgBudgets_Apps_leadSalary } | { _wgBudgets_Apps_workerSalary } | { _wgBudgets_Apps_spendingProposals } |
| Content | { _wgBudgets_Content_leadSalary } | { _wgBudgets_Content_workerSalary } | { _wgBudgets_Content_spendingProposals } |
| HR | { _wgBudgets_HR_leadSalary } | { _wgBudgets_HR_workerSalary } | { _wgBudgets_HR_spendingProposals } |
| Membership | { _wgBudgets_Membership_leadSalary } | { _wgBudgets_Membership_workerSalary } | { _wgBudgets_Membership_spendingProposals } |
| Marketing | { _wgBudgets_Marketing_leadSalary } | { _wgBudgets_Marketing_workerSalary } | { _wgBudgets_Marketing_spendingProposals } |

### Videos

- Total Videos(start block), qty: { _videos_startBlock }
- Total Videos(end block), qty: { _videos_endBlock }
- Videos Growth, qty: { _videos_growthQty }
- Videos Growth, %: { _videos_growthPct }

### Media Storage

- Total Storage Used(start block): { _mediaStorage_startBlock }
- Total Storage Used(end block): { _mediaStorage_endBlock }
- Storage Used Growth, qty: { _mediaStorage_growthQty }
- Storage Used Growth, %: { _mediaStorage_growthPct }

### Channels

Provided stats below are for non - empty channels only:

- Total Channels, qty : { _nonEmptyChannel_startBlock }
- Total Channels, qty : { _nonEmptyChannel_endBlock }
- Channels Growth, qty: { _nonEmptyChannel_growthQty }
- Channels Growth, %: { _nonEmptyChannel_growthPct }

### Video NFTs

- Total NFT(start block): { _videoNFTs_startBlock }
- Total NFT(end block): { _videoNFTs_endBlock }
- NFT Growth, qty: { _videoNFTs_growthQty }
- NFT Growth, %: { _videoNFTs_growthPct }
- NFT sold, qty: { _videoNFTs_soldQty }
- NFT sold, Volume: { _videoNFTs_soldVolume }

### ** Membership **

- Total Membership Accounts: { _membership_startBlock }
- Total Membership Accounts: { _membership_endBlock }
- Membership Accounts Growth, { _membership_growthQty }
- Membership Accounts Growth, %: { _membership_growthPct }

### Proposals

**Passed**
{ proposals_executed }
**Not passed**
{ proposals_notPassed }
**Under review**
{ proposals_underReview }
`;

export const weeklyReportTempleteWithoutMediaStatus = `
### ** General **

** Start Block **
- Start Block: { _general_startBlock_number }
- Start Block Hash: { _general_startBlock_hash }
- Start Block Time: { _general_startBlock_timestamp }

** End Block **
- End Block: { _general_endBlock_number }
- End Block Hash: { _general_endBlock_hash }
- End Block Time: { _general_endBlock_timestamp }

### ** Issuance **

- Issuance by start block: { _issuance_startBlock }
- Issuance by end block: { _issuance_endBlock }
- Issuance, ** Δ ** : { _issuance_changedIssuance }

### MEXC exchange wallet

- Balance(Start Block): { _mexc_startBlock }
- Balance(End Block): { _mexc_endBlock }
- Balance change: { _mexc_changedBalance }

### Supply

Data over period:

- JOY inflation: { _supply_inflationChanged }
- Tokens Changed: { _supply_changedToken }
- Tokens Minted: { _supply_mintedToken }
- Tokens Burned: { _supply_burnedToken }

### DAO spending

| Description | Total minted, JOY |
| --- | --- |
| Council rewards | { _daoSpending_councilReward } |
| WG spent | { _daoSpending_wgSpent } |
| Funding proposals | { _daoSpending_fundingProposals } |
| Creator payout rewards | { _daoSpending_creatorPayoutRewards } |
| Validator rewards | { _daoSpending_validatorRewards } |
| Grand Total | { _daoSpending_grandTotal } |

### ** Council Budget **

| Item | Tokens, JOY |
| --- | --- |
| Starting Council budget | { _councilBudget_startBudget } |
| Spending from Council budget | { _councilBudget_spendingBudget } |
| Refill of Council budget | { _councilBudget_refillBudget } |
| Ending Council budget | { _councilBudget_endBudget } |

### WG budgets

  | Working group | Start budget, JOY | Total refilled, JOY | Total spending(actual), JOY | End budget, JOY |
| --- | --- | --- | --- | --- |
| Builders | { _wgBudgets_Builders_startBudget } | { _wgBudgets_Builders_totalRefilled } | { _wgBudgets_Builders_totalSpending } | { _wgBudgets_Builders_endBudget } |
| Storage | { _wgBudgets_Storage_startBudget } | { _wgBudgets_Storage_totalRefilled } | { _wgBudgets_Storage_totalSpending } | { _wgBudgets_Storage_endBudget } |
| Distribution | { _wgBudgets_Distribution_startBudget } | { _wgBudgets_Distribution_totalRefilled } | { _wgBudgets_Distribution_totalSpending } | { _wgBudgets_Distribution_endBudget } |
| Forum | { _wgBudgets_Forum_startBudget } | { _wgBudgets_Forum_totalRefilled } | { _wgBudgets_Forum_totalSpending } | { _wgBudgets_Forum_endBudget } |
| Apps | { _wgBudgets_Apps_startBudget } | { _wgBudgets_Apps_totalRefilled } | { _wgBudgets_Apps_totalSpending } | { _wgBudgets_Apps_endBudget } |
| Content | { _wgBudgets_Content_startBudget } | { _wgBudgets_Content_totalRefilled } | { _wgBudgets_Content_totalSpending } | { _wgBudgets_Content_endBudget } |
| HR | { _wgBudgets_HR_startBudget } | { _wgBudgets_HR_totalRefilled } | { _wgBudgets_HR_totalSpending } | { _wgBudgets_HR_endBudget } |
| Membership | { _wgBudgets_Membership_startBudget } | { _wgBudgets_Membership_totalRefilled } | { _wgBudgets_Membership_totalSpending } | { _wgBudgets_Membership_endBudget } |
| Marketing | { _wgBudgets_Marketing_startBudget } | { _wgBudgets_Marketing_totalRefilled } | { _wgBudgets_Marketing_totalSpending } | { _wgBudgets_Marketing_endBudget } |

| Working group | Lead salary, JOY | Workers salary, JOY | Spending proposals, JOY |
| --- | --- | --- | --- |
| Builders | { _wgBudgets_Builders_leadSalary } | { _wgBudgets_Builders_workerSalary } | { _wgBudgets_Builders_spendingProposals } |
| Storage | { _wgBudgets_Storage_leadSalary } | { _wgBudgets_Storage_workerSalary } | { _wgBudgets_Storage_spendingProposals } |
| Distribution | { _wgBudgets_Distribution_leadSalary } | { _wgBudgets_Distribution_workerSalary } | { _wgBudgets_Distribution_spendingProposals } |
| Forum | { _wgBudgets_Forum_leadSalary } | { _wgBudgets_Forum_workerSalary } | { _wgBudgets_Forum_spendingProposals } |
| Apps | { _wgBudgets_Apps_leadSalary } | { _wgBudgets_Apps_workerSalary } | { _wgBudgets_Apps_spendingProposals } |
| Content | { _wgBudgets_Content_leadSalary } | { _wgBudgets_Content_workerSalary } | { _wgBudgets_Content_spendingProposals } |
| HR | { _wgBudgets_HR_leadSalary } | { _wgBudgets_HR_workerSalary } | { _wgBudgets_HR_spendingProposals } |
| Membership | { _wgBudgets_Membership_leadSalary } | { _wgBudgets_Membership_workerSalary } | { _wgBudgets_Membership_spendingProposals } |
| Marketing | { _wgBudgets_Marketing_leadSalary } | { _wgBudgets_Marketing_workerSalary } | { _wgBudgets_Marketing_spendingProposals } |

### Videos

- Total Videos(start block), qty: { _videos_startBlock }
- Total Videos(end block), qty: { _videos_endBlock }
- Videos Growth, qty: { _videos_growthQty }
- Videos Growth, %: { _videos_growthPct }

### Channels

Provided stats below are for non - empty channels only:

- Total Channels, qty : { _nonEmptyChannel_startBlock }
- Total Channels, qty : { _nonEmptyChannel_endBlock }
- Channels Growth, qty: { _nonEmptyChannel_growthQty }
- Channels Growth, %: { _nonEmptyChannel_growthPct }


### Video NFTs

- Total NFT(start block): { _videoNFTs_startBlock }
- Total NFT(end block): { _videoNFTs_endBlock }
- NFT Growth, qty: { _videoNFTs_growthQty }
- NFT Growth, %: { _videoNFTs_growthPct }
- NFT sold, qty: { _videoNFTs_soldQty }
- NFT sold, Volume: { _videoNFTs_soldVolume }

### ** Membership **

- Total Membership Accounts: { _membership_startBlock }
- Total Membership Accounts: { _membership_endBlock }
- Membership Accounts Growth, { _membership_growthQty }
- Membership Accounts Growth, %: { _membership_growthPct }

### Proposals

{ proposals_executed }
**Not passed**
{ proposals_notPassed }
**Under review**
{ proposals_underReview }
`;