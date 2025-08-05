import { HardhatUserConfig } from "hardhat/config";
require("@nomicfoundation/hardhat-toolbox");
require("@oasisprotocol/sapphire-hardhat");
require("dotenv").config();

const accounts = process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.dev",
      chainId: 23295,
      accounts: accounts,
    },
    sapphireLocalnet: {
      url: "http://localhost:8545",
      chainId: 0x5afd,
      accounts: accounts,
    },
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 421614,
      accounts: accounts,
    },
  },
};

export default config;