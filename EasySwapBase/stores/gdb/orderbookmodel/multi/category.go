package multi

// Category 分类模型
type Category struct {
	ID          int64  `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	Name        string `gorm:"column:name;NOT NULL" json:"name"`                      // 分类名称
	Slug        string `gorm:"column:slug;NOT NULL" json:"slug"`                      // 分类标识 (英文短名)
	Description string `gorm:"column:description" json:"description"`                 // 分类描述
	IconURI     string `gorm:"column:icon_uri" json:"icon_uri"`                       // 分类图标 URL
	SortOrder   int    `gorm:"column:sort_order;default:0" json:"sort_order"`         // 排序顺序
	IsActive    int    `gorm:"column:is_active;default:1" json:"is_active"`           // 是否激活 (0:禁用，1:启用)
	CreateTime  int64  `json:"create_time" gorm:"column:create_time;type:bigint(20)"` // 创建时间戳 (毫秒)
	UpdateTime  int64  `json:"update_time" gorm:"column:update_time;type:bigint(20)"` // 更新时间戳 (毫秒)
}

// TableName 表名
func (Category) TableName() string {
	return "ob_category"
}

// CollectionCategory 集合分类关联模型
type CollectionCategory struct {
	ID                int64  `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	CollectionAddress string `gorm:"column:collection_address;NOT NULL" json:"collection_address"` // 集合合约地址
	CategoryID        int64  `gorm:"column:category_id;NOT NULL" json:"category_id"`               // 分类 ID
	ChainName         string `gorm:"column:chain_name;NOT NULL" json:"chain_name"`                 // 链名称
	CreateTime        int64  `json:"create_time" gorm:"column:create_time;type:bigint(20)"`        // 创建时间戳 (毫秒)
}

// TableName 表名
func (CollectionCategory) TableName() string {
	return "ob_collection_category"
}
