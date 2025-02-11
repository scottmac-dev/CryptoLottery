const { ethers } = require("hardhat");
require("dotenv").config();

// Set environment variables
const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;

const FACTORY_CONTRACT = require("../artifacts/contracts/LotteryFactory.sol/LotteryFactory.json");
const LOTTERY_CONTRACT = require("../artifacts/contracts/Lottery.sol/Lottery.json");

const factoryABI = FACTORY_CONTRACT.abi;
const lotteryABI = LOTTERY_CONTRACT.abi;


async function main() {
  // 1️⃣ Connect to Sepolia network using Alchemy provider
  const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL);
  const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

  console.log("Connected to wallet:", wallet.address);

  // 2️⃣ Attach to the Factory Contract
  const factoryContract = new ethers.Contract(FACTORY_ADDRESS, factoryABI, wallet);
  console.log("Connected to Factory Contract:", factoryContract.target);

  // 3️⃣ Get the deployed Lottery contract address
  const lotteryId = await factoryContract.getLotteryCount();
  const lotteryStruct = await factoryContract.getLotteryById(lotteryId);
  const lotteryAddress = lotteryStruct.deployedToContract;
  console.log("Latest deployed Lottery Contract Address:", lotteryAddress);

  // 4️⃣ Connect to the deployed Lottery Contract
  const lotteryContract = new ethers.Contract(lotteryAddress, lotteryABI, wallet);
  console.log("Connected to Lottery Contract:", lotteryAddress);

  // 5️⃣ Call functions on the lottery contract as the owner
  const owner = await lotteryContract.owner();
  console.log("Lottery contract owner:", owner);

  // Call functions to test allocation of funds

  console.log("Checking contract balance...")
  const balanceBefore = await lotteryContract.getContractETHBalance();
  console.log("Balance before: ", balanceBefore);

  // Get supply for randomizer
  console.log("Generating random ticket num...")
  const supply = lotteryContract.getTicketSupply();
  const randomTicketNum = Math.floor(Number(supply) * Math.random()) + 1.

  console.log("Picking winner...")
  await lotteryContract.pickWinner(randomTicketNum);
  console.log("Pick winner success:")

  console.log("Getting winner address...")
  const winnerAddress = await lotteryContract.returnTicketOwner(randomTicketNum);
  console.log("Returned winner addr",winnerAddress);

  console.log("Calling winner...")
  const tx2 = await lotteryContract.callWinner(winnerAddress, randomTicketNum);
  await tx2.wait();
  console.log("Call winner success:", tx2.hash)

  console.log("Allocating funds...")
  const tx3 = await lotteryContract.allocateFunds(winnerAddress);
  await tx3.wait();
  console.log("Allocate funds success:", tx2.hash)

  console.log("Checking contract balance after...");
  const balanceAfter = await lotteryContract.getContractETHBalance();
  console.log("Balance after: ", balanceAfter);

  console.log("Checking winner address on factory mapping...");
  const winnerAddr = await factoryContract.winnerAddresses(lotteryId);
  console.log("Winner address from factory mapping", winnerAddr);

  console.log("Checking win state...");
  const updatedStruct = await factoryContract.getLotteryById(lotteryId);
  console.log("State", updatedStruct.winnerAnnounced);

  console.log("End script...");
}

// Run the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});