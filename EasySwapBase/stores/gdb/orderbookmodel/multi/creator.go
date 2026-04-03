package multi

import (
	"github.com/shopspring/decimal"
)

// Creator 创作者/艺术家模型
type Creator struct {
	ID          int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	Address     string          `gorm:"column:address;NOT NULL" json:"address"`                // 创作者钱包地址
	Username    string          `gorm:"column:username" json:"username"`                       // 用户名
	Bio         string          `gorm:"column:bio" json:"bio"`                                 // 个人简介
	AvatarURI   string          `gorm:"column:avatar_uri" json:"avatar_uri"`                   // 头像 URL
	BannerURI   string          `gorm:"column:banner_uri" json:"banner_uri"`                   // 横幅图片 URL
	IsVerified  int             `gorm:"column:is_verified;default:0" json:"is_verified"`       // 是否认证 (0:未认证，1:已认证)
	Twitter     string          `gorm:"column:twitter" json:"twitter"`                         // Twitter 链接
	Discord     string          `gorm:"column:discord" json:"discord"`                         // Discord 链接
	Instagram   string          `gorm:"column:instagram" json:"instagram"`                     // Instagram 链接
	Website     string          `gorm:"column:website" json:"website"`                         // 个人网站
	TotalVolume decimal.Decimal `gorm:"column:total_volume;default:0" json:"total_volume"`     // 总交易量 (ETH)
	TotalSales  int64           `gorm:"column:total_sales;default:0" json:"total_sales"`       // 总销售次数
	TotalItems  int64           `gorm:"column:total_items;default:0" json:"total_items"`       // 总作品数
	FloorPrice  decimal.Decimal `gorm:"column:floor_price;default:0" json:"floor_price"`       // 地板价 (ETH)
	Followers   int64           `gorm:"column:followers;default:0" json:"followers"`           // 粉丝数
	CreateTime  int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"` // 创建时间戳 (毫秒)
	UpdateTime  int64           `json:"update_time" gorm:"column:update_time;type:bigint(20)"` // 更新时间戳 (毫秒)
}

// TableName 表名
func (Creator) TableName() string {
	return "ob_creator"
}
