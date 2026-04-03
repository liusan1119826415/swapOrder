package nftindexer

import (
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/multi"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"
)

// MetadataUpdater 元数据更新器配置
type MetadataUpdater struct {
	db          *gorm.DB
	nftService  *NFTIndexerService // NFT 索引服务实例
	chainId     int64
	chain       string
	batchSize   int           // 每批处理的 NFT 数量
	parallelism int           // 并发数
	timeout     time.Duration // 单个 NFT 超时时间
	interval    time.Duration // 执行间隔
}

// NewMetadataUpdater 创建元数据更新器
func NewMetadataUpdater(
	db *gorm.DB,
	nftService *NFTIndexerService,
	chainId int64,
	chain string,
) *MetadataUpdater {
	return &MetadataUpdater{
		db:          db,
		nftService:  nftService,
		chainId:     chainId,
		chain:       chain,
		batchSize:   50,               // 默认每批 50 个
		parallelism: 5,                // 默认 5 个并发
		timeout:     30 * time.Second, // 单个 NFT 超时 30 秒
		interval:    1 * time.Hour,    // 默认每小时执行一次
	}
}

// SetBatchSize 设置批次大小
func (u *MetadataUpdater) SetBatchSize(size int) {
	u.batchSize = size
}

// SetParallelism 设置并发数
func (u *MetadataUpdater) SetParallelism(count int) {
	u.parallelism = count
}

// SetTimeout 设置超时时间
func (u *MetadataUpdater) SetTimeout(timeout time.Duration) {
	u.timeout = timeout
}

// SetInterval 设置执行间隔
func (u *MetadataUpdater) SetInterval(interval time.Duration) {
	u.interval = interval
}

// Start 启动定时更新任务
func (u *MetadataUpdater) Start(ctx context.Context) {
	xzap.WithContext(ctx).Info("Starting NFT metadata updater",
		zap.Int("batch_size", u.batchSize),
		zap.Int("parallelism", u.parallelism),
		zap.Duration("timeout", u.timeout),
		zap.Duration("interval", u.interval))

	ticker := time.NewTicker(u.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			xzap.WithContext(ctx).Info("NFT metadata updater stopped")
			return
		case <-ticker.C:
			xzap.WithContext(ctx).Info("Starting scheduled NFT metadata update...")
			count, err := u.UpdateAllMissingMetadata(ctx)
			if err != nil {
				xzap.WithContext(ctx).Error("Failed to update NFT metadata", zap.Error(err))
			} else {
				xzap.WithContext(ctx).Info("Completed NFT metadata update", zap.Int("updated_count", count))
			}
		}
	}
}

// UpdateAllMissingMetadata 更新所有缺失元数据的 NFT
func (u *MetadataUpdater) UpdateAllMissingMetadata(ctx context.Context) (int, error) {
	// 查询所有 image_url 或 name 为空的 NFT
	var items []multi.Item
	query := u.db.WithContext(ctx).Table(multi.ItemTableName(u.chain)).
		Where("(image_url = '' OR image_url IS NULL) OR (name = '' OR name LIKE ?)", "%#%").
		Limit(u.batchSize).
		Find(&items)

	if query.Error != nil {
		return 0, errors.Wrap(query.Error, "failed to query items")
	}

	if len(items) == 0 {
		xzap.WithContext(ctx).Info("No items need metadata update")
		return 0, nil
	}

	xzap.WithContext(ctx).Info("Found items needing metadata update", zap.Int("count", len(items)))

	// 分批并发处理
	totalUpdated := 0
	eg, egCtx := errgroup.WithContext(ctx)
	sem := make(chan struct{}, u.parallelism)

	for _, item := range items {
		item := item // capture loop variable
		sem <- struct{}{}

		eg.Go(func() error {
			defer func() { <-sem }()

			select {
			case <-egCtx.Done():
				return egCtx.Err()
			default:
				updated, err := u.updateSingleNFTMetadata(egCtx, item)
				if err != nil {
					xzap.WithContext(egCtx).Warn("Failed to update single NFT metadata",
						zap.String("collection", item.CollectionAddress),
						zap.String("token_id", item.TokenId),
						zap.Error(err))
					return nil // 不返回错误，继续处理其他 NFT
				}
				if updated {
					totalUpdated++
				}
				return nil
			}
		})
	}

	err := eg.Wait()
	return totalUpdated, err
}

