import type { AIReviewResult } from '../types'
import { AI_SYSTEM_PROMPT } from '../utils/constants'

const API_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

function getApiKey(storedKey: string): string {
  return storedKey
}

function buildContextPrompt(todaySummary: string): string {
  if (!todaySummary) return AI_SYSTEM_PROMPT
  return `${AI_SYSTEM_PROMPT}

## 这位老人今天已经吃过的东西（供参考，避免推荐重复）
${todaySummary}

请根据今天已摄入的营养情况，给出差异化的下一顿建议。比如午餐已有鱼肉，晚餐就推荐其他蛋白质来源。尽量让一天内的饮食多样化、营养互补。`
}

export async function analyzeMealPhoto(
  photoBase64: string,
  apiKey: string,
  todayMealContext?: string
): Promise<AIReviewResult> {
  const key = getApiKey(apiKey)
  const promptText = buildContextPrompt(todayMealContext || '')

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: photoBase64 },
            },
            {
              type: 'text',
              text: promptText,
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI 分析失败: ${response.status} ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI 返回格式异常，请重试')
  }

  const result = JSON.parse(jsonMatch[0])

  return {
    score: Math.max(1, Math.min(10, Math.round(result.score) || 5)),
    overeating: result.overeating || false,
    summary: result.summary || '分析完成',
    stapleWarning: result.stapleWarning || '主食适量',
    dangerFoods: result.dangerFoods || '无',
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    nextMeal: result.nextMeal || '下一顿：主食减至1拳头，增加蔬菜至2拳头，蛋白质选鱼肉或豆腐',
    foodItems: Array.isArray(result.foodItems) ? result.foodItems.map((f: any) => ({
      name: f.name || '',
      gi: f.gi || '中',
      risk: f.risk || '',
    })) : [],
  }
}
