import { useWallet } from "@/context/WalletContext";
import AccountCard from "../customUI/AccountCard";
import LotteryStatsCard from "../customUI/LotteryStatsCard";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lotteryFactoryAbi from "../../utils/LotteryFactory.json"; // Factory ABI
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI
import { CountStatsCard, PayoutStatsCard } from "../customUI/CounterCards";
import {FaSpinner} from "react-icons/fa";
import InfoAccordion from "../customUI/InfoAccordion";
import BuyTicketsBtn from "../customUI/BuyTicketsBtn";
import PreviousLotteries from "../customUI/PreviousLotteries";



const LOTTERYFACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_LOTTERY_FACTORY_ADDRESS;

function Home() {
  const { account } = useWallet();
  const [lotteryCount, setLotteryCount] = useState<number | null>(null);
  const [totalPayout, setTotalPayout] = useState<string | null>(null); // Store as string representing ETH
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [loading2, setLoading2] = useState<boolean>(true); // Loading state
  const [currentLotteryAddress, setCurrentAdddress] = useState<string | null>(null);
  const [ticketPrice, setTicketPrice] = useState<string | null>(null);


  useEffect(() => {
      const fetchStats = async () => {
        try {
          console.log("Fetching lottery stats...");
          const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL); // Use Alchemy or Infura
          const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);

          // Step 1: Get the latest lottery count
          const returnedCount = await contract.getLotteryCount();
          const count = Number(returnedCount);
          setLotteryCount(count);

          let payoutAmount = 0; // Initialize payout amount as a plain number

          // Step 2: Iterate over each lottery and calculate payouts
          for (let i = 1; i <= count; i++) {
            const lotteryInfo = await contract.getLotteryById(i);
            const deployedAddress = lotteryInfo.deployedToContract;
            const paidOut = lotteryInfo.winnerAnnounced;

            if (paidOut) {
              const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);
              const ticketPrice = await lotteryContract.getTicketPrice(); // Assumed to be a number in Wei
              const totalTickets = await lotteryContract.getTicketSupply(); // Assumed to be a number

              // Multiply ticket price by total tickets, then apply the 95% payout rate
              const payoutWei = BigInt(ticketPrice) * BigInt(totalTickets) * BigInt(95) / BigInt(100);
              const payoutEth = Number(payoutWei) / 1e18; 

              // Add the payout amount to the total
              payoutAmount += payoutEth;
            }
          }

          // Update state with the total payout as a string (ETH)
          setTotalPayout(payoutAmount.toString()); // Convert to string to pass around
          setLoading(false); // Data fetching is complete
        } catch (error) {
          console.error("Error fetching lottery stats:", error);
          setLoading(false); // Stop loading on error
        }
      };

      fetchStats();
    }, []);

    useEffect(() => {
      const fetchLotteryStats = async () => {
        try {
          console.log("Fetching lottery stats...");
          const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL); // Use Alchemy or Infura
          const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);
  
          const returnedId = await contract.getLotteryCount();
          const lotteryId = Number(returnedId);
  
          // Step 2: Get deployed contract address
          const lotteryInfo = await contract.getLotteryById(lotteryId);
  
          const deployedAddress = lotteryInfo.deployedToContract;
  
          // Step 3: Query deployed Lottery contract
          const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);
  
          const _ticketPrice = await lotteryContract.getTicketPrice();
          setTicketPrice(ethers.formatEther(_ticketPrice)); // Convert Wei to ETH
          setCurrentAdddress(deployedAddress);
          setLoading2(false); // Data fetching is complete
  
        } catch (error) {
          console.error("Error fetching lottery stats:", error);
        }
      };
  
      fetchLotteryStats();
    }, []);


  return (
    <div className="flex flex-col min-h-screen bg-secondary items-center">
      {/* For small screens: flex-col, for md and above: flex-row */}
      <div className="flex flex-col md:flex-row items-center gap-5 mt-2">
        <AccountCard />
        <LotteryStatsCard />
      </div>
      <Separator className="mt-8 bg-primary" />
      <div className="flex flex-col w-full h-full bg-primary items-center">
        <h3 className="font-tech text-3xl text-highlight mt-3">Welcome to Crypto Lottery</h3>
        <p className="text-lg font-roboto text-basic mt-2 text-center max-w-2xl ml-3 mr-3">
          Buy tickets with Sepolia test ETH and try your luck—one winner takes the jackpot!
        </p>
        <div className="flex flex-col md:flex-row gap-5 mt-3 mb-3">
          {loading ? (
            <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin text-4xl text-primary" /> {/* React spinner icon */}
            </div>
          ) : (
            lotteryCount && totalPayout ? (
              <>
                {/* Conditionally render the cards only if data is available */}
                <CountStatsCard lotteryCount={lotteryCount - 1} />
                <PayoutStatsCard totalPayout={totalPayout} />
              </>
            ) : (
              <p>Error- No data available.</p> // Display this message if the data is missing or undefined
            )
          )}
      </div>
        <p className="text-2xl font-roboto text-blue-500 mt-2 text-center mt-5">
              FAQ:
        </p>
        <InfoAccordion />
        <h3 className="font-tech text-3xl text-highlight mt-8">So... feeling lucky??</h3>
        {loading2 ? (
            <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin text-4xl text-primary" /> 
            </div>
          ) : (
            currentLotteryAddress && ticketPrice ? (
              <div className="flex max-w-[200px] mt-3 mb-10">
                <BuyTicketsBtn  contractAddress={currentLotteryAddress} ticketPrice={ticketPrice}/>
              </div>
          ) : (
            <p>Error- No data available.</p>
          )
        )}

      </div>
      <div className="flex  bg-secondary mt-5">
        <PreviousLotteries />

      </div>
    </div>
  );
}

export default Home;
