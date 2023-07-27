import { ethers, network } from "hardhat";
import type { BigNumber } from "ethers";

const impersonatedTokenTransfer = async ({
  token,
  from,
  to,
  amount,
}: {
  token: string;
  from: string;
  to: string;
  amount: BigNumber;
}) => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [from],
  });
  const impersonatedSigner = await ethers.getSigner(from);
  const tokenContract = await ethers.getContractAt("IERC20", token);
  const txTransfer = await tokenContract
    .connect(impersonatedSigner)
    .transfer(to, amount);
  await txTransfer.wait();
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [from],
  });
};

async function main() {
  const poolAddressProviderAddress =
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
  const arbitrumDAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
  const arbitrumDAItokenHolder = "0x0C249eF4592869a6bF8195d90de948BE2b7c2744";
  const arbitrumUSDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
  const arbitrumUSDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
  const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const amountToLend = ethers.utils.parseEther("1");

  const FlashLoan = await ethers.getContractFactory("FlashLoan");
  const flashLoan = await FlashLoan.deploy();
  await flashLoan.deployed();

  const poolAddressProvider = await ethers.getContractAt(
    "IPoolAddressesProvider",
    poolAddressProviderAddress
  );

  const poolAddress = await poolAddressProvider.getPool();
  const pool = await ethers.getContractAt("IPool", poolAddress);
  const premium = await pool.FLASHLOAN_PREMIUM_TOTAL();
  // FLASHLOAN_PREMIUM_TOTAL is expressed as a fraction of 10000
  const premiumAmount = amountToLend.mul(premium).div(10000);

  await impersonatedTokenTransfer({
    token: arbitrumDAI,
    from: arbitrumDAItokenHolder,
    to: flashLoan.address,
    amount: amountToLend.add(premiumAmount),
  });

  const paramsEncoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [swapRouter, arbitrumUSDT, arbitrumUSDC]
  );

  const txFlashLoan = await pool.flashLoanSimple(
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

