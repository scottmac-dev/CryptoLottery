const { ethers } = require("hardhat");
require("dotenv").config();

// Set environment variables
const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const RPC_URL = ALCHEMY_SEPOLIA_URL;
const PRIVATE_KEY = SEPOLIA_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.FACTORY_ADDRESS;

const ABI = [
  "function getLotteryCount() public view returns(uint)",
  "function getLotteryById(uint _lotteryId) public view returns((uint lotteryId, address deployedToContract, bool winnerAnnounced, uint createdAt))",
  "function pickWinner(uint randomTicketNumber) external view onlyOwner() returns(address, uint)",
  "function allocateFunds(address winnerAddr) external onlyOwner() payable",
  "function callWinner(address winnerAddr, uint ticketNum) external onlyOwner()"
];

async function main() {
  // Connect to the provider (Alchemy or another RPC)
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Set the signer (owner's private key)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Connect to the LotteryFactory contract
  const factoryContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  // Fetch the most recent lottery id
  const lotteryCount = await factoryContract.getLotteryCount();
  const lotteryId = lotteryCount; // Assuming we want the latest created lottery

  // Get the lottery details by ID
  const lotteryDetails = await factoryContract.getLotteryById(lotteryId);
  const lotteryAddress = lotteryDetails.deployedToContract; // The address of the lottery contract

  console.log(`Lottery address: ${lotteryAddress}`);

  // Now connect to the deployed Lottery contract
  const lotteryContract = new ethers.Contract(lotteryAddress, [
    "function pickWinner(uint randomTicketNumber) external view onlyOwner() returns(address, uint)",
    "function allocateFunds(address winnerAddr) external onlyOwner() payable",
    "function callWinner(address winnerAddr, uint ticketNum) external onlyOwner()"
  ], wallet);

  // Random ticket number to pick a winner (this should be generated or passed in your logic)
  const randomTicketNumber = 5;

  // Pick winner (should be executed by the owner)
  const [winnerAddress, winningTicketNumber] = await lotteryContract.pickWinner(randomTicketNumber);
  console.log(`Winner: ${winnerAddress} with ticket number ${winningTicketNumber}`);

  // Allocate funds (this also must be done by the owner)
  await lotteryContract.allocateFunds(winnerAddress);  // No value needed as contract handles allocation
  console.log(`Funds allocated to ${winnerAddress}`);

  // Call winner function to finalize the process (this is also an owner function)
  await lotteryContract.callWinner(winnerAddress, winningTicketNumber);
  console.log(`Winner process completed for ${winnerAddress}`);
}

// Run the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
