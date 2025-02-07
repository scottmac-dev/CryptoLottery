import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { useWallet } from "@/context/WalletContext";



const alchemy = new Alchemy({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

export default function AccountCard() {
    const { account } = useWallet(); // Get account from context
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;

    const fetchBalance = async () => {
      try {
        const balanceWei = await alchemy.core.getBalance(account,"latest");
        console.log(balanceWei);
        const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
        setBalance(balanceEth.toFixed(4));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("Error");
      }
    };

    fetchBalance();
  }, [account]);

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        {account ? (
          <>
            <p className="text-lg font-semibold">Address: {formatAddress(account)}</p>
            <p className="text-lg">Balance: {balance ?? "Loading..."}</p>
            <p className="text-green-500 font-medium">Status: Connected</p>
          </>
        ) : (
          <p className="text-red-500 font-medium">Please connect wallet</p>
        )}
      </CardContent>
    </Card>
  );
}
