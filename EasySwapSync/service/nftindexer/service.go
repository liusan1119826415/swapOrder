package nftindexer

import (
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ProjectsTask/EasySwapBase/chain/chainclient"
	"github.com/ProjectsTask/EasySwapBase/chain/types"
	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/base"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/multi"
	"github.com/ProjectsTask/EasySwapBase/stores/xkv"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	ethereumTypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/pkg/errors"
	"github.com/shopspring/decimal"
	"github.com/zeromicro/go-zero/core/threading"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/ProjectsTask/EasySwapSync/service/config"
)

const (
	NFTIndexType       = 7
	NFTSleepInterval   = 15 // in seconds
	NFTSyncBlockPeriod = 10

	// ERC721 Transfer Event Topic
	// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
	TransferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

	// ERC721A Metadata Update Event Topic (if supported)
	// event URIChange(uint256 indexed tokenId, string uri)
	URITopic = "0x0c3962729bfa417074e1f91f6af69658ce3a124b50487de807fd77aa0ea03f98"

	ZeroAddress    = "0x0000000000000000000000000000000000000000"
	HexPrefix      = "0x"
	MetadataSuffix = ".json"
	IERC721AABI    = `[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ApprovalCallerNotOwnerNorApproved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ApprovalQueryForNonexistentToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BalanceQueryForZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MintERC2309QuantityExceedsLimit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MintToZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MintZeroQuantity",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotCompatibleWithSpotMints",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OwnerQueryForNonexistentToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OwnershipNotInitializedForExtraData",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SequentialMintExceedsLimit",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SequentialUpToTooSmall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SpotMintTokenIdTooSmall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferCallerNotOwnerNorApproved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFromIncorrectOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferToNonERC721ReceiverImplementer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferToZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "URIQueryForNonexistentToken",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "fromTokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "toTokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "ConsecutiveTransfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_SUPPLY",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PER_MINT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mintStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "mintWithURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "status",
          "type": "bool"
        }
      ],
      "name": "setMintStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "tokenURI_",
          "type": "string"
        }
      ],
      "name": "setTokenURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "result",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawETH",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]`
)

var MultiChainMaxBlockDifference = map[string]uint64{
	"eth":        1,
	"optimism":   2,
	"starknet":   1,
	"arbitrum":   2,
	"base":       2,
	"zksync-era": 2,
}

// ERC721ABI ERC721 标准 ABI（部分）
var ERC721ABI = `[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"uri","type":"string"}],"name":"URIChange","type":"event"}]`

// NFTIndexerService NFT 索引服务
type NFTIndexerService struct {
	ctx         context.Context
	cfg         *config.Config
	db          *gorm.DB
	kv          *xkv.Store
	chainClient chainclient.ChainClient
	chainId     int64
	chain       string
	parsedAbi   abi.ABI
}

// New 创建 NFT 索引服务实例
func New(ctx context.Context, cfg *config.Config, db *gorm.DB, xkv *xkv.Store, chainClient chainclient.ChainClient, chainId int64, chain string) *NFTIndexerService {
	parsedAbi, _ := abi.JSON(strings.NewReader(ERC721ABI))
	return &NFTIndexerService{
		ctx:         ctx,
		cfg:         cfg,
		db:          db,
		kv:          xkv,
		chainClient: chainClient,
		chain:       chain,
		chainId:     chainId,
		parsedAbi:   parsedAbi,
	}
}

// Start 启动 NFT 索引服务
func (s *NFTIndexerService) Start() {
	threading.GoSafe(s.SyncNFTEventLoop)
}

