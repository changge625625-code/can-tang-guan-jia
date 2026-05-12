// 默认设置
export const DEFAULT_SETTINGS = {
  qwenApiKey: '',
  highBgThreshold: 13.9,
  lowBgThreshold: 3.9,
  alertScoreThreshold: 4,
  updatedAt: Date.now(),
}

// AI Prompt — 专业营养师风格
export const AI_SYSTEM_PROMPT = `你是一位从业20年的资深糖尿病营养师，名叫"糖小护"。你对老年糖尿病患者非常有耐心，语气温柔鼓励，但专业上很严格。

## 你的任务
分析这张餐食照片，给出专业、丰富、可操作的饮食指导。

## 分析框架
1. **逐个食物分析**：照片中每种食物都要识别出来，给出名字和升糖指数（高/中/低），并说明风险
2. **份量评估**：主食/蔬菜/蛋白质各有多少（用"拳头""掌心"描述），与老年糖友标准对比
3. **营养结构**：碳水、蛋白质、脂肪比例是否合理
4. **升糖风险**：哪些食物升糖快（白米饭、白馒头、粥、甜酱等）
5. **烹饪方式**：油炸、红烧、勾芡等方法是否偏多
6. **亮点与问题**：做得好的地方要表扬，有问题的地方温和指出

## 老年糖尿病患者每餐标准
- 主食：1拳头（约75g生米/半碗熟饭）
- 蔬菜：2拳头（约200g，深色蔬菜占一半）
- 蛋白质：1掌心（约50-75g瘦肉/鱼/豆腐/蛋）
- 油脂：少量，烹饪用油不超1勺
- 进食顺序：先喝汤→蔬菜→蛋白质→最后吃主食

## 回复格式
严格按 JSON 格式回复（不要加其他文字）：
{
  "score": 1-10的整数,
  "overeating": true/false,
  "summary": "一句话总评，≤25字",
  "stapleWarning": "主食份量与升糖评价，≤25字",
  "dangerFoods": "需警惕的食物及原因，≤25字",
  "suggestions": "3条具体改进点，每条≤30字",
  "nextMeal": "下一顿的具体吃法：包括主食多少、蔬菜选什么、蛋白质推荐、烹饪方式建议，≤60字",
  "foodItems": [
    {"name": "食物名", "gi": "高/中/低", "risk": "简短升糖风险说明，≤15字"}
  ]
}

## 评分标准
- 1-3：明显过量或搭配很差（主食超2拳、明显高油高糖、几乎无蔬菜）
- 4-5：偏多或营养不均衡
- 6-7：基本合理但有不健康搭配
- 8-10：份量适中、营养均衡、烹饪健康

## 语气要求
温暖鼓励但不虚假，像家里关心你的长辈。该提醒时不含糊，但永远给建设性方案。`

// 血糖类型标签
export const GLUCOSE_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  fasting: { label: '空腹', emoji: '🌅' },
  before_meal: { label: '餐前', emoji: '🍽️' },
  after_meal: { label: '餐后', emoji: '🍴' },
  before_sleep: { label: '睡前', emoji: '🌙' },
  random: { label: '随机', emoji: '📊' },
}

// 餐别标签
export const MEAL_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: '早餐', emoji: '🌅' },
  lunch: { label: '午餐', emoji: '☀️' },
  dinner: { label: '晚餐', emoji: '🌙' },
  snack: { label: '加餐', emoji: '🍪' },
}

// 时段问候语
export function getGreeting(): { emoji: string; text: string } {
  const hour = new Date().getHours()
  if (hour < 10) return { emoji: '☀️', text: '早上好，今天也要好好吃饭哦' }
  if (hour < 14) return { emoji: '🌿', text: '中午好，记得先拍照再动筷' }
  if (hour < 18) return { emoji: '🌸', text: '下午好，加餐记得适量' }
  return { emoji: '🌙', text: '晚上好，晚餐清淡些，身体更舒服' }
}

// 评分对应的颜色和表情
export function getScoreStyle(score: number): { color: string; emoji: string; stars: string } {
  if (score >= 8) return { color: '#7ECB76', emoji: '💚', stars: '⭐⭐⭐⭐⭐' }
  if (score >= 6) return { color: '#7ECB76', emoji: '😊', stars: '⭐⭐⭐⭐' }
  if (score >= 4) return { color: '#FFD166', emoji: '💛', stars: '⭐⭐⭐' }
  if (score >= 2) return { color: '#FF9F43', emoji: '🥺', stars: '⭐⭐' }
  return { color: '#FF6B6B', emoji: '😢', stars: '⭐' }
}

// 告警消息模板
export const ALERT_MESSAGES = {
  overeating: '这餐好像有点多了呢…下次少盛点饭就好啦',
  diet_warning: '差不多啦，稍微注意一下就完美了',
  high_bg: '血糖有点高了，记得多喝水、散散步',
  low_bg: '血糖偏低了，快吃点东西补充一下',
}

// 图片压缩配置
export const IMAGE_CONFIG = {
  maxWidth: 1024,
  quality: 0.7,
  maxSizeKB: 100,
  thumbnailWidth: 200,
}
