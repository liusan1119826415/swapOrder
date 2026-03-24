package types

// AnalyticsStats 统计分析数据
type AnalyticsStats struct {
	TotalVolume      string `json:"total_volume"`       // 总交易量
	TotalVolumeUSD   string `json:"total_volume_usd"`   // 总交易量 (USD)
	TotalSales       int64  `json:"total_sales"`        // 总销售次数
	ActiveUsers      int64  `json:"active_users"`       // 活跃用户数
	AveragePrice     string `json:"average_price"`      // 平均价格
	AveragePriceUSD  string `json:"average_price_usd"`  // 平均价格 (USD)
	MarketCap        string `json:"market_cap"`         // 市值
	MarketCapUSD     string `json:"market_cap_usd"`     // 市值 (USD)
	TotalCollections int64  `json:"total_collections"`  // 总集合数
	TotalItems       int64  `json:"total_items"`        // 总物品数
}

// TopCollection 顶级集合信息
type TopCollection struct {
	Rank            int     `json:"rank"`              // 排名
	Name            string  `json:"name"`              // 名称
	Address         string  `json:"address"`           // 合约地址
	Volume          string  `json:"volume"`            // 交易量
	VolumeChange    float64 `json:"volume_change"`     // 交易量变化 (%)
	Sales           int64   `json:"sales"`             // 销售次数
	SalesChange     float64 `json:"sales_change"`      // 销售变化 (%)
	FloorPrice      string  `json:"floor_price"`       // 地板价
	FloorChange     float64 `json:"floor_change"`      // 地板价变化 (%)
	Owners          int64   `json:"owners"`            // 所有者数量
	Items           int64   `json:"items"`             // 物品总数
	Logo            string  `json:"logo"`              // Logo URL
	IsVerified      bool    `json:"is_verified"`       // 是否认证
}

// AnalyticsFilterParams 分析过滤参数
type AnalyticsFilterParams struct {
	ChainID    []int    `json:"chain_ids"`    // 链 ID 列表
	Period     string   `json:"period"`       // 时间范围：1h, 6h, 1d, 7d, 30d
	Categories []string `json:"categories"`   // 分类：Art, Gaming, Metaverse, Music, Photography
	Limit      int      `json:"limit"`        // 返回数量限制
}

// AnalyticsResponse 分析数据响应
type AnalyticsResponse struct {
	Stats         *AnalyticsStats `json:"stats"`          // 统计数据
	TopCollections []*TopCollection `json:"top_collections"` // 顶级集合
	TrendingNow   []*TopCollection `json:"trending_now"`   // 当前趋势
	NewCollections []*TopCollection `json:"new_collections"` // 新集合
}
