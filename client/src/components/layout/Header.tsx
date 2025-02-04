import React from 'react'
import Logo from './Logo'
import { Button } from '../ui/button'

function Header() {
  return (
    <div className='flex justify-between items-center w-screen h-[100px] bg-primary pl-5 pr-5'>
        <Logo/>
        <Button className='flex'>Connect Wallet</Button>
    </div>
  )
}

export default Header
