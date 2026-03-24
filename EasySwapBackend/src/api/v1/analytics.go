package v1

import (
	"encoding/json"

	"github.com/ProjectsTask/EasySwapBase/errcode"
	"github.com/ProjectsTask/EasySwapBase/xhttp"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
)

// GetAnalyticsHandler 获取市场分析数据
func GetAnalyticsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取过滤参数
		filterParam := c.Query("filters")

		var filter types.AnalyticsFilterParams
		if filterParam != "" {
			err := json.Unmarshal([]byte(filterParam), &filter)
			if err != nil {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
		}

		// 设置默认值
		if filter.Period == "" {
			filter.Period = "1d"
		}
		if filter.Limit == 0 {
			filter.Limit = 10
		}

		// 如果未指定链 ID，使用所有支持的链
		if len(filter.ChainID) == 0 {
			for _, chain := range svcCtx.C.ChainSupported {
				filter.ChainID = append(filter.ChainID, chain.ChainID)
			}
		}

		// TODO: 调用服务层获取分析数据
		// result, err := service.GetAnalytics(c.Request.Context(), svcCtx, filter)
		// if err != nil {
		// 	xhttp.Error(c, errcode.NewCustomErr("Failed to get analytics data"))
		// 	return
		// }

		// 暂时返回模拟数据
		mockResponse := &types.AnalyticsResponse{
			Stats: &types.AnalyticsStats{
				TotalVolume:      "45200",
				TotalVolumeUSD:   "128,500,000",
				TotalSales:       128500,
				ActiveUsers:      25800,
				AveragePrice:     "0.35",
				AveragePriceUSD:  "990.50",
				MarketCap:        "890000",
				MarketCapUSD:     "2,520,000,000",
				TotalCollections: 1250,
				TotalItems:       458000,
			},
			TopCollections: []*types.TopCollection{
				{
					Rank:         1,
					Name:         "CyberGlow Enclave",
					Address:      "0x1234567890abcdef1",
					Volume:       "2400",
					VolumeChange: 24.5,
					Sales:        1250,
					FloorPrice:   "2.45",
					Owners:       850,
					Items:        5000,
					Logo:         "https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=200&h=200&fit=crop",
					IsVerified:   true,
				},
				{
					Rank:         2,
					Name:         "Voxel Verse Labs",
					Address:      "0x1234567890abcdef2",
					Volume:       "1800",
					VolumeChange: 18.9,
					Sales:        890,
					FloorPrice:   "5.12",
					Owners:       620,
					Items:        3000,
					Logo:         "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=200&h=200&fit=crop",
					IsVerified:   true,
				},
			},
			TrendingNow:    []*types.TopCollection{},
			NewCollections: []*types.TopCollection{},
		}

		xhttp.OkJson(c, mockResponse)
	}
}

// GetArtistsHandler 获取艺术家/创作者列表
func GetArtistsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取过滤参数
		filterParam := c.Query("filters")

		var filter types.ArtistsFilterParams
		if filterParam != "" {
			err := json.Unmarshal([]byte(filterParam), &filter)
			if err != nil {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
		}

		// 设置默认值
		if filter.Period == "" {
			filter.Period = "1d"
		}
		if filter.Page == 0 {
			filter.Page = 1
		}
		if filter.PageSize == 0 {
			filter.PageSize = 20
		}

		// TODO: 调用服务层获取艺术家数据
		// result, err := service.GetArtists(c.Request.Context(), svcCtx, filter)
		// if err != nil {
		// 	xhttp.Error(c, errcode.NewCustomErr("Failed to get artists"))
		// 	return
		// }

		// 暂时返回模拟数据
		mockResponse := &types.ArtistsResponse{
			Result: []*types.ArtistRanking{
				{
					Rank:         1,
					Address:      "0xartist1234567890",
					Username:     "V0ID_WALKER",
					Avatar:       "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
					IsVerified:   true,
					Volume:       "842.1",
					VolumeChange: 24.5,
					Sales:        450,
					FloorPrice:   "2.45",
				},
				{
					Rank:         2,
					Address:      "0xartist2345678901",
					Username:     "FORM_STUDIO",
					Avatar:       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
					IsVerified:   true,
					Volume:       "320.4",
					VolumeChange: -2.1,
					Sales:        280,
					FloorPrice:   "0.89",
				},
			},
			Total: 2,
		}

		xhttp.OkJson(c, mockResponse)
	}
}

// GetAuctionsHandler 获取拍卖列表
func GetAuctionsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取过滤参数
		filterParam := c.Query("filters")

		var filter types.AuctionsFilterParams
		if filterParam != "" {
			err := json.Unmarshal([]byte(filterParam), &filter)
			if err != nil {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
		}

		// 设置默认值
		if filter.Status == "" {
			filter.Status = "active"
		}
		if filter.Page == 0 {
			filter.Page = 1
		}
		if filter.PageSize == 0 {
			filter.PageSize = 20
		}

		// TODO: 调用服务层获取拍卖数据
		// result, err := service.GetAuctions(c.Request.Context(), svcCtx, filter)
		// if err != nil {
		// 	xhttp.Error(c, errcode.NewCustomErr("Failed to get auctions"))
		// 	return
		// }

		// 暂时返回模拟数据
		mockResponse := &types.AuctionsResponse{
			Result: []*types.AuctionInfo{
				{
					AuctionID:      "auction_001",
					ItemName:       "Cosmic Voyager #001",
					ImageURI:       "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
					CollectionName: "Space Collection",
					TokenID:        "1",
					Seller:         "0xseller123",
					HighestBidder:  "0xbidder456",
					CurrentBid:     decimal.NewFromFloat(2.5),
					BidCount:       15,
					StartTime:      1234567890,
					EndTime:        1234654290,
					Status:         "active",
					ChainID:        1,
				},
			},
			Total: 1,
		}

		xhttp.OkJson(c, mockResponse)
	}
}

// GetDropsHandler 获取新品发布列表
func GetDropsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取过滤参数
		filterParam := c.Query("filters")

		var filter types.DropsFilterParams
		if filterParam != "" {
			err := json.Unmarshal([]byte(filterParam), &filter)
			if err != nil {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
		}

		// 设置默认值
		if filter.Status == "" {
			filter.Status = "live"
		}
		if filter.Page == 0 {
			filter.Page = 1
		}
		if filter.PageSize == 0 {
			filter.PageSize = 20
		}

		// TODO: 调用服务层获取 drops 数据
		// result, err := service.GetDrops(c.Request.Context(), svcCtx, filter)
		// if err != nil {
		// 	xhttp.Error(c, errcode.NewCustomErr("Failed to get drops"))
		// 	return
		// }

		// 暂时返回模拟数据
		mockResponse := &types.DropsResponse{
			Result: []*types.DropInfo{
				{
					DropID:         "drop_001",
					CollectionName: "Neon Dreams Collection",
					CreatorName:    "NeonArtist",
					IsVerified:     true,
					Description:    "A futuristic collection exploring digital consciousness",
					TotalSupply:    1000,
					ItemsMinted:    750,
					Price:          "0.5",
					MintStartTime:  1234567890,
					MintEndTime:    1234654290,
					Status:         "live",
					ChainID:        1,
					Categories:     []string{"Art", "Metaverse"},
				},
			},
			Total: 1,
		}

		xhttp.OkJson(c, mockResponse)
	}
}
