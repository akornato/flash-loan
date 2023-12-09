import { ethers, network } from "hardhat";
import type { BigNumber } from "ethers";

...
  // Removed Aave references

  ...

  const txFlashLoan = await exchange.flashLoanSimple(
    flashLoan.address,
    arbitrumDAI,
    amountToLend,
    paramsEncoded,
    0
  );
  await txFlashLoan.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
