package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ProjectsTask/EasySwapBase/chain/chainclient"
	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/xkv"
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/kv"
	"github.com/zeromicro/go-zero/core/stores/redis"

	"github.com/ProjectsTask/EasySwapSync/service/config"
	"github.com/ProjectsTask/EasySwapSync/service/nftindexer"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// 这个脚本用于手动触发 NFT 元数据更新
// 使用方法：
//
//	go run scripts/update_metadata.go --collection=0x...
//	go run scripts/update_metadata.go --token-id=16
//	go run scripts/update_metadata.go --all
func main() {
	ctx := context.Background()

	// 加载配置文件
	cfg, err := config.UnmarshalConfig("config/config_import.toml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化日志
	if cfg.Log != nil {
		_, err = xzap.SetUp(*cfg.Log)
		if err != nil {
			log.Fatalf("Failed to setup logger: %v", err)
		}
	}

	// 解析命令行参数
	collection := ""
	if len(cfg.ContractCfg.NFTAddresses) > 0 {
		collection = cfg.ContractCfg.NFTAddresses[0]
	}
	tokenId := ""
	updateAll := true

	// if collection == "" && tokenId == "" && !updateAll {
	// 	fmt.Println("Usage:")
	// 	fmt.Println("  Update specific collection: COLLECTION_ADDRESS=0x... go run cmd/update_metadata.go")
	// 	fmt.Println("  Update specific token: COLLECTION_ADDRESS=0x... TOKEN_ID=16 go run cmd/update_metadata.go")
	// 	fmt.Println("  Update all missing: UPDATE_ALL=true go run cmd/update_metadata.go")
	// 	fmt.Println()
	// 	fmt.Println("Examples:")
	// 	fmt.Println("  COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF go run cmd/update_metadata.go")
	// 	fmt.Println("  COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF TOKEN_ID=16 go run cmd/update_metadata.go")
	// 	fmt.Println("  UPDATE_ALL=true go run cmd/update_metadata.go")
	// 	os.Exit(1)
	// }

	// 初始化数据库连接
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "easyswap:shanmu@123@tcp(127.0.0.1:3306)/easyswap?charset=utf8mb4&parseTime=True&loc=Local"
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("✅ Connected to database", collection, tokenId)

	// 初始化 chainClient
	var chainClient chainclient.ChainClient
	rpcURL := cfg.AnkrCfg.HttpsUrl + cfg.AnkrCfg.ApiKey
	fmt.Printf("Initializing chain client with RPC URL: %s\n", rpcURL)
	chainClient, err = chainclient.New(int(cfg.ChainCfg.ID), rpcURL)
	if err != nil {
		fmt.Printf("⚠️  WARNING: Failed to initialize chain client: %v\n", err)
		fmt.Println("   Metadata updates from blockchain will be skipped.")
		chainClient = nil
	} else {
		fmt.Println("✅ Chain client initialized successfully")
	}

	// 初始化 KV Store（NFTIndexerService 需要）
	var kvStore *xkv.Store
	if cfg.Kv != nil && len(cfg.Kv.Redis) > 0 {
		var kvConf kv.KvConf
		for _, con := range cfg.Kv.Redis {
			kvConf = append(kvConf, cache.NodeConf{
				RedisConf: redis.RedisConf{
					Host: con.Host,
					Type: con.Type,
					Pass: con.Pass,
				},
				Weight: 2,
			})
		}
		kvStore = xkv.NewStore(kvConf)
		fmt.Println("✅ KV store initialized")
	} else {
		fmt.Println("⚠️  WARNING: KV config is empty, creating dummy KV store")
		kvStore = xkv.NewStore(nil)
	}

	// 创建 NFTIndexerService
	nftService := nftindexer.New(ctx, cfg, db, kvStore, chainClient, cfg.ChainCfg.ID, cfg.ChainCfg.Name)
	fmt.Println("✅ NFTIndexerService created")

	// 创建 MetadataUpdater（传入 NFTIndexerService）
	updater := nftindexer.NewMetadataUpdater(db, nftService, 11155111, "sepolia")
	updater.SetParallelism(5)
	updater.SetTimeout(30 * time.Second)

	if updateAll {
		// 更新所有缺失的元数据
		fmt.Println("Starting bulk metadata update...")
		xzap.WithContext(ctx).Info("Starting bulk metadata update...")
		count, err := updater.UpdateAllMissingMetadata(ctx)
		if err != nil {
			fmt.Printf("Bulk update failed: %v\n", err)
			xzap.WithContext(ctx).Error("Bulk update failed", zap.Error(err))
			os.Exit(1)
		}
		fmt.Printf("Bulk update completed. Updated %d items.\n", count)
		xzap.WithContext(ctx).Info("Bulk update completed", zap.Int("updated_count", count))

	} else if tokenId != "" {
		// 更新特定 NFT
		fmt.Printf("Updating specific NFT metadata: collection=%s, token_id=%s\n", collection, tokenId)
		xzap.WithContext(ctx).Info("Updating specific NFT metadata",
			zap.String("collection", collection),
			zap.String("token_id", tokenId))

		err := updater.UpdateSpecificNFT(ctx, collection, tokenId)
		if err != nil {
			fmt.Printf("Update failed: %v\n", err)
			xzap.WithContext(ctx).Error("Update failed", zap.Error(err))
			os.Exit(1)
		}
		fmt.Println("Update completed")
		xzap.WithContext(ctx).Info("Update completed")

	} else if collection != "" {
		// 更新整个 Collection
		fmt.Printf("Updating collection metadata: %s\n", collection)
		xzap.WithContext(ctx).Info("Updating collection metadata",
			zap.String("collection", collection))

		count, err := updater.UpdateByCollection(ctx, collection)
		if err != nil {
			fmt.Printf("Collection update failed: %v\n", err)
			xzap.WithContext(ctx).Error("Collection update failed", zap.Error(err))
			os.Exit(1)
		}
		fmt.Printf("Collection update completed. Updated %d items.\n", count)
		xzap.WithContext(ctx).Info("Collection update completed", zap.Int("updated_count", count))
	} else {
		fmt.Println("No action specified. Use --collection, --token-id, or --all flag")
	}
}
