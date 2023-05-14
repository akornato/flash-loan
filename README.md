# Flash Loan

This demonstrates a flash loan with Aave V3 used for triangular arbitrage (DAI/USDT/USDC) with Uniswap V3.

To ensure the flash loan contract is always able to repay the loan, even if the arbitrage would result in a complete loss of borrowed funds, the script first impersonates an existing DAI token holder to send both loaned amount and premium to the flash loan contract.

# Usage

1. `npm i`
2. `npm run flash-loan`

