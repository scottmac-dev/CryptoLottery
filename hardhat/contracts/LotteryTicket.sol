// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LotteryTicket is ERC20 {

    uint public lotteryId; // unique identifier for tokens specific to one lottery event
    address public lotteryAddress;

    constructor(uint256 initialSupply, address _lotteryAddress, uint _lotteryId) ERC20("LotteryTicket", "LT") {
        lotteryId = _lotteryId;
        lotteryAddress = _lotteryAddress;
        _mint(lotteryAddress, initialSupply);
    }

    modifier onlyLottery() {
        require(msg.sender == lotteryAddress, "Only the associated lottery can call this function");
        _;
    }
}