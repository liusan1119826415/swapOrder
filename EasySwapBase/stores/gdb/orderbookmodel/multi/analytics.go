package multi

import (
	"github.com/shopspring/decimal"
)

// Drop 新品发布模型
type Drop struct {
	ID             int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	DropID         string          `gorm:"column:drop_id;NOT NULL" json:"drop_id"`                       // Drop 唯一 ID
	CollectionAddr string          `gorm:"column:collection_address;NOT NULL" json:"collection_address"` // 集合合约地址
	CollectionName string          `gorm:"column:collection_name;NOT NULL" json:"collection_name"`       // 集合名称
	CreatorAddr    string          `gorm:"column:creator_address;NOT NULL" json:"creator_address"`       // 创建者地址
	CreatorName    string          `gorm:"column:creator_name" json:"creator_name"`                      // 创建者名称
	Description    string          `gorm:"column:description" json:"description"`                        // 项目描述
	LogoURI        string          `gorm:"column:logo_uri" json:"logo_uri"`                              // Logo URL
	BannerURI      string          `gorm:"column:banner_uri" json:"banner_uri"`                          // 横幅 URL
	TotalSupply    int64           `gorm:"column:total_supply;NOT NULL" json:"total_supply"`             // 总供应量
	ItemsMinted    int64           `gorm:"column:items_minted;default:0" json:"items_minted"`            // 已 mint 数量
	Price          decimal.Decimal `gorm:"column:price;NOT NULL" json:"price"`                           // 单价 (ETH)
	MintStartTime  int64           `gorm:"column:mint_start_time;NOT NULL" json:"mint_start_time"`       // 开始时间戳 (秒)
	MintEndTime    int64           `gorm:"column:mint_end_time;NOT NULL" json:"mint_end_time"`           // 结束时间戳 (秒)
	Status         int             `gorm:"column:status;default:0" json:"status"`                        // 状态 (0:upcoming, 1:live, 2:sold_out, 3:ended)
	ChainID        int64           `gorm:"column:chain_id;default:1" json:"chain_id"`                    // 链 ID
	ChainName      string          `gorm:"column:chain_name;NOT NULL" json:"chain_name"`                 // 链名称
	IsVerified     int             `gorm:"column:is_verified;default:0" json:"is_verified"`              // 是否认证
	Categories     string          `gorm:"column:categories" json:"categories"`                          // 分类列表 (逗号分隔)
	Website        string          `gorm:"column:website" json:"website"`                                // 官网地址
	Discord        string          `gorm:"column:discord" json:"discord"`                                // Discord 地址
	Twitter        string          `gorm:"column:twitter" json:"twitter"`                                // Twitter 地址
	CreateTime     int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"`        // 创建时间戳 (毫秒)
	UpdateTime     int64           `json:"update_time" gorm:"column:update_time;type:bigint(20)"`        // 更新时间戳 (毫秒)
}

// TableName 表名
func (Drop) TableName() string {
	return "ob_drop"
}

// AnalyticsStat 统计数据缓存模型
type AnalyticsStat struct {
	ID               int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	StatDate         string          `gorm:"column:stat_date;NOT NULL" json:"stat_date"`                  // 统计日期
	PeriodType       string          `gorm:"column:period_type;NOT NULL" json:"period_type"`              // 周期类型 (1h, 6h, 1d, 7d, 30d, all)
	TotalVolume      decimal.Decimal `gorm:"column:total_volume;default:0" json:"total_volume"`           // 总交易量 (ETH)
	TotalVolumeUSD   decimal.Decimal `gorm:"column:total_volume_usd;default:0" json:"total_volume_usd"`   // 总交易量 (USD)
	TotalSales       int64           `gorm:"column:total_sales;default:0" json:"total_sales"`             // 总销售次数
	ActiveUsers      int64           `gorm:"column:active_users;default:0" json:"active_users"`           // 活跃用户数
	AveragePrice     decimal.Decimal `gorm:"column:average_price;default:0" json:"average_price"`         // 平均价格 (ETH)
	AveragePriceUSD  decimal.Decimal `gorm:"column:average_price_usd;default:0" json:"average_price_usd"` // 平均价格 (USD)
	MarketCap        decimal.Decimal `gorm:"column:market_cap;default:0" json:"market_cap"`               // 市值 (ETH)
	MarketCapUSD     decimal.Decimal `gorm:"column:market_cap_usd;default:0" json:"market_cap_usd"`       // 市值 (USD)
	TotalCollections int64           `gorm:"column:total_collections;default:0" json:"total_collections"` // 总集合数
	TotalItems       int64           `gorm:"column:total_items;default:0" json:"total_items"`             // 总物品数
	ChainName        string          `gorm:"column:chain_name" json:"chain_name"`                         // 链名称
	CreateTime       int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"`       // 创建时间戳 (毫秒)
	UpdateTime       int64           `json:"update_time" gorm:"column:update_time;type:bigint(20)"`       // 更新时间戳 (毫秒)
}

// TableName 表名
func (AnalyticsStat) TableName() string {
	return "ob_analytics_stats"
}

// CollectionRanking 集合排名缓存模型
type CollectionRanking struct {
	ID             int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	RankingDate    string          `gorm:"column:ranking_date;NOT NULL" json:"ranking_date"`             // 排名日期
	PeriodType     string          `gorm:"column:period_type;NOT NULL" json:"period_type"`               // 周期类型 (1h, 6h, 1d, 7d, 30d)
	CollectionAddr string          `gorm:"column:collection_address;NOT NULL" json:"collection_address"` // 集合合约地址
	ChainName      string          `gorm:"column:chain_name;NOT NULL" json:"chain_name"`                 // 链名称
	Rank           int             `gorm:"column:rank;NOT NULL" json:"rank"`                             // 排名
	Volume         decimal.Decimal `gorm:"column:volume;default:0" json:"volume"`                        // 交易量 (ETH)
	VolumeChange   decimal.Decimal `gorm:"column:volume_change;default:0" json:"volume_change"`          // 交易量变化率
	Sales          int64           `gorm:"column:sales;default:0" json:"sales"`                          // 销售次数
	SalesChange    decimal.Decimal `gorm:"column:sales_change;default:0" json:"sales_change"`            // 销售变化率
	FloorPrice     decimal.Decimal `gorm:"column:floor_price;default:0" json:"floor_price"`              // 地板价 (ETH)
	FloorChange    decimal.Decimal `gorm:"column:floor_change;default:0" json:"floor_change"`            // 地板价变化率
	Owners         int64           `gorm:"column:owners;default:0" json:"owners"`                        // 所有者数量
	Items          int64           `gorm:"column:items;default:0" json:"items"`                          // 物品总数
	CreateTime     int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"`        // 创建时间戳 (毫秒)
}

// TableName 表名
func (CollectionRanking) TableName() string {
	return "ob_collection_ranking"
}
