const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying ChatStorage contract to Sapphire...");

    const MentorChatStorage = await ethers.getContractFactory("MentorChatStorage");
    const chatStorage = await MentorChatStorage.deploy();
    await chatStorage.deployed();

    console.log(`ChatStorage deployed to: ${chatStorage.address}`);
    console.log("Contract deployed successfully!");
    console.log("Update the NEXT_PUBLIC_CHAT_STORAGE_ADDRESS in .env.local with:", chatStorage.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
