const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

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
