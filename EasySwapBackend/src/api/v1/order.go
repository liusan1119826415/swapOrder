package v1

import (
	"encoding/json"
	"strconv"

	"github.com/ProjectsTask/EasySwapBase/errcode"
	"github.com/ProjectsTask/EasySwapBase/xhttp"
	"github.com/gin-gonic/gin"

	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/service/v1"
	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
)

func OrderInfosHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		filterParam := c.Query("filters")
		if filterParam == "" {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var filter types.OrderInfosParam
		err := json.Unmarshal([]byte(filterParam), &filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		chain, ok := chainIDToChain[filter.ChainID]
		if !ok {
			xhttp.Error(c, errcode.ErrInvalidParams)
			return
		}

		res, err := service.GetOrderInfos(c.Request.Context(), svcCtx, filter.ChainID, chain, filter.UserAddress, filter.CollectionAddress, filter.TokenIds)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr(err.Error()))
			return
		}
		xhttp.OkJson(c, struct {
			Result interface{} `json:"result"`
		}{Result: res})
	}
}

// ListingsHandler 获取挂单列表
func ListingsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取链ID
		chainIDStr := c.Query("chain_id")
		if chainIDStr == "" {
			xhttp.Error(c, errcode.NewCustomErr("chain_id is required"))
			return
		}
		chainID, err := strconv.ParseInt(chainIDStr, 10, 64)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("invalid chain_id"))
			return
		}

		// 获取链名称
		chain, ok := chainIDToChain[int(chainID)]
		if !ok {
			xhttp.Error(c, errcode.NewCustomErr("unsupported chain"))
			return
		}

		// 构建过滤参数
		filter := types.ListingsRequest{
			ChainID:        chainID,
			CollectionAddr: c.Query("collection_addr"),
			TokenID:        c.Query("token_id"),
			UserAddress:    c.Query("user_address"),
			SortBy:         c.DefaultQuery("sort_by", "price"),
			SortOrder:      c.DefaultQuery("sort_order", "asc"),
			MinPrice:       c.Query("min_price"),
			MaxPrice:       c.Query("max_price"),
		}

		// 分页参数
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
		filter.Page = page
		filter.PageSize = pageSize

		// 调用服务层
		res, err := service.GetListings(c.Request.Context(), svcCtx, chain, filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr(err.Error()))
			return
		}

		xhttp.OkJson(c, res)
	}
}

// BidsHandler 获取出价列表
func BidsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取链ID
		chainIDStr := c.Query("chain_id")
		if chainIDStr == "" {
			xhttp.Error(c, errcode.NewCustomErr("chain_id is required"))
			return
		}
		chainID, err := strconv.ParseInt(chainIDStr, 10, 64)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("invalid chain_id"))
			return
		}

		// 获取链名称
		chain, ok := chainIDToChain[int(chainID)]
		if !ok {
			xhttp.Error(c, errcode.NewCustomErr("unsupported chain"))
			return
		}

		// 构建过滤参数
		filter := types.BidsRequest{
			ChainID:        chainID,
			CollectionAddr: c.Query("collection_addr"),
			TokenID:        c.Query("token_id"),
			UserAddress:    c.Query("user_address"),
			SortBy:         c.DefaultQuery("sort_by", "price"),
			SortOrder:      c.DefaultQuery("sort_order", "desc"),
			BidType:        c.Query("bid_type"),
		}

		// 分页参数
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
		filter.Page = page
		filter.PageSize = pageSize

		// 调用服务层
		res, err := service.GetOrderBids(c.Request.Context(), svcCtx, chain, filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr(err.Error()))
			return
		}

		xhttp.OkJson(c, res)
	}
}
