package v1

import (
	"encoding/json"

	"github.com/ProjectsTask/EasySwapBase/errcode"
	"github.com/ProjectsTask/EasySwapBase/xhttp"
	"github.com/gin-gonic/gin"

	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/service/v1"
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

		// 调用服务层获取分析数据
		result, err := service.GetAnalytics(c.Request.Context(), svcCtx, filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Failed to get analytics data"))
			return
		}

		xhttp.OkJson(c, result)
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

		// TODO: 获取链名称 (从 filter.ChainIds 或默认链)
		chainName := "sepolia" // 默认使用 sepolia

		// 调用服务层获取艺术家数据
		result, total, err := service.GetCreators(c.Request.Context(), svcCtx, chainName, filter.Page, filter.PageSize)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Failed to get artists"))
			return
		}

		xhttp.OkJson(c, &types.ArtistsResponse{
			Result: result,
			Total:  total,
		})
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

		// TODO: 获取链名称
		chainID := 11155111

		// 调用服务层获取拍卖数据
		result, err := service.GetAuctions(c.Request.Context(), svcCtx, chainID, filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Failed to get auctions"))
			return
		}

		xhttp.OkJson(c, result)
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

		// TODO: 获取链名称
		chainName := "sepolia"

		// 调用服务层获取 drops 数据
		result, err := service.GetDrops(c.Request.Context(), svcCtx, chainName, filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Failed to get drops"))
			return
		}

		xhttp.OkJson(c, result)
	}
}
