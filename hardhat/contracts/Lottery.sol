// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./LotteryTicket.sol"; // Import the LotteryToken contract

// Main lottery contract which stores data regarding lottery event.
contract Lottery {
    // State variables
    uint public lotteryId; // this lotteries unique id for token verification
    address public owner; // creator/admin address
    address[] public ticketHolders; // array of ticket holder addresses
    mapping(address => uint) public amountTicketsHeld; // map address to number of tickets
    uint public ticketSupply; // total num tickets for single lottery
    uint public ticketsSold; // track ticket sales
    LotteryTicket public tickets; // tickets are ERC20 tokens
    uint public constant TICKET_PRICE = 0.01 ether; // Define ticket price in Wei

    // Events
    event TicketSale(uint amount, address indexed buyer);
    event AllocationExhausted(uint indexed _lotteryId);
    event WinnerDrawn(address indexed winnerAddress);
    event FundsDistributed(address indexed recipientOfLotteryFunds);

    // Constructor
    constructor(uint _ticketSupply, uint _lotteryId){
        require(_ticketSupply > 0, "Ticket supply must be greater than zero"); // Ensure positive supply
        lotteryId = _lotteryId;
        owner = msg.sender;
        ticketSupply = _ticketSupply;
        tickets = new LotteryTicket(_ticketSupply, address(this), lotteryId); // tickets (tokens) init and minted to this contracts address
    }

    // Buy ticket
    function buyTicket(uint amount) public payable{
        // Security checks
        require(ticketsSold < ticketSupply, "No tickets remaining"); // ensure supply not exhausted
        require(amount <= ticketSupply - ticketsSold, "Not enough tickets to fulfill purchase"); // ensure enough to fulfill order
        require(msg.value == TICKET_PRICE * amount, "Incorrect payment amount"); // ensure correct payment
        require(amount == uint(msg.value / TICKET_PRICE), "Must purchase whole tickets"); // ensure whole tickets only, no decimals
        
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
    function pickWinner() public onlyOwner() returns(address) {
        require(allTicketsSold(), "Cannot call, tickets still remaining");
        
        // Generate a random ticket number
        uint randomTicketNumber = (uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % ticketSupply) + 1;

        // Find the winner based on the random ticket number
        address winner = tickets.ticketOwners(randomTicketNumber); // Get the owner of the ticket number

        require(winner != address(0), "No winner found for this ticket number"); // Ensure there is a winner

        emit WinnerDrawn(winner); // Emit event for winner
        return winner;
    }

    // Allocate funds

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
    function getTicketAmount(address searchAddr) public view returns(uint){
        require(isTicketHolder(searchAddr), "Address has not purchased ticket");
        return amountTicketsHeld[searchAddr];
    }

    // Bool result for all tickets sold
    function allTicketsSold() public view returns(bool){
        return ticketsSold == ticketSupply;
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
