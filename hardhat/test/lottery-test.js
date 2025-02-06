const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect, assert } = require("chai");
const {ethers} = require("hardhat");

describe("Lottery Contract Testing", function () {
  async function deployLotteryFixture() {

    // Contracts are deployed using the first signer/account by default
    const signers = await ethers.getSigners();
    const owner = signers[0];
    const ticketPrice = ethers.parseEther("0.1"); // Convert 0.1 Ether to wei

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(1000, 1, ticketPrice, owner.address);
    await lottery.waitForDeployment()



    console.log("Lottery contract deployed to ", lottery.target)
    console.log("Owners address should be ", owner.address)

    return { signers, lottery, owner };
  }

  describe("Function tests", function () {
    it("Should have a supply of 1000 tickets after deployment", async function () {
      const { lottery } = await loadFixture(deployLotteryFixture);
      let tickets = await lottery.getRemainingTickets();
      assert(tickets == 1000);
    });

    it("Should set the right owner", async function () {
      const { lottery, owner } = await loadFixture(deployLotteryFixture);
      let ownerAddress = await lottery.getOwnerAddress();
      assert(ownerAddress == owner.address);
    });

    it("Should have a balance of 1000 ticket tokens", async function () {
      const {lottery} = await loadFixture(deployLotteryFixture);
      let tokenBalance = await lottery.getContractTokenBalance();
      assert(tokenBalance == 1000);
    });

    it("Should allow a external user to buy ticket tokens", async function () {
      const { signers, lottery} = await loadFixture(deployLotteryFixture);
      const buyer1 = signers[1];
      const buyer2 = signers[2];
      const amountToBuy1 = 1;
      const amountToBuy2 = 5;
       // Buyers purchases tickets
       console.log("Buyer 1 purchasing 1 tickets....")
       const tx = await lottery.connect(buyer1).buyTicket(amountToBuy1, { value: ethers.parseEther("0.1") });
       await tx.wait(); // Wait for the transaction to be mined

       console.log("Buyer 2 purchasing 5 tickets....")
       const tx2 = await lottery.connect(buyer2).buyTicket(amountToBuy2, { value: ethers.parseEther("0.5") });
       await tx2.wait(); // Wait for the transaction to be mined

       console.log("Checking updated balances....");
      let tokenBalance = await lottery.getContractTokenBalance();
      assert(tokenBalance == (1000 - amountToBuy1 - amountToBuy2));
      let buyer1Tickets = await lottery.getAddressTicketAmount(buyer1.address);
      assert(buyer1Tickets == amountToBuy1);
      let buyer2Tickets = await lottery.getAddressTicketAmount(buyer2.address);
      assert(buyer2Tickets == amountToBuy2);
      let buyer1Tokens = await lottery.getERC20Balance(buyer1.address);
      assert(buyer1Tokens == amountToBuy1);
      let buyer2Tokens = await lottery.getERC20Balance(buyer2.address);
      assert(buyer2Tokens == amountToBuy2);

      console.log("Checking lottery contract ETH balance");
      let contractBalance = await lottery.getContractETHBalance();
      const formattedBal = ethers.formatEther(contractBalance);
      assert(formattedBal == "0.6");
    });

    it("Should revert for edge cases and security violations", async function () {
      const { signers, lottery, owner} = await loadFixture(deployLotteryFixture);
      const buyer1 = signers[1];
      const buyer2 = signers[2];
      const amountToBuy1 = 1001;
      const amountToBuy2 = 500;
      
      // Attempt to large a purchase
      console.log("Buyer 1 attempting to purchase 1001 tickets....")
      try {
        const tx = await lottery.connect(buyer1).buyTicket(amountToBuy1, { value: ethers.parseEther("100.1") });
        await tx.wait(); // Wait for the transaction to be mined
        assert.fail("Transaction should have reverted but it didn't");
      } catch (error) {
        // Assert that the error is due to insufficient tickets
        assert(error.message.includes("revert"), "Expected revert error not received");
      }

      // First generate random ticket num between 1 and maxTicketSupply
      const maxTicketSupply = await lottery.getTicketSupply();
      const randomTicketNumber = Math.floor(Number(maxTicketSupply) * Math.random()) + 1;
      console.log("Random ticket number ",randomTicketNumber);

      // Call pick winner before all tickets sold
       console.log("Attempting to pick winner before all tickets sold...");
       try {
        const tx = await lottery.connect(buyer1).pickWinner(randomTicketNumber);
        await tx.wait(); // Wait for the transaction to be mined
        assert.fail("Transaction should have reverted but it didn't");
      } catch (error) {
        // Assert that the error is due to insufficient tickets
        assert(error.message.includes("revert"), "Expected revert error not received");
      }

      // Buy all tickets
      console.log("Buyer 1 purchasing 500 tickets....")
      const tx2 = await lottery.connect(buyer1).buyTicket(amountToBuy2, { value: ethers.parseEther("50") });
      await tx2.wait(); // Wait for the transaction to be mined
      console.log("Buyer 2 purchasing 500 tickets....")
      const tx3 = await lottery.connect(buyer2).buyTicket(amountToBuy2, { value: ethers.parseEther("50") });
      await tx3.wait(); // Wait for the transaction to be mined

      console.log("Attempting to call pick winner from non-owner account...");
      try {
       const tx = await lottery.connect(buyer2).pickWinner(randomTicketNumber);
       await tx.wait(); // Wait for the transaction to be mined
       assert.fail("Transaction should have reverted but it didn't");
     } catch (error) {
       // Assert that the error is due to insufficient tickets
       assert(error.message.includes("revert"), "Expected revert error not received");
     }

      console.log("Checking updated balances....");
      let tokenBalance = await lottery.getContractTokenBalance();
      assert(tokenBalance == 0);
      let buyer1Tickets = await lottery.getAddressTicketAmount(buyer1.address);
      assert(buyer1Tickets == amountToBuy2);
      let buyer2Tickets = await lottery.getAddressTicketAmount(buyer2.address);
      assert(buyer2Tickets == amountToBuy2);
      let buyer1Tokens = await lottery.getERC20Balance(buyer1.address);
      assert(buyer1Tokens == amountToBuy2);
      let buyer2Tokens = await lottery.getERC20Balance(buyer2.address);
      assert(buyer2Tokens == amountToBuy2);

      console.log("Checking lottery contract ETH balance");
      let contractBalance = await lottery.getContractETHBalance();
      const formattedBal = ethers.formatEther(contractBalance);
      assert(formattedBal == "100.0");

      // const ticketTestCase = 501;
      // const returnedAddress = await lottery.returnTicketOwner(ticketTestCase);
      // console.log(returnedAddress);
      // console.log(buyer2.address);

    console.log("Owner attempting to pick a winner...");
     // Call pickWinner and capture the transaction response
     const winnerData = await lottery.connect(owner).pickWinner(randomTicketNumber);
     const winnerAddress = winnerData[0]; // Extracting the winner's address
     const ticketNumber = winnerData[1]; // Extracting the ticket number
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
      // // Assert that the winner is either buyer1 or buyer2
      // assert([buyer1.address, buyer2.address].includes(winnerAddress), "Winner is not one of the buyers");
    }); 
  });
});

