// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./Lottery.sol"; // Import the LotteryToken contract

// Lottery factory which will allow for the deployment of new lottery events.
contract LotteryFactory {
    address public immutable owner; // immutable owner address is contract creator
    mapping(uint => DeployedLottery) public deployedLotteries; // tracks deployed lotteries and their state
    uint public idCounter; // sequential id labeling of lotteries created

    event LotteryCreated(uint indexed lotteryId, address owner, uint createdAt);

    struct DeployedLottery {
        uint lotteryId;
        address deployedToContract;
        bool winnerAnnounced;
        uint createdAt;
    }

    constructor() {
        owner = msg.sender;
    }

    function createNewLottery(uint ticketSupply, uint ticketPrice) public onlyOwner() returns(uint, address) {
        idCounter += 1; // Increment the idCounter for lottery creation.
        // Create a new Lottery contract instance
        Lottery newLottery = new Lottery(ticketSupply, idCounter, ticketPrice, owner);
        
        // Store the deployed lottery in the mapping
        deployedLotteries[idCounter] = DeployedLottery({
            lotteryId: idCounter,
            deployedToContract: address(newLottery),
            winnerAnnounced: false,
            createdAt: block.timestamp
        });

        emit LotteryCreated(idCounter, owner, block.timestamp);

        return (idCounter, address(newLottery));
    }

    function setLotteryWinState(uint _lotteryId) onlyChildren() external {
        deployedLotteries[_lotteryId].winnerAnnounced = true;
    }

    function getLotteryById(uint _lotteryId) public view returns(DeployedLottery memory lotteryInstance){
        return deployedLotteries[_lotteryId];
    }

    function getLotteryCount() public view returns(uint){
        return idCounter;
    }

    function getOwnerAddress() public onlyOwner() view returns(address){
        return owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier onlyChildren() {
        bool isChildContract;
         for(uint i = 1; i <= idCounter; i++){
            if(deployedLotteries[i].deployedToContract == msg.sender){
                isChildContract = true;
            }
        }
        require(isChildContract);
        _;

    }
}

