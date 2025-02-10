import { useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button"; // Adjust import path as needed
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner"; // Import Sonner toast notifications


declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MetaMaskConnect() {
  const { account, setAccount } = useWallet();

  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
        }
      }
    }
    checkConnection();
  }, [setAccount]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is required, Please connect wallet.", {
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      toast.success("Connetion Successful! 🎉", {
        description: `Connected to wallet: ${address}`,
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });
    } catch (error) {
      console.error("Connection failed ❌:",{
        decription: error,
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });
    }
  };

  return (
    <div className="mr-10">
      <Button
        onClick={connectWallet}
        className={account ? "bg-green-600 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}
      >
        {account ? "Connected" : "Connect Wallet"}
      </Button>
    </div>
  );
}
