# NFT Mint 同步功能补充

## 问题描述

当前的 `EasySwapSync/service/orderbookindexer/service.go` 只监听了订单簿相关的事件：
- LogMake (挂单)
- LogCancel (取消)
- LogMatch (撮合)

**但是缺少监听 NFT 的 Mint（铸造）事件！**

这导致用户通过前端 Mint 的 NFT 无法自动同步到数据库的 `ob_item_sepolia` 表中。

## 解决方案

### 方案 1: 添加 ERC721/ERC721A Transfer 事件监听（推荐）

在 `service.go` 中添加：

```go
// 添加 Transfer 事件的 Topic
const (
    TransferTopic  = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" // ERC721 Transfer
)

// 在 SyncOrderBookEventLoop 中添加 Transfer 事件处理
switch ethLog.Topics[0].String() {
case LogMakeTopic:
    s.handleMakeEvent(ethLog)
case LogCancelTopic:
    s.handleCancelEvent(ethLog)
case LogMatchTopic:
    s.handleMatchEvent(ethLog)
case TransferTopic:
    s.handleTransferEvent(ethLog)  // 新增：处理 NFT Transfer/Mint 事件
default:
}

// 新增：处理 Transfer 事件（包括 Mint）
func (s *Service) handleTransferEvent(log ethereumTypes.Log) {
    // Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    from := common.BytesToAddress(log.Topics[1].Bytes())
    to := common.BytesToAddress(log.Topics[2].Bytes())
    tokenId := new(big.Int).SetBytes(log.Topics[3].Bytes()).String()
    
    // 如果 from 是零地址，说明是 Mint 事件
    if from == common.HexToAddress("0x0000000000000000000000000000000000000000") {
        s.handleMintEvent(log, to, tokenId)
    } else {
        // 普通转账，更新 owner 字段
        s.updateItemOwner(log, to, tokenId)
    }
}

// 处理 Mint 事件
func (s *Service) handleMintEvent(log ethereumTypes.Log, minter common.Address, tokenId string) {
    collectionAddr := log.Address.String()
    
    // 1. 查询 Collection 是否存在，不存在则创建
    var collection multi.Collection
    result := s.db.WithContext(s.ctx).Table(multi.CollectionTableName(s.chain)).
        Where("address = ?", strings.ToLower(collectionAddr)).
        First(&collection)
    
    if result.Error == gorm.ErrRecordNotFound {
        // Collection 不存在，需要查询链上信息
        name, symbol, err := s.queryCollectionMetadata(collectionAddr)
        if err != nil {
            xzap.WithContext(s.ctx).Error("failed to query collection metadata",
                zap.Error(err))
            return
        }
        
        // 创建 Collection 记录
        newCollection := multi.Collection{
            ChainID:   int(s.chainId),
            Name:      name,
            Symbol:    symbol,
            Address:   strings.ToLower(collectionAddr),
            ItemCount: 1,
            OwnerAmount: 1,
        }
        
        if err := s.db.WithContext(s.ctx).Table(multi.CollectionTableName(s.chain)).
            Create(&newCollection).Error; err != nil {
            xzap.WithContext(s.ctx).Error("failed to create collection",
                zap.Error(err))
            return
        }
    } else if result.Error != nil {
        xzap.WithContext(s.ctx).Error("failed to query collection",
            zap.Error(result.Error))
        return
    }
    
    // 2. 查询 Item 是否已存在
    var item multi.Item
    if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
        Where("collection_address = ? AND token_id = ?", 
            strings.ToLower(collectionAddr), tokenId).
        First(&item).Error; err != nil {
        
        if err == gorm.ErrRecordNotFound {
            // Item 不存在，创建新记录
            newItem := multi.Item{
                ChainID:           int(s.chainId),
                TokenID:           tokenId,
                Name:              fmt.Sprintf("NFT #%s", tokenId), // 临时名称
                Owner:             strings.ToLower(minter.String()),
                CollectionAddress: strings.ToLower(collectionAddr),
                Creator:           strings.ToLower(minter.String()),
                Supply:            1,
            }
            
            if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
                Create(&newItem).Error; err != nil {
                xzap.WithContext(s.ctx).Error("failed to create item",
                    zap.Error(err))
                return
            }
            
            // 同时创建 External 记录（用于存储图片等元数据）
            itemExternal := multi.ItemExternal{
                CollectionAddress: strings.ToLower(collectionAddr),
                TokenID:          tokenId,
            }
            
            if err := s.db.WithContext(s.ctx).Table(multi.ItemExternalTableName(s.chain)).
                Create(&itemExternal).Error; err != nil {
                xzap.WithContext(s.ctx).Warn("failed to create item external",
                    zap.Error(err))
            }
            
            // 3. 记录 Mint 活动
            blockTime, err := s.chainClient.BlockTimeByNumber(
                s.ctx, big.NewInt(int64(log.BlockNumber)))
            if err != nil {
                xzap.WithContext(s.ctx).Error("failed to get block time", 
                    zap.Error(err))
                return
            }
            
            mintActivity := multi.Activity{
                ActivityType:      multi.Mint, // activity_type = 2
                Maker:             strings.ToLower(minter.String()),
                Taker:             ZeroAddress,
                MarketplaceID:     multi.MarketOrderBook,
                CollectionAddress: strings.ToLower(collectionAddr),
                TokenID:           tokenId,
                CurrencyAddress:   s.cfg.ContractCfg.EthAddress,
                Price:             decimal.Zero,
                BlockNumber:       int64(log.BlockNumber),
                TxHash:            log.TxHash.String(),
                EventTime:         int64(blockTime),
            }
            
            if err := s.db.WithContext(s.ctx).Table(multi.ActivityTableName(s.chain)).
                Clauses(clause.OnConflict{DoNothing: true}).
                Create(&mintActivity).Error; err != nil {
                xzap.WithContext(s.ctx).Warn("failed to create mint activity",
                    zap.Error(err))
            }
            
            xzap.WithContext(s.ctx).Info("Mint event processed successfully",
                zap.String("collection", collectionAddr),
                zap.String("token_id", tokenId),
                zap.String("minter", minter.String()))
        }
    }
}

// 更新 Item 所有者
func (s *Service) updateItemOwner(log ethereumTypes.Log, newOwner common.Address, tokenId string) {
    collectionAddr := log.Address.String()
    
    if err := s.db.WithContext(s.ctx).Table(multi.ItemTableName(s.chain)).
        Where("collection_address = ? AND token_id = ?", 
            strings.ToLower(collectionAddr), tokenId).
        Update("owner", strings.ToLower(newOwner.String())).Error; err != nil {
        xzap.WithContext(s.ctx).Error("failed to update item owner",
            zap.Error(err))
        return
    }
    
    xzap.WithContext(s.ctx).Debug("Item owner updated",
        zap.String("collection", collectionAddr),
        zap.String("token_id", tokenId),
        zap.String("new_owner", newOwner.String()))
}

// 查询 Collection 元数据（从链上）
func (s *Service) queryCollectionMetadata(collectionAddr string) (string, string, error) {
    // 这里需要通过 RPC 调用合约的 name() 和 symbol() 方法
    // 可以使用 chainclient 提供的 CallContract 功能
    // 简化版本可以先返回默认值
    
    return "Unknown Collection", "UNK", nil
}
```

