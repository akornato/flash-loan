//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract FlashLoan {
    struct Params {
        address swapRouter;
        address token1;
        address token2;
    }

    ISwapRouter private swapRouter;

    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) private returns (uint256 amountOut) {
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    /**
     * @notice Executes an operation after receiving the flash-borrowed asset
     * @dev Ensure that the contract can return the debt + premium, e.g., has
     *      enough funds to repay and has approved the Pool to pull the total amount
     * @param borrowedToken The address of the flash-borrowed asset
     * @param borrowedAmount The amount of the flash-borrowed asset
     * @param premium The fee of the flash-borrowed asset
     * @param initiator The address of the flashloan initiator
     * @param params The byte-encoded params passed when initiating the flashloan
     * @return True if the execution of the operation succeeds, false otherwise
     */
    function executeOperation(
        address borrowedToken,
        uint256 borrowedAmount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        Params memory paramsDecoded = abi.decode(params, (Params));
        swapRouter = ISwapRouter(paramsDecoded.swapRouter);
        address token1 = paramsDecoded.token1;
        address token2 = paramsDecoded.token2;

        console.log("Borrowed amount");
        console.log(borrowedAmount);
        console.log("Premium");
        console.log(premium);
        console.log("Swap router");
        console.log(paramsDecoded.swapRouter);
        console.log("Token1");
        console.log(token1);
        console.log("Token2");
        console.log(token2);

        uint256 token1Amount = swapExactInputSingle(
            borrowedToken,
            token1,
            borrowedAmount
        );
        uint256 token2Amount = swapExactInputSingle(
            token1,
            token2,
            token1Amount
        );
        uint256 arbitragedAmount = swapExactInputSingle(
            token2,
            borrowedToken,
            token2Amount
        );

        TransferHelper.safeApprove(
            borrowedToken,
            msg.sender,
            borrowedAmount + premium
        );

        console.log("Arbitraged amount");
        console.log(arbitragedAmount);

        if (arbitragedAmount > borrowedAmount + premium) {
            console.log("Profit");
            console.log(arbitragedAmount - borrowedAmount - premium);
        } else {
            console.log("Loss