// SyncNFTEventLoop 同步 NFT 事件主循环
func (s *NFTIndexerService) SyncNFTEventLoop() {
	var indexedStatus base.IndexedStatus
	if err := s.db.WithContext(s.ctx).Table(base.IndexedStatusTableName()).
		Where("chain_id = ? and index_type = ?", s.chainId, NFTIndexType).
		First(&indexedStatus).Error; err != nil {
		xzap.WithContext(s.ctx).Error("failed on get NFT index status",
			zap.Error(err))
		return
	}

	lastSyncBlock := uint64(indexedStatus.LastIndexedBlock)

	for {
		select {
		case <-s.ctx.Done():
			xzap.WithContext(s.ctx).Info("SyncNFTEventLoop stopped due to context cancellation")
			return
		default:
		}

		currentBlockNum, err := s.chainClient.BlockNumber()
		if err != nil {
			xzap.WithContext(s.ctx).Error("failed on get current block number", zap.Error(err))
			time.Sleep(NFTSleepInterval * time.Second)
			continue
		}

		// 如果上次同步的区块高度大于当前区块高度，等待一段时间后再次轮询
		if lastSyncBlock > currentBlockNum-uint64(MultiChainMaxBlockDifference[s.chain]) {
			time.Sleep(NFTSleepInterval * time.Second)
			continue
		}

		startBlock := lastSyncBlock
		endBlock := startBlock + NFTSyncBlockPeriod
		if endBlock > currentBlockNum-uint64(MultiChainMaxBlockDifference[s.chain]) {
			endBlock = currentBlockNum - uint64(MultiChainMaxBlockDifference[s.chain])
		}

		// 从配置中读取需要监听的 NFT 合约地址列表
		monitoredContracts := s.cfg.ContractCfg.NFTAddresses
		if len(monitoredContracts) == 0 {
			xzap.WithContext(s.ctx).Warn("No NFT contracts configured to monitor, skipping this sync cycle")
			time.Sleep(NFTSleepInterval * time.Second)
			continue
		}

		query := types.FilterQuery{
			FromBlock: new(big.Int).SetUint64(startBlock),
			ToBlock:   new(big.Int).SetUint64(endBlock),
			Addresses: monitoredContracts, // 必须指定合约地址，否则公共节点会拒绝请求
		}

		logs, err := s.chainClient.FilterLogs(s.ctx, query)
		if err != nil {
			xzap.WithContext(s.ctx).Error("failed on get logs", zap.Error(err))
			time.Sleep(NFTSleepInterval * time.Second)
			continue
		}

		// 处理所有 Transfer 事件
		transferCount := 0
		for _, log := range logs {
			ethLog := log.(ethereumTypes.Log)
			switch ethLog.Topics[0].String() {
			case TransferTopic:
				s.handleTransferEvent(ethLog)
				transferCount++
			default:
			}
		}

		lastSyncBlock = endBlock + 1
		if err := s.db.WithContext(s.ctx).Table(base.IndexedStatusTableName()).
			Where("chain_id = ? and index_type = ?", s.chainId, NFTIndexType).
			Update("last_indexed_block", lastSyncBlock).Error; err != nil {
			xzap.WithContext(s.ctx).Error("failed on update NFT event sync block number",
				zap.Error(err))
			return
		}

		xzap.WithContext(s.ctx).Info("sync NFT events ...",
			zap.Uint64("start_block", startBlock),
			zap.Uint64("end_block", endBlock),
			zap.Int("transfer_events", transferCount))
	}
}

