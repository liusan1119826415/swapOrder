package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/ProjectsTask/EasySwapBackend/src/models"
	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// GetAnalytics 获取市场分析数据
func GetAnalytics(ctx context.Context, svcCtx *svc.ServerCtx, filter types.AnalyticsFilterParams) (*types.AnalyticsResponse, error) {
	// TODO: 从数据库查询真实的统计数据
	// 目前返回基础结构，后续完善

	return &types.AnalyticsResponse{
		Stats:          &types.AnalyticsStats{},
		TopCollections: []*types.TopCollection{},
		TrendingNow:    []*types.TopCollection{},
		NewCollections: []*types.TopCollection{},
	}, nil
}

// GetCreators 获取创作者/艺术家列表
func GetCreators(ctx context.Context, svcCtx *svc.ServerCtx, chain string, page, pageSize int) ([]*types.ArtistRanking, int64, error) {
	// TODO: 从数据库查询真实的创作者数据
	// 1. 查询所有 creator 信息
	// 2. 按 total_volume 排序
	// 3. 计算变化率

	return []*types.ArtistRanking{}, 0, nil
}

// GetAuctions 获取拍卖列表
func GetAuctions(ctx context.Context, svcCtx *svc.ServerCtx, chain int, filter types.AuctionsFilterParams) (*types.AuctionsResponse, error) {
	// 动态表名：ob_collection_sepolia, ob_items_sepolia 等
	chanName := chainIDToChainName(chain)
	collectionTable := "ob_collection_" + chanName
	itemsTable := "ob_item_" + chanName

	// 构建查询条件
	query := svcCtx.DB.Table("ob_auction a").
		Select(`
			a.*,
			c.name as collection_name,
			c.image_uri as collection_image,
			i.name as item_name
		`).
		Joins("LEFT JOIN "+collectionTable+" c ON a.collection_address = c.address AND a.chain_id = c.chain_id").
		Joins("LEFT JOIN "+itemsTable+" i ON a.collection_address = i.collection_address AND a.token_id = i.token_id AND a.chain_id = i.chain_id").
		Where("a.chain_id = ?", chain)

	// 状态过滤
	if filter.Status != "" {
		switch filter.Status {
		case "active":
			query = query.Where("a.status = ? AND a.end_time > ?", 0, time.Now().Unix())
		case "ending_soon":
			now := time.Now().Unix()
			endTimeSoon := now + 24*3600 // 24 小时内结束
			query = query.Where("a.status = ? AND a.end_time > ? AND a.end_time < ?", 0, now, endTimeSoon)
		case "ended":
			query = query.Where("a.status IN ? OR a.end_time <= ?", []int{1, 3}, time.Now().Unix())
		}
	}

	// 链 ID 过滤
	if len(filter.ChainID) > 0 {
		query = query.Where("a.chain_id IN ?", filter.ChainID)
	}

	// 集合地址过滤
	if len(filter.CollectionAddrs) > 0 {
		query = query.Where("a.collection_address IN ?", filter.CollectionAddrs)
	}

	// 用户地址过滤（创建或参与）
	if filter.UserAddress != "" {
		query = query.Where("a.seller = ? OR a.highest_bidder = ?", filter.UserAddress, filter.UserAddress)
	}

	// 价格过滤
	if filter.PriceMin != "" {
		minPrice, _ := decimal.NewFromString(filter.PriceMin)
		query = query.Where("a.current_bid >= ?", minPrice)
	}
	if filter.PriceMax != "" {
		maxPrice, _ := decimal.NewFromString(filter.PriceMax)
		query = query.Where("a.current_bid <= ?", maxPrice)
	}

	// 调试：打印生成的 SQL
	debugSQL(query)

	// 计算总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("count auctions error: %w", err)
	}

	// 分页
	offset := (filter.Page - 1) * filter.PageSize
	query = query.Offset(offset).Limit(filter.PageSize)

	// 排序（默认按结束时间排序）
	query = query.Order("a.end_time ASC")

	// 执行查询
	type AuctionWithDetails struct {
		models.Auction
		CollectionName  string `gorm:"column:collection_name"`
		CollectionImage string `gorm:"column:collection_image"`
		ItemName        string `gorm:"column:item_name"`
		ItemImage       string `gorm:"column:item_image"`
	}

	var auctions []AuctionWithDetails
	if err := query.Scan(&auctions).Error; err != nil {
		return nil, fmt.Errorf("scan auctions error: %w", err)
	}

	// 转换为响应格式
	result := make([]*types.AuctionInfo, 0, len(auctions))
	for _, auction := range auctions {
		statusStr := "active"
		if auction.Status == 1 || auction.Status == 3 {
			statusStr = "ended"
		} else if auction.Status == 2 {
			statusStr = "cancelled"
		}

		result = append(result, &types.AuctionInfo{
			AuctionID:      auction.AuctionID,
			ItemName:       auction.ItemName,
			ItemImage:      auction.ItemImage,
			CollectionName: auction.CollectionName,
			CollectionAddr: auction.CollectionAddress,
			TokenID:        auction.TokenID,
			Seller:         auction.Seller,
			HighestBidder:  auction.HighestBidder,
			CurrentBid:     auction.CurrentBid,
			ReservePrice:   auction.ReservePrice,
			StartPrice:     auction.StartPrice,
			BidCount:       auction.BidCount,
			StartTime:      auction.StartTime,
			EndTime:        auction.EndTime,
			Status:         statusStr,
			ChainID:        int(auction.ChainID),
		})
	}

	return &types.AuctionsResponse{
		Result: result,
		Total:  total,
	}, nil
}