describe("Testing with more buyers", function () {
  async function deployLotteryFixture2() {

    // Contracts are deployed using the first signer/account by default
    const signers = await ethers.getSigners();
    const owner = signers[0];
    const ticketPrice = ethers.parseEther("0.1"); // Convert 0.1 Ether to wei


    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(10, 1, ticketPrice, owner.address);
    await lottery.waitForDeployment()

    console.log("Lottery contract deployed to ", lottery.target)
    console.log("Owners address should be ", owner.address)

    return { signers, lottery, owner };
  }

  describe("Function tests", function () {
    it("Should have a supply of 10 tickets after deployment", async function () {
      const { lottery } = await loadFixture(deployLotteryFixture2);
      let tickets = await lottery.getRemainingTickets();
      assert(tickets == 10);
    });
    it("Should allow many external user to buy ticket tokens", async function () {
      const { signers, lottery, owner} = await loadFixture(deployLotteryFixture2);
      const buyer1 = signers[1];
      const buyer2 = signers[2];
      const buyer3 = signers[3];
      const buyer4 = signers[4];
      const buyer5 = signers[5];

      const amountToBuy2 = 2;
       // Buyers purchases tickets
       console.log("Buyer 1 purchasing 2 tickets....")
       const tx = await lottery.connect(buyer1).buyTicket(amountToBuy2, { value: ethers.parseEther("0.2") });
       await tx.wait(); // Wait for the transaction to be mined

       console.log("Buyer 2 purchasing 2 tickets....")
       const tx2 = await lottery.connect(buyer2).buyTicket(amountToBuy2, { value: ethers.parseEther("0.2") });
       await tx2.wait(); // Wait for the transaction to be mined

       console.log("Buyer 3 purchasing 2 tickets....")
       const tx3 = await lottery.connect(buyer3).buyTicket(amountToBuy2, { value: ethers.parseEther("0.2") });
       await tx3.wait(); // Wait for the transaction to be mined

       console.log("Buyer 4 purchasing 2 tickets....")
       const tx4 = await lottery.connect(buyer4).buyTicket(amountToBuy2, { value: ethers.parseEther("0.2") });
       await tx4.wait(); // Wait for the transaction to be mined

       console.log("Buyer 5 purchasing 2 tickets....")
       const tx5 = await lottery.connect(buyer5).buyTicket(amountToBuy2, { value: ethers.parseEther("0.2") });
       await tx5.wait(); // Wait for the transaction to be mined

       console.log("Checking updated balances....");

      let tokenBalance = await lottery.getContractTokenBalance();
      assert(tokenBalance == 0);

      let buyer1Tickets = await lottery.getAddressTicketAmount(buyer1.address);
      assert(buyer1Tickets == amountToBuy2);
      let buyer2Tickets = await lottery.getAddressTicketAmount(buyer2.address);
      assert(buyer2Tickets == amountToBuy2);
      let buyer3Tickets = await lottery.getAddressTicketAmount(buyer3.address);
      assert(buyer3Tickets == amountToBuy2);


      let buyer1Tokens = await lottery.getERC20Balance(buyer1.address);
      assert(buyer1Tokens == amountToBuy2);
      let buyer2Tokens = await lottery.getERC20Balance(buyer2.address);
      assert(buyer2Tokens == amountToBuy2);
      let buyer3Tokens = await lottery.getERC20Balance(buyer3.address);
      assert(buyer3Tokens == amountToBuy2);
      

      console.log("Checking lottery contract ETH balance");
      let contractBalance = await lottery.getContractETHBalance();
      const formattedBal = ethers.formatEther(contractBalance);
      assert(formattedBal == "1.0");

      console.log("Owner attempting to pick a winner...");
      // First generate random ticket num between 1 and maxTicketSupply
      const maxTicketSupply = await lottery.getTicketSupply();
      const randomTicketNumber = Math.floor(Number(maxTicketSupply) * Math.random()) + 1;
      console.log("Random ticket number ",randomTicketNumber);
      // Call pickWinner and capture the transaction response
      const winnerData = await lottery.connect(owner).pickWinner(randomTicketNumber);
      const winnerAddress = winnerData[0]; // Extracting the winner's address
      const ticketNumber = winnerData[1]; // Extracting the ticket number
     //  console.log("Winner address ",winnerAddress, "Ticket Num", Number(ticketNumber) );
  
       if(winnerAddress == buyer1.address){
         console.log("Winning ticket ", Number(ticketNumber))
         console.log("Winner address is buyer1: ", winnerAddress);
       }
       else if (winnerAddress == buyer2.address) {
         console.log("Winning ticket ", Number(ticketNumber))
         console.log("Winner address is buyer 2: ", winnerAddress);
       }
       else if (winnerAddress == buyer3.address) {
        console.log("Winning ticket ", Number(ticketNumber))
        console.log("Winner address is buyer 3: ", winnerAddress);
      }
      else if (winnerAddress == buyer4.address) {
        console.log("Winning ticket ", Number(ticketNumber))
        console.log("Winner address is buyer 4: ", winnerAddress);
      }
      else if (winnerAddress == buyer5.address) {
        console.log("Winning ticket ", Number(ticketNumber))
        console.log("Winner address is buyer 5: ", winnerAddress);
      }
       else {
         console.log("Winning ticket ", Number(ticketNumber))
         console.log("Winner address is none of the buyer: ", winnerAddress);
       }
    });
  });
});


