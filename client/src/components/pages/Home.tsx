import { useWallet } from "@/context/WalletContext";
import AccountCard from "../customUI/AccountCard";

function Home() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col min-h-screen bg-basic items-center">
      {account ? <p className="text-xl">Welcome, {account}</p> : <p className="text-xl">Please connect your wallet.</p>}
      <AccountCard />
    </div>
  );
}

export default Home;
