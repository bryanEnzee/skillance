const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x93bB05Ea234d51cFacc67AA1b4Bf5b077C34E1B4";
  const userAddress = "0x971360600908069c9F5d33B7cFA4A760C0Ec5a21";
  
  console.log("Checking if address is already registered...");
  console.log("Contract:", contractAddress);
  console.log("User Address:", userAddress);
  
  try {
    // Get the contract factory
    const MentorRegistry = await ethers.getContractFactory("MentorRegistry");
    
    // Connect to the deployed contract
    const mentorRegistry = MentorRegistry.attach(contractAddress);
    
    // Check if address is already registered by calling mentorAddressToId
    // This mapping returns 0 if not registered, or the mentor ID if registered
    const mentorId = await mentorRegistry.mentorAddressToId(userAddress);
    
    if (mentorId.toString() === "0") {
      console.log("✅ Address is NOT registered - registration should work");
    } else {
      console.log("❌ Address is ALREADY registered as Mentor ID:", mentorId.toString());
      
      // Get mentor details
      const mentor = await mentorRegistry.getMentor(mentorId);
      console.log("Mentor Details:");
      console.log("- Name:", mentor.name);
      console.log("- Expertise:", mentor.expertiseArea);
      console.log("- Hourly Rate:", ethers.utils.formatEther(mentor.hourlyRate), "ETH");
      console.log("- Verified:", mentor.isVerified);
      console.log("- Active:", mentor.isActive);
    }
    
  } catch (error) {
    console.error("❌ Error checking address:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