// handleTransferEvent 处理 Transfer 事件（包括 Mint、Burn 和普通转账）
func (s *NFTIndexerService) handleTransferEvent(log ethereumTypes.Log) {
	// Unpack the Transfer event
	var event struct {
		From    common.Address
		To      common.Address
		TokenId *big.Int
	}

	err := s.parsedAbi.UnpackIntoInterface(&event, "Transfer", log.Data)
	if err != nil {
		xzap.WithContext(s.ctx).Error("Error unpacking Transfer event:", zap.Error(err))
		return
	}

	// Extract indexed fields from topics
	from := common.BytesToAddress(log.Topics[1].Bytes())
	to := common.BytesToAddress(log.Topics[2].Bytes())
	tokenId := new(big.Int).SetBytes(log.Topics[3].Bytes())

	contractAddress := log.Address.String()

	blockTime, err := s.chainClient.BlockTimeByNumber(s.ctx, big.NewInt(int64(log.BlockNumber)))
	if err != nil {
		xzap.WithContext(s.ctx).Error("failed to get block time", zap.Error(err))
		return
	}

	// 判断是 Mint、Burn 还是普通转账
	if from.Hex() == ZeroAddress {
		// Mint 事件：从地址 0x0 铸造到新地址
		xzap.WithContext(s.ctx).Debug("Detected NFT Mint event",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("to", to.Hex()),
			zap.Uint64("block", log.BlockNumber))

		s.handleMintEvent(contractAddress, tokenId, to.Hex(), log.BlockNumber, log.TxHash.String(), int64(blockTime))
	} else if to.Hex() == ZeroAddress {
		// Burn 事件：从地址转移到地址 0x0（暂时按 Transfer 处理）
		xzap.WithContext(s.ctx).Debug("Detected NFT Burn event",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("from", from.Hex()),
			zap.Uint64("block", log.BlockNumber))

		s.handleTransferEventInternal(contractAddress, tokenId, from.Hex(), ZeroAddress, log.BlockNumber, log.TxHash.String(), int64(blockTime))
	} else {
		// 普通转账事件
		xzap.WithContext(s.ctx).Debug("Detected NFT Transfer event",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("from", from.Hex()),
			zap.String("to", to.Hex()),
			zap.Uint64("block", log.BlockNumber))

		s.handleTransferEventInternal(contractAddress, tokenId, from.Hex(), to.Hex(), log.BlockNumber, log.TxHash.String(), int64(blockTime))
	}
}

