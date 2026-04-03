package v1

const (
	CursorDelimiter = "_"
)

type chainIDMap map[int]string

var chainIDToChain = chainIDMap{
	0:        "", // 表示所有链
	1:        "eth",
	10:       "optimism",
	11155111: "sepolia",
	137:      "polygon",
}

// containsZero 检查切片中是否包含0
func containsZero(nums []int) bool {
	for _, n := range nums {
		if n == 0 {
			return true
		}
	}
	return false
}
