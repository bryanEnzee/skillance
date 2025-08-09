const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x93bB05Ea234d51cFacc67AA1b4Bf5b077C34E1B4";
  
  console.log("Testing MentorRegistry contract at:", contractAddress);
  
  try {
    // Get the contract factory
    const MentorRegistry = await ethers.getContractFactory("MentorRegistry");
    
    // Connect to the deployed contract
    const mentorRegistry = MentorRegistry.attach(contractAddress);
    
    // Test basic contract functions
    console.log("Testing contract connection...");
    
    // Get mentor count (should show how many mentors are registered)
    const mentorCount = await mentorRegistry.mentorCount();
    console.log("Current Mentor Count:", mentorCount.toString());
    
    // Check if contract is accessible
    console.log("✅ Contract is accessible and responding");
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