// updateSingleNFTMetadata 更新单个 NFT 的元数据
func (u *MetadataUpdater) updateSingleNFTMetadata(ctx context.Context, item multi.Item) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, u.timeout)
	defer cancel()

	collectionAddress := item.CollectionAddress
	tokenId := item.TokenId

	xzap.WithContext(ctx).Debug("Processing NFT metadata update",
		zap.String("collection", collectionAddress),
		zap.String("token_id", tokenId))

	// 1. 从合约获取 tokenURI
	tokenIDBig, ok := new(big.Int).SetString(tokenId, 10)
	if !ok {
		return false, fmt.Errorf("invalid token_id: %s", tokenId)
	}

	// 调用 NFTIndexerService 的 fetchTokenURI 方法
	var tokenURI string
	var err error

	if u.nftService != nil {
		tokenURI, err = u.nftService.fetchTokenURI(ctx, collectionAddress, tokenIDBig)
		xzap.WithContext(ctx).Debug("Fetched tokenURI from contract",
			zap.String("collection", collectionAddress),
			zap.String("token_id", tokenId),
			zap.String("token_uri", tokenURI))
		if err != nil {
			xzap.WithContext(ctx).Warn("Failed to fetch tokenURI from contract",
				zap.String("collection", collectionAddress),
				zap.String("token_id", tokenId),
				zap.Error(err))
			return false, err
		}
	} else {
		// 如果没有 nftService，无法获取 tokenURI
		xzap.WithContext(ctx).Warn("NFTIndexerService is nil, cannot fetch tokenURI")
		return false, nil
	}

	if tokenURI == "" {
		xzap.WithContext(ctx).Debug("Token URI is empty, trying fallback",
			zap.String("collection", collectionAddress),
			zap.String("token_id", tokenId))
		// 可以尝试使用 collection name + tokenID 作为 fallback
		return false, nil
	}

	// 2. 从 tokenURI 获取 metadata
	metadata, err := FetchNFTMetadata(ctx, tokenURI)
	if err != nil {
		xzap.WithContext(ctx).Warn("Failed to fetch metadata from URI",
			zap.String("collection", collectionAddress),
			zap.String("token_id", tokenId),
			zap.String("token_uri", tokenURI),
			zap.Error(err))
		// 不立即返回错误，尝试使用 collection name 作为 fallback
		xzap.WithContext(ctx).Info("Trying fallback: fetching collection name only...")
		collectionName, nameErr := u.nftService.fetchCollectionName(ctx, collectionAddress)
		if nameErr == nil && collectionName != "" {
			// Fallback 成功：仅更新 collection name
			finalName := fmt.Sprintf("%s #%s", collectionName, tokenId)
			updateErr := UpdateNFTNameOnly(ctx, u.db, u.chain, collectionAddress, tokenId, finalName)
			if updateErr != nil {
				xzap.WithContext(ctx).Warn("Failed to update NFT name with fallback",
					zap.String("collection", collectionAddress),
					zap.String("token_id", tokenId),
					zap.Error(updateErr))
				return false, updateErr
			}
			xzap.WithContext(ctx).Info("Fallback succeeded: updated with collection name",
				zap.String("collection", collectionAddress),
				zap.String("token_id", tokenId),
				zap.String("collection_name", collectionName))
			return true, nil
		} else {
			xzap.WithContext(ctx).Warn("Fallback also failed: could not fetch collection name",
				zap.String("collection", collectionAddress),
				zap.String("token_id", tokenId),
				zap.Error(nameErr))
			// Fallback 失败，等待下次重试
			return false, nil
		}
	}

	xzap.WithContext(ctx).Debug("Successfully fetched metadata from URI",
		zap.String("collection", collectionAddress),
		zap.String("token_id", tokenId),
		zap.String("metadata_name", metadata.Name),
		zap.String("metadata_image", metadata.Image))

	// 3. 更新数据库
	name := metadata.Name
	if name == "" {
		// 如果 metadata 中没有 name，使用 collection address + tokenID
		name = fmt.Sprintf("NFT #%s", tokenId)
	}

	imageURL := metadata.Image
	if imageURL == "" {
		imageURL = "" // 保持为空，下次继续尝试
	}

	// 构建更新数据
	updates := map[string]interface{}{
		"name":      name,
		"image_url": imageURL,
	}

	updateQuery := u.db.WithContext(ctx).Table(multi.ItemTableName(u.chain)).
		Where("collection_address = ? AND token_id = ?", strings.ToLower(collectionAddress), tokenId).
		Updates(updates)

	if updateQuery.Error != nil {
		return false, errors.Wrap(updateQuery.Error, "failed to update database")
	}

	if updateQuery.RowsAffected > 0 {
		xzap.WithContext(ctx).Info("Successfully updated NFT metadata",
			zap.String("collection", collectionAddress),
			zap.String("token_id", tokenId),
			zap.String("name", name),
			zap.String("image_url", imageURL))
		return true, nil
	}

	return false, nil
}

// UpdateSpecificNFT 更新指定 NFT 的元数据（手动调用）
func (u *MetadataUpdater) UpdateSpecificNFT(ctx context.Context, collectionAddress, tokenId string) error {
	item := multi.Item{
		ChainId:           int(u.chainId),
		CollectionAddress: strings.ToLower(collectionAddress),
		TokenId:           tokenId,
	}

	_, err := u.updateSingleNFTMetadata(ctx, item)
	return err
}

// UpdateByCollection 更新整个 Collection 的 NFT 元数据
func (u *MetadataUpdater) UpdateByCollection(ctx context.Context, collectionAddress string) (int, error) {
	var items []multi.Item
	query := u.db.WithContext(ctx).Table(multi.ItemTableName(u.chain)).
		Where("collection_address = ?", strings.ToLower(collectionAddress)).
		Find(&items)

	if query.Error != nil {
		return 0, errors.Wrap(query.Error, "failed to query collection items")
	}

	xzap.WithContext(ctx).Info("Updating collection metadata",
		zap.String("collection", collectionAddress),
		zap.Int("total_items", len(items)))

	updatedCount := 0
	for _, item := range items {
		updated, err := u.updateSingleNFTMetadata(ctx, item)
		if err != nil {
			xzap.WithContext(ctx).Warn("Failed to update item in collection",
				zap.String("token_id", item.TokenId),
				zap.Error(err))
			continue
		}
		if updated {
			updatedCount++
		}
	}

	return updatedCount, nil
}
