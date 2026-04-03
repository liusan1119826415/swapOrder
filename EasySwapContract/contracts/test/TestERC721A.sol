// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "erc721a/contracts/ERC721A.sol";

contract Troll is ERC721A, Ownable, ReentrancyGuard {
    string private metaURI;
    mapping(uint256 => string) private _tokenURIs;  // ← 新增：每个 NFT 独立的 URI

    uint256 public constant MAX_SUPPLY = 2024;
    uint256 public constant PER_MINT = 4;
    bool public mintStatus;

    constructor() ERC721A("Troll", "Troll") Ownable(msg.sender) {}

    // 新增：带 metadata URI 的 mint 函数
    function mintWithURI(
        address to, 
        uint256 quantity,
        string calldata uri
    ) external nonReentrant {
        _safeMint(to, quantity);
        
        // 为新铸造的 NFT 设置 URI
        uint256 startTokenId = _numberMinted(to) - quantity;
        for (uint256 i = 0; i < quantity; i++) {
            _tokenURIs[startTokenId + i] = uri;
        }
    }

    function mint(address to, uint256 quantity) external nonReentrant {
        // mint
        _safeMint(to, quantity);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "The energy has not yet been collected");
        
        // 优先返回 individual URI
        string memory individualUri = _tokenURIs[tokenId];
        if (bytes(individualUri).length > 0) {
            return individualUri;
        }
        
        // 否则返回全局 URI
        return metaURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setMintStatus(bool status) external onlyOwner {
        mintStatus = status;
    }

    function setTokenURI(string calldata tokenURI_) external onlyOwner {
        metaURI = tokenURI_;
    }

    function withdrawETH() external onlyOwner {
        (bool success, ) = _msgSender().call{value: address(this).balance}("");
        require(success, "withdraw failed");
    }

    receive() external payable {}
}
