import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useWallet } from "@/context/WalletContext";
import { ethers } from "ethers";
import lotteryFactoryAbi from "../../utils/LotteryFactory.json"; // Factory ABI
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI

const LOTTERYFACTORY_CONTRACT_ADDRESS = "0x57623Ee8e3C8C6AD78103dEcf5eb58A29176CF33";

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
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL); // Use Alchemy or Infura
        const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);

        // Get the latest lottery ID
        const returnedId = await contract.getLotteryCount();
        const lotteryId = Number(returnedId);

        // Get info about its deployment
        const lotteryInfo = await contract.getLotteryById(lotteryId);
        const deployedAddress = lotteryInfo.deployedToContract;

        // Step 3: Query deployed Lottery contract
        const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);
        const ticketsOwnedByAccount = await lotteryContract.getAddressTicketAmount(account);
        const totalSupply = await lotteryContract.getTicketSupply();

        // Update state with tickets data
        setCurrentTickets(Number(ticketsOwnedByAccount));
        setTotalTickets(Number(totalSupply));

        // Calculate win chance in a separate function after data is fetched
        calculateWinChance(Number(ticketsOwnedByAccount), Number(totalSupply));
      } catch (error) {
        console.error("Error fetching tickets:", error);
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
    <Card className="w-96 bg-primary/95 shadow-blue-500 shadow-lg">
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
