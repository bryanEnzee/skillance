const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying MentorRegistry contract to Sapphire...");

    const MentorRegistry = await ethers.getContractFactory("MentorRegistry");
    const mentorRegistry = await MentorRegistry.deploy();
    await mentorRegistry.deployed();

    console.log(`MentorRegistry deployed to: ${mentorRegistry.address}`);
    console.log("Contract deployed successfully!");
    console.log("Update the NEXT_PUBLIC_MENTOR_REGISTRY_ADDRESS in .env.local with:", mentorRegistry.address);
    
    // Verify deployment by checking initial state
    const mentorCount = await mentorRegistry.mentorCount();
    console.log("Initial mentor count:", mentorCount.toString());
    
    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log("Contract Address:", mentorRegistry.address);
    console.log("Network: Sapphire Testnet");
    console.log("Explorer URL: https://explorer.sapphire.oasis.io/address/" + mentorRegistry.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
