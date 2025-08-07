const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MentorBookingEscrow contract...");

  const MentorBookingEscrow = await ethers.getContractFactory("MentorBookingEscrow");
  const mentorBookingEscrow = await MentorBookingEscrow.deploy();

  await mentorBookingEscrow.deployed();

  const address = mentorBookingEscrow.address;
  console.log("MentorBookingEscrow deployed to:", address);

  // Verify the contract on Etherscan (optional)
  console.log("Contract deployed successfully!");
  console.log("Update the MENTOR_BOOKING_ESCROW_ADDRESS in lib/contract.ts with:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 