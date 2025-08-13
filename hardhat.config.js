require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable the new IR-based code generator
    },
  },
  networks: {
    "camp-testnet": {
      url: process.env.CAMP_TESTNET_RPC_URL || "https://325000.rpc.thirdweb.com",
      accounts: process.env.CAMP_PRIVATE_KEY ? [process.env.CAMP_PRIVATE_KEY] : [],
      chainId: 325000,
      // Camp Network Testnet V2 configuration
      verify: {
        etherscan: {
          apiUrl: "https://camp-network-testnet.blockscout.com/api",
          browserURL: "https://camp-network-testnet.blockscout.com",
        }
      }
    },
    "basecamp": {
      url: process.env.BASECAMP_RPC_URL || "https://rpc.basecamp.t.raas.gelato.cloud",
      accounts: process.env.BASECAMP_PRIVATE_KEY ? [process.env.BASECAMP_PRIVATE_KEY] : [],
      chainId: 123420001114,
      verify: {
        etherscan: {
          apiUrl: "https://basecamp.cloud.blockscout.com/api",
          browserURL: "https://basecamp.cloud.blockscout.com/",
        }
      }
    },
    "camp-netnet": {
      url: process.env.CAMP_NETNET_RPC_URL || "https://mainnet.campprotocol.xyz",
      accounts: process.env.CAMP_PRIVATE_KEY ? [process.env.CAMP_PRIVATE_KEY] : [],
      chainId: 325001, // Camp Network mainnet chain ID
      verify: {
        etherscan: {
          apiUrl: "https://camp-network-mainnet.blockscout.com/api",
          browserURL: "https://camp-network-mainnet.blockscout.com",
        }
      }
    },
    "basecamp-testnet": {
      url: process.env.BASECAMP_TESTNET_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.BASECAMP_PRIVATE_KEY ? [process.env.BASECAMP_PRIVATE_KEY] : [],
    },
    "basecamp_mainnet": {
      url: process.env.BASECAMP_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.BASECAMP_PRIVATE_KEY ? [process.env.BASECAMP_PRIVATE_KEY] : [],
    },
    "basecamp-mainnet": {
      url: process.env.BASECAMP_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.BASECAMP_PRIVATE_KEY ? [process.env.BASECAMP_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "basecamp-testnet": process.env.BASECAMP_EXPLORER_API_KEY || "",
      "basecamp-mainnet": process.env.BASECAMP_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "basecamp-testnet",
        chainId: 84532, // BaseCAMP testnet chainId
        urls: {
          apiURL: "https://api-testnet.basescan.org/api",
          browserURL: "https://testnet.basescan.org",
        },
      },
      {
        network: "basecamp-mainnet",
        chainId: 8453, // BaseCAMP mainnet chainId
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
