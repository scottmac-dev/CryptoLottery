import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useWallet } from "@/context/WalletContext";
import { ethers } from "ethers";
import lotteryFactoryAbi from "../../utils/LotteryFactory.json"; // Factory ABI
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI

const LOTTERYFACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_LOTTERY_FACTORY_ADDRESS;

const alchemy = new Alchemy({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
});

export default function AccountCard() {
  const { account } = useWallet(); // Get account from context
  const [balance, setBalance] = useState<string | null>(null);
  const [currentTickets, setCurrentTickets] = useState<number | null>(null);
  const [totalTickets, setTotalTickets] = useState<number | null>(null);
  const [winChance, setWinChance] = useState<number | null>(null);

  useEffect(() => {
    if (!account) return;

    const fetchBalance = async () => {
      try {
        const balanceWei = await alchemy.core.getBalance(account, "latest");
        const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
        setBalance(balanceEth.toFixed(4));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("Error");
      }
    };

    fetchBalance();
  }, [account]);

  useEffect(() => {
    if (!account) return;
  
    const fetchTickets = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL);
        const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);
  
        const returnedId = await contract.getLotteryCount();
        const lotteryId = Number(returnedId);
  
        const lotteryInfo = await contract.getLotteryById(lotteryId);
        const deployedAddress = lotteryInfo.deployedToContract;
  
        const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);
        let ticketsOwnedByAccount = await lotteryContract.getAddressTicketAmount(account);
        let totalSupply = await lotteryContract.getTicketSupply();
  
        // Ensure values default to 0 if undefined or null
        ticketsOwnedByAccount = Number(ticketsOwnedByAccount) || 0;
        totalSupply = Number(totalSupply) || 0;
  
        setCurrentTickets(ticketsOwnedByAccount);
        setTotalTickets(totalSupply);
  
        calculateWinChance(ticketsOwnedByAccount, totalSupply);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        
        // If there's an error, ensure it doesn't remain in "Loading..."
        setCurrentTickets(0);
        setTotalTickets(0);
        setWinChance(0);
      }
    };
  
    fetchTickets();
  }, [account]);

  // Separate function to calculate the win chance
  const calculateWinChance = (ticketsOwnedByAccount: number, totalSupply: number) => {
    if (totalSupply > 0) {
      const _winChance = ((ticketsOwnedByAccount / totalSupply) * 100).toFixed(2);
      setWinChance(parseFloat(_winChance));
    } else {
      setWinChance(0); // If total supply is 0, set win chance to 0%
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <Card className="w-96 bg-primary/95 shadow-blue-500 shadow-xl mt-5">
      <CardHeader>
        <CardTitle className="font-tech text-2xl text-blue-500 ">Wallet Details</CardTitle>
      </CardHeader>
      <CardContent>
        {account ? (
          <>
            <p className="text-lg font-roboto text-basic">Address: {formatAddress(account)}</p>
            <p className="text-lg font-roboto text-basic">Balance: {balance ?? "Loading..."} ETH</p>
            <p className="text-lg font-roboto text-basic">Tickets in Next Draw: {currentTickets ?? "Loading..."}</p>
            <p className="text-lg font-roboto text-basic">
              Chance of winning: {winChance !== null ? `${winChance}%` : "Loading..."}
            </p>

            <p className="p-2 bg-green-600/40 font-roboto rounded-md text-basic mt-3 font-medium">Status: Connected</p>
          </>
        ) : (
          <p className="p-2 bg-red-600/40 font-roboto rounded-md text-basic mt-3 font-medium">Status: Please connect wallet</p>
        )}
      </CardContent>
    </Card>
  );
}
