# Flash Loan

This demonstrates a flash loan with Aave V3, tested on an Arbitrum mainnet fork with some recent block number pinned as in `.env.example`. To ensure that the flash loan contract is always able to repay the loan, the script first impersonates an existing DAI token holder to secure the Aave premium.

# Usage

1. copy `.env.example` to `.env` and replace `<KEY>` with your Alchemy key for Arbitrum mainnet
2. `npm i`
3. `npm run flash-loan`
