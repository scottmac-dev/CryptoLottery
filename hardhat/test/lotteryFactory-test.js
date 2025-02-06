const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect, assert } = require("chai");
  const {ethers} = require("hardhat");
  const {hre} = require("hardhat")
  
  describe("Lottery Contract Testing", function () {
    async function deployLotteryFactoryFixture() {
  
      // Contracts are deployed using the first signer/account by default
      const signers = await ethers.getSigners();
      const owner = signers[0];
  
      const LotteryFactory = await ethers.getContractFactory("LotteryFactory");
      const lotteryFactory = await LotteryFactory.deploy();
      await lotteryFactory.waitForDeployment()
  
  
  
      console.log("Lottery Factory contract deployed to ", lotteryFactory.target)
      console.log("Owners address should be ", owner.address)
  
      return { signers, lotteryFactory, owner };
    }
  
    describe("Function tests", function () {
      it("Should deploy a new factory lottery contract", async function () {
        const { lotteryFactory } = await loadFixture(deployLotteryFactoryFixture);
        let lotteryCount = await lotteryFactory.getLotteryCount();
        assert(lotteryCount == 0);
      });
  
      it("Should set the right owner", async function () {
        const { lotteryFactory, owner } = await loadFixture(deployLotteryFactoryFixture);
        let ownerAddress = await lotteryFactory.getOwnerAddress();
        assert(ownerAddress == owner.address);
      });
  
      it("Should allow the creation of a new lottery with specific variables", async function () {
        const {lotteryFactory} = await loadFixture(deployLotteryFactoryFixture);
        const ticketPrice1 = ethers.parseEther("0.1");
        const ticketPrice2 = ethers.parseEther("0.5");
        const ticketSupply1 = 100;
        const ticketSupply2 = 10;

        await lotteryFactory.createNewLottery(ticketSupply1, ticketPrice1);
        await lotteryFactory.createNewLottery(ticketSupply2, ticketPrice2);
        
        const lottery1Struct = await lotteryFactory.getLotteryById(1);
        const lottery1Addr = lottery1Struct[1];
        const lottery2Struct = await lotteryFactory.getLotteryById(2);
        const lottery2Addr = lottery2Struct[1];
        console.log(lottery1Struct);
        console.log(lottery1Addr);
        console.log(lottery2Struct);
        console.log(lottery2Addr);

        const lottery1Contract = await ethers.getContractAt("Lottery", lottery1Addr);
        const lottery2Contract = await ethers.getContractAt("Lottery", lottery2Addr);

        // Now you can interact with the lottery1Contract and lottery2Contract
        const ticketSupply1FromContract = await lottery1Contract.getTicketSupply();
        const ticketSupply2FromContract = await lottery2Contract.getTicketSupply();

        const ticketPrice1FromContract = await lottery1Contract.getTicketPrice();
        const ticketPrice2FromContract = await lottery2Contract.getTicketPrice();
        // const formatPrice1 = ethers.formatEther(ticketPrice1FromContract);
        // const formatPrice2 = ethers.formatEther(ticketPrice2FromContract);

        assert(ticketSupply1FromContract == ticketSupply1);
        assert(ticketSupply2FromContract == ticketSupply2);

        assert(ticketPrice1FromContract == ticketPrice1);
        assert(ticketPrice2FromContract == ticketPrice2);
      });

      it("Should allow users to interact with deployed lotteries", async function () {
        const {lotteryFactory, signers, owner} = await loadFixture(deployLotteryFactoryFixture);
        const ticketPrice1 = ethers.parseEther("0.1");
        const ticketPrice2 = ethers.parseEther("0.5");
        const ticketSupply1 = 100;
        const ticketSupply2 = 10;

        await lotteryFactory.createNewLottery(ticketSupply1, ticketPrice1);
        await lotteryFactory.createNewLottery(ticketSupply2, ticketPrice2);
        
        const lottery1Struct = await lotteryFactory.getLotteryById(1);
        const lottery1Addr = lottery1Struct[1];
        const lottery2Struct = await lotteryFactory.getLotteryById(2);
        const lottery2Addr = lottery2Struct[1];

        const lottery1Contract = await ethers.getContractAt("Lottery", lottery1Addr);
        const lottery2Contract = await ethers.getContractAt("Lottery", lottery2Addr);

        // Buyers to interact
        const buyer1 = signers[1];
        const buyer2 = signers[2];
        const buyer3 = signers[3];
        const amountToBuy1 = 20;
        const amountToBuy2 = 80;
        const amountToBuy3 = 10;

         // Buyers purchases tickets
         console.log("Buyer 1 purchasing 20 tickets....")
         const tx = await lottery1Contract.connect(buyer1).buyTicket(amountToBuy1, { value: ethers.parseEther("2.0") });
         await tx.wait(); // Wait for the transaction to be mined
  
         console.log("Buyer 2 purchasing 80 tickets....")
         const tx2 = await lottery1Contract.connect(buyer2).buyTicket(amountToBuy2, { value: ethers.parseEther("8.0") });
         await tx2.wait(); // Wait for the transaction to be mined

         console.log("Buyer 2 purchasing 10 tickets....")
         const tx3 = await lottery2Contract.connect(buyer3).buyTicket(amountToBuy3, { value: ethers.parseEther("5.0") });
         await tx3.wait(); // Wait for the transaction to be mined
  
         console.log("Checking updated balances....");
        let tokenBalance = await lottery1Contract.getContractTokenBalance();
        assert(tokenBalance == 0);
        let buyer1Tickets = await lottery1Contract.getAddressTicketAmount(buyer1.address);
        assert(buyer1Tickets == amountToBuy1);
        let buyer2Tickets = await lottery1Contract.getAddressTicketAmount(buyer2.address);
        assert(buyer2Tickets == amountToBuy2);
        let buyer1Tokens = await lottery1Contract.getERC20Balance(buyer1.address);
        assert(buyer1Tokens == amountToBuy1);
        let buyer2Tokens = await lottery1Contract.getERC20Balance(buyer2.address);
        assert(buyer2Tokens == amountToBuy2);

        let tokenBalance2 = await lottery2Contract.getContractTokenBalance();
        assert(tokenBalance2 == 0);
        let buyer3Tickets = await lottery2Contract.getAddressTicketAmount(buyer3.address);
        assert(buyer3Tickets == amountToBuy3);
        let buyer3Tokens = await lottery2Contract.getERC20Balance(buyer3.address);
        assert(buyer3Tokens == amountToBuy3);


        console.log("Checking lottery contract ETH balance");
        let contractBalance = await lottery1Contract.getContractETHBalance();
        const formattedBal = ethers.formatEther(contractBalance);
        assert(formattedBal == "10.0");
        let contractBalance2 = await lottery2Contract.getContractETHBalance();
        const formattedBal2 = ethers.formatEther(contractBalance2);
        assert(formattedBal2 == "5.0");

        console.log("Calling pick winner funtion with owner acc...")
         // First generate random ticket num between 1 and maxTicketSupply
        const maxTicketSupply1 = await lottery1Contract.getTicketSupply();
        const randomTicketNumber1 = Math.floor(Number(maxTicketSupply1) * Math.random()) + 1;
        console.log("Random ticket number lottery 1 ",randomTicketNumber1);

        const maxTicketSupply2 = await lottery1Contract.getTicketSupply();
        const randomTicketNumber2 = Math.floor(Number(maxTicketSupply2) * Math.random()) + 1;
        console.log("Random ticket number lottery 2 ",randomTicketNumber2);

        let contract1OwnerAddr = await lottery1Contract.getOwnerAddress();
        let contract2OwnerAddr = await lottery2Contract.getOwnerAddress();

        // Note: lottery contract instance owner is the lottery factory not the owner EOA
        console.log("LotteryFactory Owner address: ", owner.address);
        console.log("Lottery factory address ", lotteryFactory.target);
        console.log("Lottery 1 owner address", contract1OwnerAddr);
        console.log("Lottery 2 owner address", contract2OwnerAddr);

        //  Call pickWinner and capture the transaction response
        const winnerData1 = await lottery1Contract.connect(owner).pickWinner(randomTicketNumber1);
        const winnerAddress = winnerData1[0]; // Extracting the winner's address
        const ticketNumber = winnerData1[1]; // Extracting the ticket number
        //  console.log("Winner address ",winnerAddress, "Ticket Num", Number(ticketNumber) );
    
        if(winnerAddress == buyer1.address){
            console.log("Winning ticket ", Number(ticketNumber))
            console.log("Winner address is buyer1: ", winnerAddress);
        }
        else if (winnerAddress == buyer2.address) {
            console.log("Winning ticket ", Number(ticketNumber))
            console.log("Winner address is buyer 2: ", winnerAddress);
        }
        else {
            console.log("Winning ticket ", Number(ticketNumber))
            console.log("Winner address is neither buyer: ", winnerAddress);
        }

        console.log("Attempting to call pick winner from non-owner account...");
        try {
            const tx = await lottery2Contract.connect(buyer2).pickWinner(randomTicketNumber2);
            await tx.wait(); // Wait for the transaction to be mined
            assert.fail("Transaction should have reverted but it didn't");
        } catch (error) {
            // Assert that the error is due to insufficient tickets
            assert(error.message.includes("revert"), "Expected revert error not received");
        }
      });
      it("Should have the win state changed when winner picked", async function () {
        const {lotteryFactory, signers, owner} = await loadFixture(deployLotteryFactoryFixture);
        const ticketPrice1 = ethers.parseEther("0.1");
        const ticketSupply1 = 10;
        await lotteryFactory.createNewLottery(ticketSupply1, ticketPrice1);        
        const lottery1Struct = await lotteryFactory.getLotteryById(1);
        const lottery1Addr = lottery1Struct[1];

        console.log(lottery1Struct);
        console.log(lottery1Addr);

        const lottery1Contract = await ethers.getContractAt("Lottery", lottery1Addr);
        // Buyers to interact
        const buyer1 = signers[1];
        const amountToBuy1 = 10;
        // Buyers purchases tickets
        console.log("Buyer 1 purchasing all tickets....")
        const tx = await lottery1Contract.connect(buyer1).buyTicket(amountToBuy1, { value: ethers.parseEther("1.0") });
        await tx.wait(); // Wait for the transaction to be mined

        console.log("Calling pick winner funtion with owner acc...")
         // First generate random ticket num between 1 and maxTicketSupply
        const maxTicketSupply1 = await lottery1Contract.getTicketSupply();
        const randomTicketNumber1 = Math.floor(Number(maxTicketSupply1) * Math.random()) + 1;
        console.log("Random ticket number lottery 1 ",randomTicketNumber1);

         //  Call pickWinner and capture the transaction response
        const winnerData1 = await lottery1Contract.connect(owner).pickWinner(randomTicketNumber1);
        const winnerAddress = winnerData1[0]; // Extracting the winner's address
        const ticketNumber = winnerData1[1]; // Extracting the ticket number
        console.log("Winner address ",winnerAddress, "Ticket Num", Number(ticketNumber) );

        // Call winner function to emit event and change state
        let id = await lottery1Contract.getLotteryId();
        const confirmedStructBefore = await lotteryFactory.getLotteryById(id);
        await lottery1Contract.connect(owner).callWinner(winnerAddress, ticketNumber);
        const confirmedStructAfter = await lotteryFactory.getLotteryById(id);

        assert(confirmedStructBefore[2] == false);
        assert(confirmedStructAfter[2] == true);
      });
    });
  });
  