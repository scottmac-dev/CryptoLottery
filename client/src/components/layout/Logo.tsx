import { GiTakeMyMoney } from "react-icons/gi";

function Logo() {
  return (
    <div className="flex justify-center items-center gap-3 ml-5">
      <GiTakeMyMoney className="md:w-[60px] md:h-[60px] w-[40px] h-[40px] text-white"/>
      <p className="font-tech text-white text-2xl md:text-4xl">Crypto Lottery</p>
    </div>
  )
}
export default Logo