// GetDrops 获取新品发布列表
func GetDrops(ctx context.Context, svcCtx *svc.ServerCtx, chain string, filter types.DropsFilterParams) (*types.DropsResponse, error) {
	// 构建查询条件
	query := svcCtx.DB.Table("ob_drop").
		Where("chain_name = ?", chain)

	// 状态过滤
	if filter.Status != "" {
		switch filter.Status {
		case "upcoming":
			now := time.Now().Unix()
			query = query.Where("status = ? AND mint_start_time > ?", 0, now)
		case "live":
			now := time.Now().Unix()
			query = query.Where("status = ? AND mint_start_time <= ? AND mint_end_time > ?", 1, now, now)
		case "sold_out":
			query = query.Where("status = ?", 2)
		case "ended":
			query = query.Where("status = ? OR mint_end_time <= ?", 3, time.Now().Unix())
		}
	}

	// 链 ID 过滤
	if len(filter.ChainID) > 0 {
		query = query.Where("chain_id IN ?", filter.ChainID)
	}

	// 分类过滤
	if len(filter.Categories) > 0 {
		categoryPattern := "%" + strings.Join(filter.Categories, "%") + "%"
		query = query.Where("categories LIKE ?", categoryPattern)
	}

	// 调试：打印生成的 SQL
	debugSQL(query)

	// 计算总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("count drops error: %w", err)
	}

	// 分页
	offset := (filter.Page - 1) * filter.PageSize
	query = query.Offset(offset).Limit(filter.PageSize)

	// 排序
	switch filter.SortBy {
	case "minted_count":
		if filter.SortOrder == "desc" {
			query = query.Order("items_minted DESC")
		} else {
			query = query.Order("items_minted ASC")
		}
	default: // start_time
		if filter.SortOrder == "desc" {
			query = query.Order("mint_start_time DESC")
		} else {
			query = query.Order("mint_start_time ASC")
		}
	}

	// 执行查询
	var drops []models.Drop
	if err := query.Find(&drops).Error; err != nil {
		return nil, fmt.Errorf("find drops error: %w", err)
	}

	// 转换为响应格式
	result := make([]*types.DropInfo, 0, len(drops))
	for _, drop := range drops {
		statusStr := "upcoming"
		switch drop.Status {
		case 1:
			statusStr = "live"
		case 2:
			statusStr = "sold_out"
		case 3:
			statusStr = "ended"
		}

		// 解析分类
		categories := []string{}
		if drop.Categories != "" {
			categories = strings.Split(drop.Categories, ",")
		}

		result = append(result, &types.DropInfo{
			DropID:         drop.DropID,
			CollectionName: drop.CollectionName,
			CollectionAddr: drop.CollectionAddress,
			Logo:           drop.LogoURI,
			Banner:         drop.BannerURI,
			Creator:        drop.CreatorAddress,
			CreatorName:    drop.CreatorName,
			IsVerified:     drop.IsVerified == 1,
			Description:    drop.Description,
			TotalSupply:    drop.TotalSupply,
			ItemsMinted:    drop.ItemsMinted,
			Price:          drop.Price.String(),
			MintStartTime:  drop.MintStartTime,
			MintEndTime:    drop.MintEndTime,
			Status:         statusStr,
			ChainID:        int(drop.ChainID),
			Categories:     categories,
		})
	}

	return &types.DropsResponse{
		Result: result,
		Total:  total,
	}, nil
}

// debugSQL 调试打印 SQL 语句和参数
func debugSQL(query *gorm.DB) {
	// 获取执行的 SQL
	db := query.Session(&gorm.Session{DryRun: true})
	result := db.Find(nil)
	if result.Error == nil {
		sql := result.Statement.SQL.String()
		vars := result.Statement.Vars
		fmt.Printf("=== SQL Debug ===\n")
		fmt.Printf("SQL: %s\n", sql)
		fmt.Printf("Vars: %+v\n", vars)
		fmt.Printf("=================\n")
	}
}

// Helper function - 链 ID 转链名称
func chainIDToChainName(chainID int) string {
	chainMap := map[int]string{
		1:        "eth",
		10:       "optimism",
		11155111: "sepolia",
	}
	if name, ok := chainMap[chainID]; ok {
		return name
	}
	return ""
}
