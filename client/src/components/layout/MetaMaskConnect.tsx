import { useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button"; // Adjust import path as needed
import { useWallet } from "@/context/WalletContext";

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
      alert("MetaMask is not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } catch (error) {
      console.error("Connection failed", error);
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
