import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner"; 
import lotteryAbi from "../../utils/Lottery.json"; 

const lotteryABI = lotteryAbi.abi;

export default function BuyTicketsBtn({ contractAddress, ticketPrice }: { contractAddress: string; ticketPrice: string }) {
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ticketsRemaining, setTicketsRemaining] = useState<number | null>(null);

  // Fetch remaining tickets when component mounts
  useEffect(() => {
    const fetchTickets = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, lotteryABI, provider);
        const _remaining = await contract.getRemainingTickets();
        setTicketsRemaining(Number(_remaining));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [contractAddress]);

  const handleBuyTickets = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is required, Please connect wallet.", {
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });
      return;
    }

    try {
      setLoading(true);
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        toast.error("MetaMask is required, Please connect wallet.", {
          className: "bg-primary text-white shadow-md p-4 rounded-lg",
        });        
        return;
      }

      // Set up provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, lotteryABI, signer);

      // Calculate total price: ticketPrice * amount
      const totalPrice = ethers.parseEther((parseFloat(ticketPrice) * amount).toString());

      if (contract && contract.buyTicket) {
        toast.loading(`Buying ${amount} tickets for ${ethers.formatEther(totalPrice)} ETH...`);

        const tx = await contract.buyTicket(amount, { value: totalPrice });
        await tx.wait();

        toast.success("Purchase Successful! 🎉", {
          description: `Transaction Hash: ${tx.hash}`,
          className: "bg-primary text-white shadow-md p-4 rounded-lg",
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 3000); 

      } else {
        toast.error("Contract method unavailable. Purchase failed ❌.",{
          className: "bg-primary text-white shadow-md p-4 rounded-lg",
        });
      }
    } catch (error) {
      console.error("Transaction failed ❌:", error,{
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });
      toast.error("Purchase failed ❌. Check console for details.",{
        className: "bg-primary text-white shadow-md p-4 rounded-lg",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="mt-4 w-full bg-blue-500/80 rounded-md text-white hover:bg-blue-600/80"
          disabled={ticketsRemaining === 0} // Disable button if tickets are exhausted
        >
          {ticketsRemaining === 0 ? "Allocation Exhausted" : "Buy Tickets Now"}
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
        <Button onClick={handleBuyTickets} disabled={loading || ticketsRemaining === 0} className="bg-green-500/80 text-white hover:bg-green-600/80 rounded-md">
          {loading ? "Processing..." : "Confirm Purchase"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
