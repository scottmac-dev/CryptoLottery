// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LotteryTicket is ERC20 {

    uint public lotteryId; // unique identifier for tokens specific to one lottery event
    address public lotteryAddress; // contract address where token instance is deployed
    mapping(uint => address) public ticketOwners; // allows each ticket to have a uint id for random selection

    constructor(uint256 initialSupply, address _lotteryAddress, uint _lotteryId) ERC20("LotteryTicket", "LT") {
        lotteryId = _lotteryId;
        lotteryAddress = _lotteryAddress;
        _mint(lotteryAddress, initialSupply);
    }

    // Custom override transfer to allow for unique ticketId to owner address mappings
    function transfer(address to, uint256 amount) public override returns (bool){
        require(amount > 0 && amount <= balanceOf(msg.sender), "Invalid transfer amount"); // validity check

        // Call parent transfer
        super.transfer(to, amount);

        // update token id to address ownership mapping
        for (uint i = 0; i < amount; i++) {
            uint ticketNumber = totalSupply() - amount + i + 1; // increments by 1 each sale
            ticketOwners[ticketNumber] = to; // assigns ownership
        }

        return true;
    }

    modifier onlyLottery() {
        require(msg.sender == lotteryAddress, "Only the associated lottery can call this function");
        _;
    }
}