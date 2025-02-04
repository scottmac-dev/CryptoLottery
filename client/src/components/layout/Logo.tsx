import { GiTakeMyMoney } from "react-icons/gi";

function Logo() {
  return (
    <div className="flex justify-center items-center gap-3">
      <GiTakeMyMoney className="w-[60px] h-[60px] text-white"/>
      <p className="font-tech text-white text-4xl">Crypto Lottery</p>
    </div>
  )
}
export default Logo
