const { expect } = require("chai");
const { ethers } = require("hardhat");

async function main() {
    // 合约地址 - 替换成你的 TestERC721A 合约地址
    const contractAddress = "0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF";
    
    console.log("========================================");
    console.log("Fetching NFT Metadata for Token #16");
    console.log("========================================\n");
    
    try {
        // 获取合约实例
        const contractArtifact = await ethers.getContractFactory("Troll");
        const contract = contractArtifact.attach(contractAddress);
        
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Token ID: 16\n`);
        
        // 1. 获取 Collection Name
        console.log("[Step 1] Fetching collection name...");
        const name = await contract.name();
        console.log(`✅ Collection Name: "${name}"`);
        console.log("");
        
        // 2. 获取 Symbol
        console.log("[Step 2] Fetching symbol...");
        const symbol = await contract.symbol();
        console.log(`✅ Symbol: "${symbol}"`);
        console.log("");
        
        // 3. 获取 Token URI
        console.log("[Step 3] Fetching tokenURI for token #16...");
        const tokenURI = await contract.tokenURI(16);
        console.log(`✅ Token URI: "${tokenURI}"`);
        console.log("");
        
        // 4. 检查 Owner
        console.log("[Step 4] Fetching owner of token #16...");
        const owner = await contract.ownerOf(16);
        console.log(`✅ Owner: ${owner}`);
        console.log("");
        
        // 5. 检查是否已铸造
        console.log("[Step 5] Checking if token exists...");
        try {
            const exists = await contract.ownerOf(16);
            console.log(`✅ Token #16 EXISTS (owned by ${exists})`);
        } catch (error) {
            console.log(`❌ Token #16 DOES NOT EXIST`);
            console.log(`   Error: ${error.message}`);
        }
        console.log("");
        
        // 6. 如果 tokenURI 不为空，尝试获取 metadata
        if (tokenURI && tokenURI !== "") {
            console.log("[Step 6] Fetching metadata from tokenURI...");
            console.log(`    Token URI: ${tokenURI}`);
            
            // 如果是 IPFS URI，转换为 HTTP URL
            let metadataUrl = tokenURI;
            if (tokenURI.startsWith("ipfs://")) {
                metadataUrl = `https://ipfs.io/ipfs/${tokenURI.substring(7)}`;
                console.log(`    IPFS URL converted: ${metadataUrl}`);
            }
            
            try {
                const response = await fetch(metadataUrl);
                if (response.ok) {
                    const metadata = await response.json();
                    console.log("✅ Metadata JSON:");
                    console.log(JSON.stringify(metadata, null, 2));
                } else {
                    console.log(`⚠️  Failed to fetch metadata (HTTP ${response.status})`);
                }
            } catch (error) {
                console.log(`⚠️  Could not fetch metadata: ${error.message}`);
            }
        } else {
            console.log("⚠️  Token URI is empty string");
            console.log("   This means:");
            console.log("   - No individual URI set for token #16");
            console.log("   - No global metaURI set in contract");
            console.log("   - You may need to call setTokenURI() or mintWithURI()");
        }
        
        console.log("\n========================================");
        console.log("Summary:");
        console.log("========================================");
        console.log(`Collection: ${name} (${symbol})`);
        console.log(`Token #16 Owner: ${owner}`);
        console.log(`Token #16 URI: ${tokenURI || "(empty)"}`);
        console.log("========================================\n");
        
    } catch (error) {
        console.error("❌ Error fetching NFT data:");
        console.error(error);
        
        if (error.reason === "ERC721: invalid token ID") {
            console.log("\n💡 Token #16 does not exist yet!");
            console.log("   You need to mint it first.\n");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
