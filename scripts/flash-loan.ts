import { ethers, network } from "hardhat";
import type { IERC20 } from "../typechain";

const aavePoolAddressProviderAddress =
  "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
const daiTokenAddress = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
const daiTokenHolder = "0x0C249eF4592869a6bF8195d90de948BE2b7c2744";

async function main() {
  const FlashLoan = await ethers.getContractFactory("FlashLoan");
  const flashLoan = await FlashLoan.deploy();
  await flashLoan.deployed();

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [daiTokenHolder],
  });
  const impersonatedSigner = await ethers.getSigner(daiTokenHolder);
  const token = (await ethers.getContractAt(
    "IERC20",
    daiTokenAddress
  )) as IERC20;
  const txTransfer = await token
    .connect(impersonatedSigner)
    .transfer(flashLoan.address, 500000000000000); // premium
  await txTransfer.wait();
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [daiTokenHolder],
  });

  const paramsEncoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    ["0xbFEFD48aAB2EBE3671eF3A6a6711f7aB3A069C3F", 15]
  );

  const txFlashLoan = await flashLoan.run(
    aavePoolAddressProviderAddress,
    daiTokenAddress,
    ethers.utils.parseEther("1"), // amount
    paramsEncoded
  );
  await txFlashLoan.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
