package types

// DropInfo 新品发布信息
type DropInfo struct {
	DropID          string   `json:"drop_id"`           // Drop ID
	CollectionName  string   `json:"collection_name"`   // 集合名称
	CollectionAddr  string   `json:"collection_addr"`   // 集合地址
	Logo            string   `json:"logo"`              // Logo URL
	Banner          string   `json:"banner"`            // 横幅 URL
	Creator         string   `json:"creator"`           // 创作者地址
	CreatorName     string   `json:"creator_name"`      // 创作者名称
	IsVerified      bool     `json:"is_verified"`       // 是否认证
	Description     string   `json:"description"`       // 描述
	TotalSupply     int64    `json:"total_supply"`      // 总供应量
	ItemsMinted     int64    `json:"items_minted"`      // 已铸造数量
	Price           string   `json:"price"`             // 价格
	PriceUSD        string   `json:"price_usd"`         // 价格 (USD)
	MintStartTime   int64    `json:"mint_start_time"`   // 铸造开始时间
	MintEndTime     int64    `json:"mint_end_time"`     // 铸造结束时间
	Status          string   `json:"status"`            // 状态：upcoming, live, sold_out, ended
	ChainID         int      `json:"chain_id"`          // 链 ID
	Categories      []string `json:"categories"`        // 分类
}

// DropsFilterParams Drops 过滤参数
type DropsFilterParams struct {
	ChainID      []int    `json:"chain_ids"`       // 链 ID 列表
	Status       string   `json:"status"`          // 状态：upcoming, live, ending_soon, sold_out
	Categories   []string `json:"categories"`      // 分类
	SortBy       string   `json:"sort_by"`         // 排序：start_time, minted_count
	SortOrder    string   `json:"sort_order"`      // 顺序：asc, desc
	Page         int      `json:"page"`            // 页码
	PageSize     int      `json:"page_size"`       // 每页数量
}

// DropsResponse Drops 响应
type DropsResponse struct {
	Result []*DropInfo `json:"result"`
	Total  int64       `json:"total"`
}
