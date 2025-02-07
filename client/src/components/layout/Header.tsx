import MetaMaskConnect from "./MetaMaskConnect";
import Logo from "./Logo"; // Adjust the import path as needed

function Header() {
  return (
    <div className="flex justify-between items-center w-screen h-[100px] bg-primary">
      <Logo />
      <MetaMaskConnect />
    </div>
  );
}

export default Header;