// handleMintEvent 处理 Mint 事件
func (s *NFTIndexerService) handleMintEvent(contractAddress string, tokenId *big.Int, owner string, blockNumber uint64, txHash string, blockTime int64) {
	// 检查 NFT 是否已存在
	var existingItem multi.Item
	err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
		Where("collection_address = ? AND token_id = ?", strings.ToLower(contractAddress), tokenId.String()).
		First(&existingItem).Error

	if err == nil {
		// NFT 已存在，更新所有者
		if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
			Where("collection_address = ? AND token_id = ?", strings.ToLower(contractAddress), tokenId.String()).
			Update("owner", strings.ToLower(owner)).Error; err != nil {
			xzap.WithContext(s.ctx).Error("failed to update minted NFT owner",
				zap.Error(err),
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()))
		}
		return
	}

	// NFT 不存在，创建新记录（先使用默认名称）
	defaultName := fmt.Sprintf("NFT #%s", tokenId.String())
	newItem := multi.Item{
		ChainId:           int(s.chainId),
		CollectionAddress: strings.ToLower(contractAddress),
		TokenId:           tokenId.String(),
		Name:              defaultName,
		ImageURL:          "",
		Owner:             strings.ToLower(owner),
		Creator:           strings.ToLower(owner),
		Supply:            1,
	}

	if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&newItem).Error; err != nil {
		xzap.WithContext(s.ctx).Error("failed to create minted NFT record",
			zap.Error(err),
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()))
		return
	}

	// 异步获取并更新 NFT metadata（包括 name 和 image_url）
	go func() {
		metadataCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// 1. 通过合约调用获取 tokenURI
		xzap.WithContext(metadataCtx).Info("[Step 1/3] Fetching tokenURI from contract...",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()))
		tokenURI, err := s.fetchTokenURI(metadataCtx, contractAddress, tokenId)
		if err != nil {
			xzap.WithContext(metadataCtx).Error("[Step 1/3] FAILED - Could not fetch tokenURI from contract",
				zap.Error(err),
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()))
			// 如果获取 tokenURI 失败，尝试获取 collection name
			xzap.WithContext(metadataCtx).Info("[Fallback] Trying to fetch collection name only...")
			collectionName, nameErr := s.fetchCollectionName(metadataCtx, contractAddress)
			if nameErr == nil && collectionName != "" {
				UpdateNFTNameOnly(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), collectionName)
				xzap.WithContext(metadataCtx).Info("[Fallback] SUCCESS - Updated collection name only",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("collection_name", collectionName))
			} else {
				xzap.WithContext(metadataCtx).Warn("[Fallback] FAILED - Could not fetch collection name",
					zap.Error(nameErr),
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()))
			}
			return
		}

		xzap.WithContext(metadataCtx).Info("[Step 1/3] SUCCESS - Got tokenURI from contract",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("token_uri", tokenURI))

		if tokenURI == "" {
			xzap.WithContext(metadataCtx).Warn("[Step 1/3] WARNING - tokenURI is empty string",
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()),
				zap.String("possible_reason", "Contract may not implement ERC721 metadata standard or tokenId doesn't exist"))

			// Fallback: 尝试获取 collection name
			xzap.WithContext(metadataCtx).Info("[Fallback] Trying to fetch collection name...")
			collectionName, nameErr := s.fetchCollectionName(metadataCtx, contractAddress)
			if nameErr != nil {
				xzap.WithContext(metadataCtx).Error("[Fallback] FAILED - Could not fetch collection name",
					zap.Error(nameErr),
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()))
				// 即使失败也使用默认名称更新数据库，避免重复处理
				UpdateNFTNameOnly(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), defaultName)
				xzap.WithContext(metadataCtx).Info("[Fallback] Updated with default name",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("default_name", defaultName))
				return
			}

			if collectionName == "" {
				xzap.WithContext(metadataCtx).Warn("[Fallback] Collection name is also empty",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()))
				// 使用默认名称更新
				UpdateNFTNameOnly(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), defaultName)
				xzap.WithContext(metadataCtx).Info("[Fallback] Updated with default name (collection name was empty)",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("default_name", defaultName))
				return
			}

			// Collection name 获取成功，使用 "CollectionName #TokenID" 格式
			finalName := fmt.Sprintf("%s #%s", collectionName, tokenId.String())
			UpdateNFTNameOnly(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), finalName)
			xzap.WithContext(metadataCtx).Info("[Fallback] SUCCESS - Updated with collection name + tokenID",
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()),
				zap.String("collection_name", collectionName),
				zap.String("final_name", finalName))
			return
		}

		// 2. 从 tokenURI 获取 metadata
		xzap.WithContext(metadataCtx).Info("[Step 2/3] Fetching metadata from tokenURI...",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("token_uri", tokenURI))
		metadata, err := FetchNFTMetadata(metadataCtx, tokenURI)
		if err != nil {
			xzap.WithContext(metadataCtx).Error("[Step 2/3] FAILED - Could not fetch metadata from URI",
				zap.Error(err),
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()),
				zap.String("token_uri", tokenURI))
			// 尝试仅更新 collection name
			xzap.WithContext(metadataCtx).Info("[Fallback] Trying to fetch collection name only...")
			collectionName, nameErr := s.fetchCollectionName(metadataCtx, contractAddress)
			if nameErr == nil && collectionName != "" {
				UpdateNFTNameOnly(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), collectionName)
				xzap.WithContext(metadataCtx).Info("[Fallback] SUCCESS - Updated collection name only",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("collection_name", collectionName))
			} else {
				xzap.WithContext(metadataCtx).Warn("[Fallback] FAILED - Could not fetch collection name",
					zap.Error(nameErr),
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()))
			}
			return
		}

		xzap.WithContext(metadataCtx).Info("[Step 2/3] SUCCESS - Got metadata from URI",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()),
			zap.String("metadata_name", metadata.Name),
			zap.String("metadata_image", metadata.Image))

		// 3. 如果 metadata 中有 name，使用 metadata 的 name；否则使用 collection name + tokenID
		finalName := metadata.Name
		if finalName == "" {
			xzap.WithContext(metadataCtx).Debug("Metadata name is empty, using fallback...",
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()))
			collectionName, _ := s.fetchCollectionName(metadataCtx, contractAddress)
			if collectionName != "" {
				finalName = fmt.Sprintf("%s #%s", collectionName, tokenId.String())
				xzap.WithContext(metadataCtx).Debug("Using collection name + tokenID",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("final_name", finalName))
			} else {
				finalName = defaultName
				xzap.WithContext(metadataCtx).Debug("Using default name",
					zap.String("contract", contractAddress),
					zap.String("token_id", tokenId.String()),
					zap.String("final_name", finalName))
			}
		}

		// 4. 更新数据库
		xzap.WithContext(metadataCtx).Info("[Step 3/3] Updating database with metadata...",
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()))
		metadata.Name = finalName
		if err := UpdateNFTMetadata(metadataCtx, s.db, s.chain, contractAddress, tokenId.String(), metadata); err != nil {
			xzap.WithContext(metadataCtx).Error("[Step 3/3] FAILED - Could not update database",
				zap.Error(err),
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()))
		} else {
			xzap.WithContext(metadataCtx).Info("[Step 3/3] SUCCESS - All operations completed!",
				zap.String("contract", contractAddress),
				zap.String("token_id", tokenId.String()),
				zap.String("name", finalName),
				zap.String("image_url", metadata.Image))
		}
	}()

	// 创建 Activity 记录
	newActivity := multi.Activity{
		ActivityType:      multi.Mint,
		Maker:             ZeroAddress,
		Taker:             owner,
		MarketplaceID:     multi.OrderBookDex,
		CollectionAddress: strings.ToLower(contractAddress),
		TokenId:           tokenId.String(),
		CurrencyAddress:   ZeroAddress,
		Price:             decimal.Zero,
		SellPrice:         decimal.Zero,
		BuyPrice:          decimal.Zero,
		BlockNumber:       int64(blockNumber),
		TxHash:            txHash,
		EventTime:         int64(blockTime),
	}

	if err := s.db.WithContext(s.ctx).Table(multi.ActivityTableName(s.chain)).
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&newActivity).Error; err != nil {
		xzap.WithContext(s.ctx).Warn("failed to create mint activity",
			zap.Error(err))
	}

	xzap.WithContext(s.ctx).Info("Successfully recorded minted NFT",
		zap.String("contract", contractAddress),
		zap.String("token_id", tokenId.String()),
		zap.String("owner", owner))
}

