import { useWallet } from "@/context/WalletContext";
import AccountCard from "../customUI/AccountCard";
import LotteryStatsCard from "../customUI/LotteryStatsCard";

function Home() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col min-h-screen bg-basic items-center">
      {/* For small screens: flex-col, for md and above: flex-row */}
      <div className="flex flex-col md:flex-row items-center gap-5 mt-2">
        <AccountCard />
        <LotteryStatsCard />
      </div>
    </div>
  );
}

export default Home;
