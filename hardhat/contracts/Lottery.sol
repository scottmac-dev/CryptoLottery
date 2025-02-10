// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./LotteryTicket.sol"; // Import the LotteryToken contract
import "./LotteryFactory.sol"; // Import the LotteryFactory interface

// Main lottery contract which stores data regarding lottery event.
contract Lottery {
    // State variables
    uint public lotteryId; // this lotteries unique id for token verification
    address public immutable owner; // creator/admin address
    address[] public ticketHolders; // array of ticket holder addresses
    address public tokensAddress;
    mapping(address => uint) public amountTicketsHeld; // map address to number of tickets
    uint public ticketSupply; // total num tickets for single lottery
    uint public ticketsSold; // track ticket sales
    LotteryTicket public tickets; // tickets are ERC20 tokens
    LotteryFactory public lotteryFactory; // Reference to the LotteryFactory contract
    uint public ticketPrice; // ticket price in Wei
    bool public winnerChosen;

    // Events
    event TicketSale(uint amount, address indexed buyer);
    event AllocationExhausted(uint indexed _lotteryId);
    event WinnerDrawn(address indexed winnerAddress, uint ticketNumber);
    event FundsDistributed(address indexed recipientOfLotteryFunds);

    // Constructor
    constructor(uint _ticketSupply, uint _lotteryId, uint _ticketPrice, address factoryOwner){
        require(_ticketSupply > 0, "Ticket supply must be greater than zero"); // Ensure positive supply
        lotteryId = _lotteryId;
        owner = factoryOwner;
        ticketSupply = _ticketSupply;
        ticketPrice = _ticketPrice;
        tickets = new LotteryTicket(_ticketSupply, address(this), lotteryId); // tickets (tokens) init and minted to this contracts address
        lotteryFactory = LotteryFactory(msg.sender); // Store the LotteryFactory address
        tokensAddress = address(tickets);
    }

    // Buy ticket
    function buyTicket(uint amount) public payable{
        // Security checks
        require(ticketsSold < ticketSupply, "No tickets remaining"); // ensure supply not exhausted
        require(amount <= ticketSupply - ticketsSold, "Not enough tickets to fulfill purchase"); // ensure enough to fulfill order
        require(msg.value == ticketPrice * amount, "Incorrect payment amount"); // ensure correct payment
        require(amount == uint(msg.value / ticketPrice), "Must purchase whole tickets"); // ensure whole tickets only, no decimals
        
        // Update state variables
        ticketsSold += amount;
        amountTicketsHeld[msg.sender] += amount;

        // If not a prev holder, push to ticketHolders array
        if(isTicketHolder(msg.sender) == false){
            ticketHolders.push(msg.sender);
        }

        // Transfer ticket tokens to purchasers address
        tickets.transfer(msg.sender, amount);
        emit TicketSale(amount, msg.sender);

        // If all tickets now sold, emit event
        if(allTicketsSold()){
            emit AllocationExhausted(lotteryId);
        }
    }

    // Pick winner
    function pickWinner(uint randomTicketNumber) external view onlyOwner() returns(address, uint) {
        // Ensure all tickets sold
        require(allTicketsSold(), "Cannot call, tickets still remaining");
        address winner = tickets.returnTicketOwner(randomTicketNumber); // Get the owner of the ticket number

        require(isTicketHolder(winner), "Winner address must be ticket holder"); // Ensure there is a winner

        return (winner, randomTicketNumber);
    }

    function callWinner(address winnerAddr, uint ticketNum) external onlyOwner(){
        require(allTicketsSold(), "Cannot call while tickets outstanding");
        winnerChosen = true;
        emit WinnerDrawn(winnerAddr, ticketNum); // Emit event for winner
        lotteryFactory.setLotteryWinState(lotteryId);
    }

    // Allocate funds
    function allocateFunds(address winnerAddr) external onlyOwner() payable{
        // Verify checks
        require(allTicketsSold(), "Cannot call while tickets outstanding");
        require(winnerChosen, "Cannot allocate before winner is picked");

        // Get contract balance and establish payable amount and admin fee
        uint256 contractBalance = address(this).balance; // Get the contract's ETH balance
        uint256 winnerAmount = (contractBalance * 95) / 100; // Calculate 95% for the winner
        uint256 adminAmount = contractBalance - winnerAmount; // Remaining 5% for the owner

        payable(winnerAddr).transfer(winnerAmount); // Send 95% to the winner
        payable(owner).transfer(adminAmount); // Send 5% to the owner

        emit FundsDistributed(winnerAddr); // Emit event for funds distribution
        lotteryFactory.setWinner(lotteryId, winnerAddr);

    }

    // Query functions
    // Bool result for address having purchased a ticket
    function isTicketHolder(address searchAddr) public view returns(bool){
        bool holdsTicket = false;
        for(uint i = 0; i < ticketHolders.length; i++){ 
            if(searchAddr == ticketHolders[i]){
                holdsTicket = true;
            }
        }
        return holdsTicket;
    }

    // Returns amount of tickets held by single address
    function getAddressTicketAmount(address searchAddr) public view returns(uint){
        require(isTicketHolder(searchAddr), "Address has not purchased ticket");
        return amountTicketsHeld[searchAddr];
    }

    // returning ERC20 token balance of user address
    function getERC20Balance(address searchAddr) public view returns(uint){
        return tickets.balanceOf(searchAddr);
    }

    // returning current token balance
    function getContractTokenBalance() public view returns(uint256){
        return tickets.balanceOf(address(this));
    }

    // returning contract eth balance
    function getContractETHBalance() public view returns(uint){
        return address(this).balance;
    }

    // returning remaining tickets
    function getRemainingTickets() public view returns(uint256){
        return ticketSupply - ticketsSold;
    }

    // Bool result for all tickets sold
    function allTicketsSold() public view returns(bool){
        return ticketsSold == ticketSupply;
    }

    // Return owners address
    function getOwnerAddress() public view returns(address){
        return owner;
    }

    // Get owners address of a ticket number
    function returnTicketOwner(uint ticketNumber) public view returns(address){
        return tickets.returnTicketOwner(ticketNumber);
    }

    // Return ticket supply number for random selection offchain
    function getTicketSupply() public view returns(uint){
        return ticketSupply;
    }

    function getTicketPrice() public view returns(uint) {
        return ticketPrice;
    }

    function getTokensAddress() public view returns(address){
        return tokensAddress;
    }

    function getLotteryId() public view returns(uint){
        return lotteryId;
    }

    function getAllTicketHolders() public view returns (address[] memory) {
        return ticketHolders;
    }

    // Allows contract to receive ether with no data.
    receive() external payable {
    }

    // Modifiers
    // Only contract owner may call
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner may call this function");
        _;
    }

    // Only ticket holders may call
    modifier onlyTicketHolders() {
        bool _isTicketHolder = isTicketHolder(msg.sender);
        require(_isTicketHolder, "Only ticket holders may call this function");
        _;
    }
}
