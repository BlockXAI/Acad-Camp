const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to safely load files or use environment variables
function loadContractData(artifactPath, envAbiKey, envAddressKey) {
  try {
    // Try to load from artifacts directory in same folder
    const localPath = path.join(__dirname, 'artifacts', artifactPath);
    if (fs.existsSync(localPath)) {
      return require(localPath);
    }
    
    // Try to load from parent directory
    const parentPath = path.join(__dirname, '..', 'artifacts', artifactPath);
    if (fs.existsSync(parentPath)) {
      return require(parentPath);
    }
    
    // Fall back to environment variables if available
    if (process.env[envAbiKey] && process.env[envAddressKey]) {
      return {
        abi: JSON.parse(process.env[envAbiKey]),
        address: process.env[envAddressKey]
      };
    }
    
    throw new Error(`Could not load contract artifact: ${artifactPath}`);
  } catch (error) {
    console.error(`Error loading contract data for ${artifactPath}:`, error);
    return null;
  }
}

// Load contract artifacts with fallback to environment variables
const researchPaperArtifact = loadContractData(
  'contracts/ResearchPaper.sol/ResearchPaper.json',
  'RESEARCH_PAPER_ABI',
  'RESEARCH_PAPER_ADDRESS'
);

const citationRegistryArtifact = loadContractData(
  'contracts/CitationRegistry.sol/CitationRegistry.json',
  'CITATION_REGISTRY_ABI',
  'CITATION_REGISTRY_ADDRESS'
);

const royaltyDistributorArtifact = loadContractData(
  'contracts/RoyaltyDistributor.sol/RoyaltyDistributor.json',
  'ROYALTY_DISTRIBUTOR_ABI',
  'ROYALTY_DISTRIBUTOR_ADDRESS'
);

const mockOriginProtocolArtifact = loadContractData(
  'contracts/mocks/MockOriginProtocol.sol/MockOriginProtocol.json',
  'MOCK_ORIGIN_PROTOCOL_ABI',
  'MOCK_ORIGIN_PROTOCOL_ADDRESS'
);

// Load deployment data with fallback to environment variables
let deploymentData = null;
try {
  // Try local deployments directory
  const localDeploymentPath = path.join(__dirname, 'deployments');
  if (fs.existsSync(localDeploymentPath)) {
    const files = fs.readdirSync(localDeploymentPath).filter(file => file.includes('basecamp'));
    if (files.length > 0) {
      deploymentData = JSON.parse(fs.readFileSync(path.join(localDeploymentPath, files[0]), 'utf8'));
    }
  }
  
  // Try parent deployments directory
  if (!deploymentData) {
    const parentDeploymentPath = path.join(__dirname, '..', 'deployments');
    if (fs.existsSync(parentDeploymentPath)) {
      const files = fs.readdirSync(parentDeploymentPath).filter(file => file.includes('basecamp'));
      if (files.length > 0) {
        deploymentData = JSON.parse(fs.readFileSync(path.join(parentDeploymentPath, files[0]), 'utf8'));
      }
    }
  }
  
  // Fall back to environment variables if needed
  if (!deploymentData && process.env.DEPLOYMENT_DATA) {
    deploymentData = JSON.parse(process.env.DEPLOYMENT_DATA);
  }
} catch (error) {
  console.error('Error loading deployment data:', error);
}

// Frontend URLs
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'https://academic-chain-4aucqnje7-satyam-10124s-projects.vercel.app',
  'https://academic-chain-3gs031f69-satyam-10124s-projects.vercel.app',
  'https://academic-chain.vercel.app',
  'http://localhost:5173' // Local development
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      console.log(`CORS blocked request from origin: ${origin}`);
      // For development, you could allow all origins by uncommenting the next line
      // return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Setup Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AcademicChain API',
      version: '1.0.0',
      description: 'API for interacting with AcademicChain smart contracts',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create provider and connection to Basecamp network
const provider = new ethers.JsonRpcProvider(process.env.BASECAMP_RPC_URL || "https://rpc.basecamp.t.raas.gelato.cloud");

