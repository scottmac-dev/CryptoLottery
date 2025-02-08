const {ethers} = require("hardhat");
require("dotenv").config();

ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL;
SEPOLIA_PRIVATE_KEY= process.env.SEPOLIA_PRIVATE_KEY;

const RPC_URL = ALCHEMY_SEPOLIA_URL; // Replace with your Alchemy/Infura URL
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY; // Store your private key in a .env file for security
const CONTRACT_ADDRESS = "0x57623Ee8e3C8C6AD78103dEcf5eb58A29176CF33"; // Deployed contract address

const ABI = [
  "function createNewLottery(uint ticketSupply, uint ticketPrice) public returns(uint, address)"
];

async function createLottery(ticketSupply, ticketPrice) {
  if (!PRIVATE_KEY) {
    console.error("Private key is missing!");
    return;
  }

  // Connect to provider & signer
  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL);
  const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  try {
    console.log("Creating a new lottery...");

    // Convert ETH ticket price to Wei
    const ticketPriceWei = ethers.parseEther(ticketPrice);

    // Call the function
    const tx = await contract.createNewLottery(ticketSupply, ticketPriceWei);
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt?.blockNumber}`);

    // Extract the emitted event data (lotteryId & deployed address)
    if (receipt.logs.length > 0) {
      const log = receipt.logs[0]; // First log should be the LotteryCreated event
      console.log(`New Lottery ID: ${log.args?.[0]}`);
      console.log(`Deployed to Address: ${log.args?.[1]}`);
    }
  } catch (error) {
    console.error("Error creating lottery:", error);
  }
}

// Call the function (Example: 100 tickets, 0.01 ETH per ticket)
createLottery(10, "0.01");