// handleBurnEvent 处理 Burn 事件
func (s *NFTIndexerService) handleBurnEvent(contractAddress string, tokenId *big.Int, from string, blockNumber uint64, txHash string, blockTime int64) {
	// 更新 NFT 状态为已销毁
	if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
		Where("collection_address = ? AND token_id = ?", strings.ToLower(contractAddress), tokenId.String()).
		Update("owner", ZeroAddress).Error; err != nil {
		xzap.WithContext(s.ctx).Error("failed to update burned NFT owner",
			zap.Error(err),
			zap.String("contract", contractAddress),
			zap.String("token_id", tokenId.String()))
		return
	}

	// Burn 事件已移除，统一在 handleTransferEventInternal 中处理
}

// handleTransferEventInternal 处理普通转账事件
func (s *NFTIndexerService) handleTransferEventInternal(contractAddress string, tokenId *big.Int, from string, to string, blockNumber uint64, txHash string, blockTime int64) {
	// 更新 NFT 所有者
	// if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
	// 	Where("collection_address = ? AND token_id = ?", strings.ToLower(contractAddress), tokenId.String()).
	// 	Update("owner", strings.ToLower(to)).Error; err != nil {
	// 	xzap.WithContext(s.ctx).Error("failed to update transferred NFT owner",
	// 		zap.Error(err),
	// 		zap.String("contract", contractAddress),
	// 		zap.String("token_id", tokenId.String()))
	// 	return
	// }

	// 创建 Activity 记录
	newActivity := multi.Activity{
		ActivityType:      multi.Transfer,
		Maker:             from,
		Taker:             to,
		MarketplaceID:     multi.OrderBookDex,
		CollectionAddress: strings.ToLower(contractAddress),
		TokenId:           tokenId.String(),
		CurrencyAddress:   ZeroAddress,
		Price:             decimal.Zero,
		SellPrice:         decimal.Zero,
		BuyPrice:          decimal.Zero,
		BlockNumber:       int64(blockNumber),
		TxHash:            txHash,
		EventTime:         int64(blockTime),
	}

	if err := s.db.WithContext(s.ctx).Table(multi.ActivityTableName(s.chain)).
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&newActivity).Error; err != nil {
		xzap.WithContext(s.ctx).Warn("failed to create transfer activity",
			zap.Error(err))
	}

	xzap.WithContext(s.ctx).Debug("Successfully recorded NFT transfer",
		zap.String("contract", contractAddress),
		zap.String("token_id", tokenId.String()),
		zap.String("from", from),
		zap.String("to", to))
}

