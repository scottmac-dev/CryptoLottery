const{ethers} = require("hardhat");

async function main(){

    console.log("Deploying contract....")

    // Get contracts for deployment
    const LotteryFactory = await ethers.getContractFactory("LotteryFactory");

    // Init contact and deploy, await deployment success, log
    const lotteryFactory = await LotteryFactory.deploy({gasLimit: 3000000});
    await lotteryFactory.waitForDeployment()
    console.log("LotteryFactory deployed to ", lotteryFactory.target);

}

// Call main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });