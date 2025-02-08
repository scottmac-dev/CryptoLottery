import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lotteryFactoryAbi from "../../utils/LotteryFactory.json"; // Factory ABI
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI
import BuyTicketsBtn from "./BuyTicketsBtn";

interface Lottery {
  lotteryId: number;
  deployedToContract: string;
  winnerAnnounced: boolean;
  createdAt: number;
}

const LOTTERYFACTORY_CONTRACT_ADDRESS = "0x57623Ee8e3C8C6AD78103dEcf5eb58A29176CF33";

const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

export default function LotteryStatsCard() {
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [lotteryData, setLotteryData] = useState<Lottery | null>(null);
  const [totalTickets, setTotalTickets] = useState<number | null>(null);
  const [ticketsRemaining, setTicketsRemaining] = useState<number | null>(null);
  const [ticketPrice, setTicketPrice] = useState<string | null>(null);
  const [prizePool, setPrizePool] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotteryStats = async () => {
      try {
        console.log("Fetching lottery stats...");
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL); // Use Alchemy or Infura
        const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);

        // Step 1: Get the latest lottery ID
        const returnedId = await contract.getLotteryCount();
        const lotteryId = Number(returnedId);
        console.log("Latest lottery ID:", lotteryId);
        setCurrentId(lotteryId);

        // Step 2: Get deployed contract address
        const lotteryInfo = await contract.getLotteryById(lotteryId);
        console.log("Lottery Info:", lotteryInfo);

        const deployedAddress = lotteryInfo.deployedToContract;
        console.log("Deployed contract address:", deployedAddress);

        setLotteryData({
          lotteryId,
          deployedToContract: deployedAddress,
          winnerAnnounced: lotteryInfo.winnerAnnounced,
          createdAt: Number(lotteryInfo.createdAt),
        });

        // Step 3: Query deployed Lottery contract
        const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);

        const _totalTickets = await lotteryContract.getTicketSupply();
        setTotalTickets(Number(_totalTickets));

        const _ticketsRemaining = await lotteryContract.getRemainingTickets();
        setTicketsRemaining(Number(_ticketsRemaining));

        const _ticketPrice = await lotteryContract.getTicketPrice();
        setTicketPrice(ethers.formatEther(_ticketPrice)); // Convert Wei to ETH

        const _prizePool = await lotteryContract.getContractETHBalance();
        setPrizePool(ethers.formatEther(_prizePool));

      } catch (error) {
        console.error("Error fetching lottery stats:", error);
      }
    };

    fetchLotteryStats();
  }, []);

  return (
    <Card className="w-96 bg-primary/95 shadow-purple-500 shadow-lg">
      <CardHeader>
        <CardTitle className="font-tech text-2xl text-blue-500">Current Lottery</CardTitle>
      </CardHeader>
      <CardContent>
        {lotteryData && ticketPrice ? (
          <>
            <p className="text-lg font-roboto text-basic">Lottery ID: {lotteryData.lotteryId}</p>
            <p className="text-lg font-roboto text-basic">Contract: {formatAddress(lotteryData.deployedToContract)}</p>
            <p className="text-lg font-roboto text-basic">Total Tickets: {totalTickets ?? "Loading..."}</p>
            <p className="text-lg font-roboto text-basic">Remaining Tickets: {ticketsRemaining ?? "Loading..."}</p>
            <p className="text-lg font-roboto text-basic">Ticket Price: {ticketPrice ?? "Loading..."} ETH</p>
            <p className="text-lg font-roboto text-basic">Current Jackpot: {prizePool ?? "Loading..."} ETH</p>
            <BuyTicketsBtn contractAddress={lotteryData.deployedToContract} ticketPrice={ticketPrice} />
          </>
        ) : (
          <p className="text-lg font-roboto text-basic">Fetching lottery data...</p>
        )}
      </CardContent>
    </Card>
  );
}
