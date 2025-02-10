import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

function InfoAccordion() {
  return (
    <div className='flex w-3/4 md:w-1/2'>
        <Accordion type="single" collapsible className="w-full text-basic font-roboto">
            <AccordionItem value="item-1">
                <AccordionTrigger className='text-lg'>How does it work?</AccordionTrigger>
                <AccordionContent>
                    <ol className="list-decimal pl-5">
                        <li className='mt-1'>Connect your MetaMask wallet with Sepolia ETH funds</li>
                        <li className='mt-1'>Click buy tickets button to open dialog</li>
                        <li className='mt-1'>Select amount of tickets to buy</li>
                        <li className='mt-1'>Click confirm purchase and sign transaction with MetaMask</li>
                        <li className='mt-1'>If transaction is confirmed, ETH will be deducted and your account will be credited ERC20 ticket tokens for the next draw</li>
                        <li className='mt-1'>Once all tickets are sold a random ticket number will be generated</li>
                        <li className='mt-1'>The owner of the winning ERC20 ticket will be sent 95% of the jackpot pool, 5% is allocated as a admin fee to cover contract gas fees</li>
                        <li className='mt-1'>A new lottery contract is created and the process is repeated</li>
                    </ol>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger className='text-lg'>What are the requirements?</AccordionTrigger>
                <AccordionContent>
                    There are 2 pre-requisites for participating in the lottery.
                    <ol className="list-decimal pl-5 mt-2">
                        <li className='mt-1'>User has a active MetaMask wallet and browser extension</li>
                        <li className='mt-1'>User has enough Sepolia ETH to cover ticket cost and gas fees</li>
                    </ol>
                    <p className='mt-5'>Here are some resource links</p>
                    <p className='mt-2'>Setting up MetaMask wallet- <a className='text-blue-500 hover:text-purple-500' href='https://support.metamask.io/start/getting-started-with-metamask/' target='_blank'>Find out more</a></p>
                    <p className='mt-2'>Connect to Sepolia test network- <a className='text-blue-500 hover:text-purple-500' href='https://www.alchemy.com/overviews/how-to-add-sepolia-to-metamask' target='_blank'>Find out more</a></p>
                    <p className='mt-2'>Get 0.05 free Sepolia ETH- <a className='text-blue-500 hover:text-purple-500' href='https://cloud.google.com/application/web3/faucet/ethereum/sepolia' target='_blank'>Find out more</a> </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger className='text-lg'>Does this use real crypto currency?</AccordionTrigger>
                <AccordionContent>
                    <p>No, this application uses Sepolia ETH which is testing currency on the Sepolia Ethereum network.</p>
                    <p className='mt-2'>It does not require any real money and free test ETH can be aquired.  *See above drop-down</p>

                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger className='text-lg'>How are the chances of winning calculated?</AccordionTrigger>
                <AccordionContent>
                    <p>The chances of winning displayed on your wallet details card are calculated using the following formula.</p>
                    <p className='mt-2'>ticketsOwned / totalTicketSupply * 100</p>
                    <p className='mt-2'>Each ticket has an equal chance of winning as ticket numbers are randomly generated.</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger className='text-lg'>Are all lotteries the same?</AccordionTrigger>
                <AccordionContent >
                    <p>No, not all lotteries are the same, some may have a larger ticket supply and ticket price can vary.</p>
                    <p className='mt-2'>These are the only changing variables, the lottery contract and method for distributing jackpot funds remains the same.</p>
                    <p className='mt-2'>Current lottery details are displayed in the Next Lottery details card</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
                <AccordionTrigger className='text-lg'>How are tickets randomly chosen?</AccordionTrigger>
                <AccordionContent >
                    <p>Each ticket is a ERC20 token which is unique to the lottery in which it was purchased.</p>
                    <p className='mt-2'>Each ticket token has a unique ticketId and is mapped to the owners address in the contract.</p>
                    <p className='mt-2'>Ticket Ids are sequential, meaning if you bought the first 3 tickets, you would have ticketId 1, 2 and 3.</p>
                    <p className='mt-2'>When all tickets are purchased, the admin runs a script which generates a random number between 1-ticketSupply.</p>
                    <p className='mt-2'>If this number corresponds to your ticketId, you will be the winner of the lottery and receive 95% of the jackpot pool.</p>
                    <p className='mt-2'>The formula used in random generation is the following.</p>
                    <p className='mt-2'>Math.floor(Number(maxTicketSupply1) * Math.random()) + 1.</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
                <AccordionTrigger className='text-lg'>Can tickets be re-used?</AccordionTrigger>
                <AccordionContent >
                    <p>No, ticket tokens are unique to the lottery they are purchased in.</p>
                    <p className='mt-2'>Once that lottery is drawn, your ticket tokens are in-valid and will not be included in following lotteries.</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  )
}

export default InfoAccordion
