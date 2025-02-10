import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex justify-center items-center gap-4 p-4 h-[60px] bg-primary text-white text-sm">
      <a 
        href="https://github.com/scottDev25" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:opacity-80 transition"
      >
        <FaGithub size={18} />
        <span>Developed by scottDev25</span>
      </a>
      <span className="mx-2">|</span>
      <a 
        href="https://github.com/scottDev25/CryptoLottery" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:underline hover:opacity-80 transition"
      >
        ⭐ Star the GitHub Repo!
      </a>
    </footer>
  );
}
