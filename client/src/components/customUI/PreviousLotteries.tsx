import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lotteryFactoryAbi from "../../utils/LotteryFactory.json"; // Factory ABI
import lotteryAbi from "../../utils/Lottery.json"; // Individual Lottery ABI
import { FaCopy, FaSpinner } from "react-icons/fa"; // Using react-icons for the loading spinner

const LOTTERYFACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_LOTTERY_FACTORY_ADDRESS; // Lottery Factory Contract Address

interface TicketHolder {
    address: string;
    ticketsHeld: number;
  }

const formatAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-4)}`;

export default function PreviousLotteries() {
  const [lotteryCount, setLotteryCount] = useState<number | null>(null);
  const [selectedLotteryId, setSelectedLotteryId] = useState<number>(1); // Default to 1 (first lottery)
  const [selectedLotteryData, setSelectedLotteryData] = useState<{ deployedToContract: string } | null>(null);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]); // Array of TicketHolder objects
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLotteryData = async () => {
      setLoading(true); // Set loading state

      try {
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL); // Use Alchemy or Infura
        const contract = new ethers.Contract(LOTTERYFACTORY_CONTRACT_ADDRESS, lotteryFactoryAbi.abi, provider);

        // Get the total count of lotteries (to set range for selection)
        const count = await contract.getLotteryCount();
        setLotteryCount(Number(count));

        // Query lottery data for the selected lottery ID
        const lotteryInfo = await contract.getLotteryById(selectedLotteryId);
        setSelectedLotteryData({
          deployedToContract: lotteryInfo.deployedToContract,
        });
        const deployedAddress = lotteryInfo.deployedToContract;
  
        const lotteryContract = new ethers.Contract(deployedAddress, lotteryAbi.abi, provider);

        // Fetch ticket holders' addresses
        const _ticketHolders = await lotteryContract.getAllTicketHolders();
        console.log(_ticketHolders);
        
        // Fetch the number of tickets held by each address
        const updatedTicketHolders: TicketHolder[] = [];
        for (let i = 0; i < _ticketHolders.length; i++) {
          const address = _ticketHolders[i];
          const ticketsHeld = await lotteryContract.getAddressTicketAmount(address);

          // Push the TicketHolder object into the updated list
          updatedTicketHolders.push({
            address,
            ticketsHeld: Number(ticketsHeld),
          });
        }

        // Update the ticketHolders state
        setTicketHolders(updatedTicketHolders);

      } catch (error) {
        console.error("Error fetching lottery data:", error);
      } finally {
        setLoading(false); // Set loading state to false when done
      }
    };

    fetchLotteryData();
  }, [selectedLotteryId]); // Re-fetch when the selected ID changes

  // Handle lottery selection change
  const handleLotterySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    setSelectedLotteryId(selectedId);
  };

// Copy address to clipboard
const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
        .catch((error) => {
        console.error('Failed to copy address:', error);
        });
    };

  return (
    <div className="flex flex-col mt-5 items-center mb-5 font-roboto">
        <h3 className="font-tech text-3xl text-blue-500">Previous Lotteries</h3>
        <p className="text-lg font-roboto text-primary mt-2 text-center max-w-2xl ml-3 mr-3">
          Use the selector below to find information about previous lotteries!
        </p>
      {lotteryCount ? (
        <div className="mt-2">
          <select
            value={selectedLotteryId}
            onChange={handleLotterySelect}
            className="w-full p-2 bg-white rounded-md mb-4"
          >
            {Array.from({ length: lotteryCount }, (_, i) => i + 1).map((id) => (
              <option key={id} value={id}>
                Lottery #{id}
              </option>
            ))}
          </select>

          {loading ? (
            <div className="flex justify-center items-center">
              <FaSpinner size={"50px"} className="text-blue-500" />
            </div>
          ) : selectedLotteryData ? (
          <div>
              {/* Contract Address with Copy Button */}
              <div className="mb-4">
                <p>
                  Contract Address:{" "}
                  <span className="text-blue-500">
                    {formatAddress(selectedLotteryData.deployedToContract)}
                  </span>{" "}
                  <button
                    onClick={() => copyToClipboard(selectedLotteryData.deployedToContract)}
                    className="ml-2 text-sm text-gray-500"
                    aria-label="Copy address"
                  >
                    <FaCopy />
                  </button>
                </p>
              </div>

              {/* Ticket Holders Table */}
              <h3 className="font-semibold">Ticket Holders Table:</h3>
              {ticketHolders.length > 0 ? (
                <table className="min-w-full table-auto mt-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Address</th>
                      <th className="px-4 py-2 border">Tickets Held</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketHolders.map((holder, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{formatAddress(holder.address)}</td>
                        <td className="px-4 py-2 border">{holder.ticketsHeld}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No ticket holders found.</p>
              )}
            </div>
          ) : (
            <p>Please select a lottery.</p>
          )}
        </div>
      ) : (
        <p>Loading lotteries...</p>
      )}
    </div>
  );
}