### 方案 2: 使用独立的 NFT Indexer（更彻底）

创建一个专门的 NFT 索引服务，独立于订单簿同步：

```
EasySwapSync/
├── service/
│   ├── orderbookindexer/    # 现有的订单簿同步
│   ├── nftindexer/         # 新增：NFT 索引服务
│   │   ├── service.go
│   │   └── metadata.go
│   └── service.go
```

### 方案 3: 手动导入（临时方案）

如果只是测试，可以手动在数据库中添加 Mint 记录：

```sql
-- 1. 添加 Collection（如果不存在）
INSERT INTO ob_collection_sepolia 
(symbol, chain_id, auth, token_standard, name, creator, address, 
 owner_amount, item_amount, create_time, update_time)
VALUES 
('TEST', 11155111, 1, 721, 'Test Collection', 
 '0xYourAddress', '0x609f6127D6F08119A351645b246Ba771c7c7A762', 
 1, 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

-- 2. 添加 Item（你 Mint 的 NFT）
INSERT INTO ob_item_sepolia 
(chain_id, token_id, name, owner, collection_address, creator, supply, 
 create_time, update_time)
VALUES 
(11155111, '1', 'My Minted NFT', 
 '0xYourAddress', '0x609f6127D6F08119A351645b246Ba771c7c7A762', 
 '0xYourAddress', 1, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

-- 3. 添加 Mint 活动记录
INSERT INTO ob_activity_sepolia 
(activity_type, maker, taker, marketplace_id, collection_address, 
 token_id, currency_address, price, block_number, tx_hash, event_time, 
 create_time, update_time)
VALUES 
(2, -- Mint 类型
 '0xYourAddress', '0x0000000000000000000000000000000000000000', 
 0, '0x609f6127D6F08119A351645b246Ba771c7c7A762', '1', 
 '1', 0, 区块号，'0xYourTxHash', UNIX_TIMESTAMP(), 
 UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);
```

## 推荐实施步骤

1. **短期（立即解决）**：使用方案 3 手动添加数据
2. **中期**：实施方案 1，添加 Transfer 事件监听
3. **长期**：实施方案 2，创建独立的 NFT Indexer 服务

## 注意事项

⚠️ **重要**：
- Mint 逻辑需要处理 ERC721A 的批量铸造（一次 mint 多个 NFT）
- 需要考虑 Metadata 的异步获取（IPFS/HTTP）
- 需要处理 Collection 的增量更新（ItemCount, OwnerAmount）
- 对于测试网，可以考虑使用 OpenSea API 或其他第三方 API 辅助同步
