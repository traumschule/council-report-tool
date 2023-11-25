export const QN_URL =
  import.meta.env.VITE_QN_URL || "https://query.joystream.org/graphql";
export const NODE_SOCKET =
  import.meta.env.VITE_NODE_SOCKET || "wss://rpc.joystream.org:9944";

export const MEXC_WALLET = "5CFYPwkpP4oEeCUviVafWBNwpRPF7SjUpL4q8A7KtJJhQ1gJ";
export const defaultDateTimeFormat = "MMMM DD YYYY";
export const proposalLink = "https://pioneerapp.xyz/#/proposals/preview/";
export const weeklyReportTemplateWithMediaStatus = `
**_general_startBlock_timestamp - _general_endBlock_timestamp**
- Start Block: _general_startBlock_number 
- End Block: _general_endBlock_number

# Tokenomics

- Total supply: **_supply_totalSupply JOY**
- JOY inflation (since mainnet launch): **_supply_inflationChanged %**
- Circulating supply:  **_supply_circulatingSupply JOY**
- Weekly Tokens Minted: **_supply_mintedToken JOY**
- Weekly Tokens Burned: **(_supply_burnedToken) JOY**

MEXC exchange wallet:

- Balance:  **_mexc_endBlock JOY**
- Weekly Balance change: **_mexc_changedBalance JOY**

DAO Spending:

- Start Issuance: **_daoSpending_startIssuance JOY**
- End Issuance: **_daoSpending_endIssuance JOY**
- Total minted (net): **_daoSpending_mintedToken JOY**

*including:*

- Council rewards: **_daoSpending_councilReward JOY**
- WG spent: **_daoSpending_wgSpent JOY**
- Funding proposals: **_daoSpending_fundingProposals JOY**
- Creator payout: **_daoSpending_creatorPayoutRewards JOY**
- Validator rewards: **_daoSpending_validatorRewards JOY**
- Fees and token burn: **(_supply_burnedToken) JOY**

# **Content**

### Videos

- Total Videos, qty: **_videos_endBlock**
- Weekly Videos Growth, qty: **_videos_growthQty**
- Weekly Videos Growth, %: **_videos_growthPct%**

![_graph_videosChart](_graph_videosChart)

### Channels

Provided stats below are for non-empty channels only:

- Total Channels, qty:  **_nonEmptyChannel_endBlock**
- Weekly Channels Growth, qty: **_nonEmptyChannel_growthQty**
- Weekly Channels Growth, **_nonEmptyChannel_growthPct%**

![_graph_nonEmptyChannelChart](_graph_nonEmptyChannelChart)

### Media Storage

- Total Storage Used: **_mediaStorage_endBlock GB**
- Weekly Storage Used Growth: **_mediaStorage_growthQty GB**
- Weekly Storage Used Growth, %: **_mediaStorage_growthPct%**

![_graph_mediaStorageChart](_graph_mediaStorageChart)

### Video NFTs

- Total NFT: **_videoNFTs_endBlock**
- Weekly NFT Growth: **_videoNFTs_growthQty**
- Weekly NFT Growth, %: **_videoNFTs_growthPct %**
- Weekly NFT sold: _videoNFTs_soldQty

![_graph_videoNftChart](_graph_videoNftChart)

# **Membership**

- Total Membership Accounts: **_membership_endBlock**
- Weekly Membership Accounts Growth: **_membership_growthQty**
- Weekly Membership Accounts Growth, %: **_membership_growthPct %**

![_graph_membershipChart](_graph_membershipChart)

# Proposals

### Passed
proposals_executed
### Deciding
proposals_deciding
`;

export const weeklyReportTempleteWithoutMediaStatus = `
**_general_startBlock_timestamp - _general_endBlock_timestamp**
- Start Block: _general_startBlock_number 
- End Block: _general_endBlock_number

# Tokenomics

- Total supply: **_supply_totalSupply JOY**
- JOY inflation (since mainnet launch): **_supply_inflationChanged %**
- Circulating supply:  **_supply_circulatingSupply JOY**
- Weekly Tokens Minted: **_supply_mintedToken JOY**
- Weekly Tokens Burned: **(_supply_burnedToken) JOY**

MEXC exchange wallet:

- Balance:  **_mexc_endBlock JOY**
- Weekly Balance change: **_mexc_changedBalance JOY**

DAO Spending:

- Start Issuance: **_daoSpending_startIssuance JOY**
- End Issuance: **_daoSpending_endIssuance JOY**
- Total minted (net): **_daoSpending_mintedToken JOY**

*including:*

- Council rewards: **_daoSpending_councilReward JOY**
- WG spent: **_daoSpending_wgSpent JOY**
- Funding proposals: **_daoSpending_fundingProposals JOY**
- Creator payout: **_daoSpending_creatorPayoutRewards JOY**
- Validator rewards: **_daoSpending_validatorRewards JOY**
- Fees and token burn: **(_supply_burnedToken) JOY**

# **Content**

### Videos

- Total Videos, qty: **_videos_endBlock**
- Weekly Videos Growth, qty: **_videos_growthQty**
- Weekly Videos Growth, %: **_videos_growthPct%**

![_graph_videosChart](_graph_videosChart)

### Channels

Provided stats below are for non-empty channels only:

- Total Channels, qty:  **_nonEmptyChannel_endBlock**
- Weekly Channels Growth, qty: **_nonEmptyChannel_growthQty**
- Weekly Channels Growth, **_nonEmptyChannel_growthPct%**

![_graph_nonEmptyChannelChart](_graph_nonEmptyChannelChart)

### Video NFTs

- Total NFT: **_videoNFTs_endBlock**
- Weekly NFT Growth: **_videoNFTs_growthQty**
- Weekly NFT Growth, %: **_videoNFTs_growthPct %**
- Weekly NFT sold: _videoNFTs_soldQty

![_graph_videoNftChart](_graph_videoNftChart)

# **Membership**

- Total Membership Accounts: **_membership_endBlock**
- Weekly Membership Accounts Growth: **_membership_growthQty**
- Weekly Membership Accounts Growth, %: **_membership_growthPct %**

![_graph_membershipChart](_graph_membershipChart)

# Proposals

### Passed
proposals_executed
### Deciding
proposals_deciding
`;