// callContractStringMethod 调用合约的 string 类型 view 方法
func (s *NFTIndexerService) callContractStringMethod(ctx context.Context, contractAddress string, methodName string, args []interface{}) (string, error) {
	// 使用完整的 IERC721A ABI
	parsedAbi, err := abi.JSON(strings.NewReader(IERC721AABI))
	if err != nil {
		return "", errors.Wrap(err, "failed to parse IERC721A ABI")
	}

	// 编码调用数据
	data, err := parsedAbi.Pack(methodName, args...)
	if err != nil {
		return "", errors.Wrap(err, "failed to pack method call")
	}

	// 构造调用消息
	toAddr := common.HexToAddress(contractAddress)
	msg := ethereum.CallMsg{
		To:   &toAddr,
		Data: data,
	}

	// 调用合约
	resultBytes, err := s.chainClient.CallContract(ctx, msg, nil)
	if err != nil {
		return "", errors.Wrap(err, "failed to call contract")
	}

	// 解码返回结果
	var result string
	err = parsedAbi.UnpackIntoInterface(&result, methodName, resultBytes)
	if err != nil {
		return "", errors.Wrap(err, "failed to unpack result")
	}

	return result, nil
}

// fetchTokenURI 通过合约调用获取 tokenURI
func (s *NFTIndexerService) fetchTokenURI(ctx context.Context, contractAddress string, tokenId *big.Int) (string, error) {
	// ERC721 标准接口：function tokenURI(uint256 tokenId) external view returns (string)
	return s.callContractStringMethod(ctx, contractAddress, "tokenURI", []interface{}{tokenId})
}

// FetchTokenURI 公开方法：通过合约调用获取 tokenURI（供 MetadataUpdater 使用）
func (s *NFTIndexerService) FetchTokenURI(ctx context.Context, contract string, tokenId *big.Int) (string, error) {
	return s.fetchTokenURI(ctx, contract, tokenId)
}

// fetchCollectionName 通过合约调用获取 collection name
func (s *NFTIndexerService) fetchCollectionName(ctx context.Context, contractAddress string) (string, error) {
	// ERC721 标准接口：function name() external view returns (string)
	return s.callContractStringMethod(ctx, contractAddress, "name", []interface{}{})
}

// UpdateNFTNameOnly 仅更新 NFT 名称（不更新 metadata）
func UpdateNFTNameOnly(ctx context.Context, db *gorm.DB, chain string, collectionAddress string, tokenId string, name string) error {
	if name == "" {
		return errors.New("name is empty")
	}

	updates := map[string]interface{}{
		"name": name,
	}

	if err := db.WithContext(ctx).Table(multi.ItemTableName(chain)).
		Where("collection_address = ? AND token_id = ?", strings.ToLower(collectionAddress), tokenId).
		Updates(updates).Error; err != nil {
		return errors.Wrap(err, "failed to update NFT name")
	}

	xzap.WithContext(ctx).Debug("Updated NFT name only",
		zap.String("collection", collectionAddress),
		zap.String("token_id", tokenId),
		zap.String("name", name))

	return nil
}
