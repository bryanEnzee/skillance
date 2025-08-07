const hre = require("hardhat");

async function deployLock() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Deploy the Lock contract
  const ContractFactory = await hre.ethers.getContractFactory("Lock");
  const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
  const contract = await ContractFactory.deploy(unlockTime, { value: hre.ethers.utils.parseEther("0.1") });
  await contract.deployed();

  console.log("Lock contract deployed at:", contract.address);
  return contract.address;
}

async function deployFreelanceJobs() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Deploy the FreelanceJobs contract
  const ContractFactory = await hre.ethers.getContractFactory("FreelanceJobs");
  const contract = await ContractFactory.deploy(deployer.address);
  await contract.deployed();

  console.log("FreelanceJobs contract deployed at:", contract.address);
  return contract.address;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

  if (balance.eq(0)) {
    console.error("Error: Account has no balance. Please fund your account first.");
    console.log("You can get test tokens from the Arbitrum Sepolia Faucet:");
    console.log("https://faucet.arbitrum.io/");
    process.exit(1);
  }

  // You can choose which contract to deploy here.
  // For example, to deploy only FreelanceJobs, uncomment the line below.
  // await deployFreelanceJobs();

  // If you want to deploy both, call both functions.
  // For demonstration, let's deploy both and log their addresses.
  const lockAddress = await deployLock();
  const freelanceJobsAddress = await deployFreelanceJobs();
  
  console.log("\n--- Deployment Summary ---");
  console.log("Lock contract address:", lockAddress);
  console.log("FreelanceJobs contract address:", freelanceJobsAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});