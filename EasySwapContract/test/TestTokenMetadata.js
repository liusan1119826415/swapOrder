const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestERC721A Metadata Tests", function () {
    let contract;
    const CONTRACT_ADDRESS = "0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF";
    const TOKEN_ID = 16;

    before(async function () {
        // Attach to existing contract
        const contractFactory = await ethers.getContractFactory("Troll");
        contract = contractFactory.attach(CONTRACT_ADDRESS);
    });

    describe("Collection Info", function () {
        it("Should get collection name", async function () {
            const name = await contract.name();
            console.log(`\n✅ Collection Name: "${name}"`);
            expect(name).to.be.a("string");
        });

        it("Should get symbol", async function () {
            const symbol = await contract.symbol();
            console.log(`\n✅ Symbol: "${symbol}"`);
            expect(symbol).to.be.a("string");
        });
    });

    describe("Token #16 Metadata", function () {
        it("Should check if token exists", async function () {
            try {
                const owner = await contract.ownerOf(TOKEN_ID);
                console.log(`\n✅ Token #${TOKEN_ID} EXISTS`);
                console.log(`   Owner: ${owner}`);
                expect(owner).to.be.a("string");
            } catch (error) {
                if (error.reason.includes("invalid token ID")) {
                    console.log(`\n❌ Token #${TOKEN_ID} DOES NOT EXIST`);
                    this.skip();
                } else {
                    throw error;
                }
            }
        });

        it("Should get tokenURI", async function () {
            const tokenURI = await contract.tokenURI(TOKEN_ID);
            console.log(`\n✅ Token URI: "${tokenURI}"`);
            
            if (tokenURI === "") {
                console.log("   ⚠️  Token URI is empty!");
                console.log("   Possible reasons:");
                console.log("   - No individual URI set for this token");
                console.log("   - No global metaURI set in contract");
            }
            
            expect(tokenURI).to.be.a("string");
        });

        it("Should fetch metadata from tokenURI if not empty", async function () {
            const tokenURI = await contract.tokenURI(TOKEN_ID);
            
            if (!tokenURI || tokenURI === "") {
                console.log("\n⚠️  Skipping metadata fetch - tokenURI is empty");
                this.skip();
            }

            let metadataUrl = tokenURI;
            if (tokenURI.startsWith("ipfs://")) {
                metadataUrl = `https://ipfs.io/ipfs/${tokenURI.substring(7)}`;
                console.log(`\n📡 Converting IPFS URL: ${metadataUrl}`);
            }

            try {
                const response = await fetch(metadataUrl);
                if (!response.ok) {
                    console.log(`\n⚠️  Failed to fetch metadata (HTTP ${response.status})`);
                    this.skip();
                }

                const metadata = await response.json();
                console.log("\n✅ Metadata fetched successfully:");
                console.log(JSON.stringify(metadata, null, 2));
                
                expect(metadata).to.be.an("object");
            } catch (error) {
                console.log(`\n⚠️  Could not fetch metadata: ${error.message}`);
                this.skip();
            }
        });
    });

    describe("Additional Token Info", function () {
        it("Should get total supply", async function () {
            const totalSupply = await contract.totalSupply();
            console.log(`\n✅ Total Supply: ${totalSupply.toString()}`);
            expect(totalSupply).to.be.greaterThan(0);
        });

        it("Should get MAX_SUPPLY", async function () {
            const maxSupply = await contract.MAX_SUPPLY();
            console.log(`\n✅ Max Supply: ${maxSupply.toString()}`);
            expect(maxSupply).to.be.greaterThan(0);
        });

        it("Should get mint status", async function () {
            const mintStatus = await contract.mintStatus();
            console.log(`\n✅ Mint Status: ${mintStatus ? "ACTIVE" : "INACTIVE"}`);
        });
    });
});
