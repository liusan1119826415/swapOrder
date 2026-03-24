package types

// ArtistInfo 艺术家/创作者信息
type ArtistInfo struct {
	Address        string `json:"address"`         // 钱包地址
	Username       string `json:"username"`        // 用户名
	Bio            string `json:"bio"`             // 简介
	Avatar         string `json:"avatar"`          // 头像 URL
	Banner         string `json:"banner"`          // 横幅 URL
	IsVerified     bool   `json:"is_verified"`     // 是否认证
	TotalVolume    string `json:"total_volume"`    // 总交易量
	TotalSales     int64  `json:"total_sales"`     // 总销售次数
	TotalItems     int64  `json:"total_items"`     // 创作物品总数
	FloorPrice     string `json:"floor_price"`     // 地板价
	Followers      int64  `json:"followers"`       // 粉丝数
	SocialLinks    SocialLinks `json:"social_links"` // 社交媒体链接
}

// SocialLinks 社交媒体链接
type SocialLinks struct {
	Twitter  string `json:"twitter"`
	Discord  string `json:"discord"`
	Instagram string `json:"instagram"`
	Website  string `json:"website"`
}

// ArtistRanking 艺术家排名
type ArtistRanking struct {
	Rank         int     `json:"rank"`          // 排名
	Address      string  `json:"address"`       // 钱包地址
	Username     string  `json:"username"`      // 用户名
	Avatar       string  `json:"avatar"`        // 头像
	IsVerified   bool    `json:"is_verified"`   // 是否认证
	Volume       string  `json:"volume"`        // 交易量
	VolumeChange float64 `json:"volume_change"` // 交易量变化 (%)
	Sales        int64   `json:"sales"`         // 销售次数
	FloorPrice   string  `json:"floor_price"`   // 地板价
}

// ArtistsFilterParams 艺术家过滤参数
type ArtistsFilterParams struct {
	ChainID   []int  `json:"chain_ids"`   // 链 ID 列表
	Period    string `json:"period"`      // 时间范围：1h, 6h, 1d, 7d, 30d
	Category  string `json:"category"`    // 分类
	Search    string `json:"search"`      // 搜索关键词
	Page      int    `json:"page"`        // 页码
	PageSize  int    `json:"page_size"`   // 每页数量
	SortBy    string `json:"sort_by"`     // 排序字段：volume, sales, floor_price
	SortOrder string `json:"sort_order"`  // 排序顺序：asc, desc
}

// ArtistsResponse 艺术家响应
type ArtistsResponse struct {
	Result []*ArtistRanking `json:"result"`
	Total  int64            `json:"total"`
}
