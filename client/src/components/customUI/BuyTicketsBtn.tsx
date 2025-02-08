import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI

const lotteryABI = lotteryAbi.abi;

export default function BuyTicketsBtn({ contractAddress, ticketPrice }:{contractAddress: string; ticketPrice: string}) {
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBuyTickets = async () => {
    if (!window.ethereum) {
      alert("Metamask is required to buy tickets");
      return;
    }

    try {
      setLoading(true);

      // Request account access if not already connected
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        alert("Please connect your MetaMask wallet.");
        return;
      }

      // Set up the Ethereum provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, lotteryABI, signer);

      // Calculate total price: ticketPrice * amount
      const totalPrice = ethers.parseEther((parseFloat(ticketPrice) * amount).toString());

      // Check if the contract function exists and call it
      if (contract && contract.buyTicket) {
        console.log(`Attempting to buy ${amount} tickets for ${totalPrice.toString()}...`);
        const tx = await contract.buyTicket(amount, { value: totalPrice });
        await tx.wait();
        console.log("Transaction successful with hash:", tx.hash);
        alert("Purchase successful!");
        window.location.href = "/";
      } else {
        console.error("Contract method not available.");
        alert("Purchase failed. Contract method unavailable.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Purchase failed");
    } finally {
      setLoading(false);
      window.location
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full bg-blue-500/80 rounded-md text-white hover:bg-blue-600/80">
          Buy Tickets Now
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-primary text-basic" aria-describedby="dialog for purchasing lottery tickets">
        <DialogHeader>
          <DialogTitle>Buy Tickets</DialogTitle>
        </DialogHeader>
        <p>Ticket Price: {ticketPrice ?? "Loading..."} ETH per ticket</p>
        <p>Enter amount of tickets to buy:</p>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 w-full"
        />
        <Button onClick={handleBuyTickets} disabled={loading} className="bg-green-500/80 text-white hover:bg-green-600/80 rounded-md">
          {loading ? "Processing..." : "Confirm Purchase"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
