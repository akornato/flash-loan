# Flash Loan

This demonstrates a flash loan used for triangular arbitrage (DAI/USDT/USDC) with Uniswap V3, tested on Arbitrum mainnet fork with some recent block number pinned as in `.env.example`.

To ensure the flash loan contract is always able to repay the loan, even if the arbitrage would result in a complete loss of borrowed funds, the script first impersonates an existing DAI token holder to send both loaned amount and premium to the flash loan contract.

# Usage

1. copy `.env.example` to `.env` and replace `<KEY>` with your Alchemy key for Arbitrum mainnet
2. `npm i`
3. `npm run flash-loan`
