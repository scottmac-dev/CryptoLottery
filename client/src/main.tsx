import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WalletProvider } from './context/WalletContext.tsx'
import { Toaster } from "@/components/ui/sonner"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <App />
      <Toaster 
        position='bottom-right' 
        richColors
        duration={4000}
        closeButton
        gap={16}
        toastOptions={{
          className: "bg-primary text-white shadow-lg rounded-lg p-4 border border-gray-700",
        }}
      />
    </WalletProvider>
  </StrictMode>,
)
