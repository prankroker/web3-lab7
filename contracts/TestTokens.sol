// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Базовий контракт для генерації Токена А та Токена Б
contract GenericToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract UniswapV2RouterMock {
    ERC20 public tokenA;
    ERC20 public tokenB;

    constructor(address _tokenA, address _tokenB) {
        tokenA = ERC20(_tokenA);
        tokenB = ERC20(_tokenB);
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint,
        address[] calldata path,
        address to,
        uint
    ) external returns (uint[] memory amounts) {
        require(path[0] == address(tokenB) && path[1] == address(tokenA), "Invalid path");

        tokenB.transferFrom(msg.sender, address(this), amountIn);

        uint256 amountOut = amountIn * 2;

        tokenA.transfer(to, amountOut);

        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
        return amounts;
    }
}