// Safe wallet creation with private key validation
let wallet;
try {
  // Check if we have a valid private key (must be 64 or 66 chars for hex)
  const privateKey = process.env.BASECAMP_PRIVATE_KEY;
  if (privateKey && (privateKey.length === 64 || privateKey.length === 66)) {
    // Format key properly (add 0x prefix if missing)
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    wallet = new ethers.Wallet(formattedKey, provider);
    console.log("✅ Connected with wallet address:", wallet.address);
  } else {
    // Use a dummy wallet for read-only operations
    console.warn("⚠️  No valid private key found. Creating a read-only connection.");
    // Generate a random wallet for read-only operations
    wallet = ethers.Wallet.createRandom().connect(provider);
    console.log("⚠️  Using read-only mode with random address:", wallet.address);
  }
} catch (error) {
  console.error("❌ Error creating wallet:", error.message);
  // Generate a random wallet as fallback
  wallet = ethers.Wallet.createRandom().connect(provider);
  console.log("⚠️  Using fallback random address:", wallet.address);
}

// Contract instances
let researchPaper, citationRegistry, royaltyDistributor, mockOriginProtocol;

// Initialize contracts if deployment data is available
if (deploymentData && deploymentData.contracts) {
  researchPaper = new ethers.Contract(
    deploymentData.contracts.ResearchPaper,
    researchPaperArtifact.abi,
    wallet
  );
  
  citationRegistry = new ethers.Contract(
    deploymentData.contracts.CitationRegistry,
    citationRegistryArtifact.abi,
    wallet
  );
  
  royaltyDistributor = new ethers.Contract(
    deploymentData.contracts.RoyaltyDistributor,
    royaltyDistributorArtifact.abi,
    wallet
  );
  
  mockOriginProtocol = new ethers.Contract(
    deploymentData.contracts.MockOriginProtocol,
    mockOriginProtocolArtifact.abi,
    wallet
  );
} else {
  console.warn("Deployment data not found or incomplete. Using hardcoded contract addresses.");
  
  // Hardcoded addresses from our deployment
  researchPaper = new ethers.Contract(
    "0x0D3afa3339Cad61d7a4f4390D651d933B5Dc913d",
    researchPaperArtifact.abi,
    wallet
  );
  
  citationRegistry = new ethers.Contract(
    "0xF09B40Dfc07A584970312D1f62Ed84A4EDd575c9",
    citationRegistryArtifact.abi,
    wallet
  );
  
  royaltyDistributor = new ethers.Contract(
    "0x41D13507f38b4acd2ED99BFbBc785D96Ce420386",
    royaltyDistributorArtifact.abi,
    wallet
  );
  
  mockOriginProtocol = new ethers.Contract(
    "0x83A3AFEb5D6AEbcc01eaF42AA6bb9f08b58031A1",
    mockOriginProtocolArtifact.abi,
    wallet
  );
}

// Import routes
const researchPaperRoutes = require('./routes/researchPaper')(researchPaper);
const citationRegistryRoutes = require('./routes/citationRegistry')(citationRegistry);
const royaltyDistributorRoutes = require('./routes/royaltyDistributor')(royaltyDistributor);
const originProtocolRoutes = require('./routes/originProtocol')(mockOriginProtocol);

// Routes
app.use('/api/papers', researchPaperRoutes);
app.use('/api/citations', citationRegistryRoutes);
app.use('/api/royalties', royaltyDistributorRoutes);
app.use('/api/origin', originProtocolRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AcademicChain API',
    documentation: '/api-docs',
    status: 'online',
    contractAddresses: {
      ResearchPaper: researchPaper.target,
      CitationRegistry: citationRegistry.target,
      RoyaltyDistributor: royaltyDistributor.target,
      MockOriginProtocol: mockOriginProtocol.target
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AcademicChain API server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  console.log('Connected contracts:');
  console.log(`- ResearchPaper: ${researchPaper.target}`);
  console.log(`- CitationRegistry: ${citationRegistry.target}`);
  console.log(`- RoyaltyDistributor: ${royaltyDistributor.target}`);
  console.log(`- MockOriginProtocol: ${mockOriginProtocol.target}`);
});

module.exports = app;
