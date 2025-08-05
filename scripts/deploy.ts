const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance before deploying
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  if (balance.eq(0)) {
    console.error("Error: Account has no balance. Please fund your account first.");
    console.log("You can get test tokens from the Sapphire Testnet Faucet:");
    console.log("https://faucet.testnet.oasis.dev/");
    process.exit(1);
  }

  const ContractFactory = await hre.ethers.getContractFactory("Lock");
  const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
  const contract = await ContractFactory.deploy(unlockTime, { value: hre.ethers.utils.parseEther("0.1") });
  await contract.deployed();

  console.log("Contract deployed at:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
