import { useState, useRef } from 'react'
import { MEAL_TYPE_LABELS } from '../utils/constants'
import { compressImage, createThumbnail } from '../utils/image'
import { IMAGE_CONFIG } from '../utils/constants'
import { addMeal, updateMeal, getTodayMeals } from '../services/mealService'
import { addAlertLog } from '../services/alertService'
import { getSettings } from '../services/settingsService'
import { analyzeMealPhoto } from '../services/aiService'
import AlertModal from '../components/AlertModal'
import ScoreDisplay from '../components/ScoreDisplay'
import type { MealType, AIReviewResult } from '../types'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
type Step = 'capture' | 'preview' | 'analyzing' | 'result'

interface Props { onNavigate: (page: string, params?: any) => void }

export default function MealPage({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>('capture')
  const [photoBase64, setPhotoBase64] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [result, setResult] = useState<AIReviewResult | null>(null)
  const [error, setError] = useState('')
  const [alert, setAlert] = useState<{ visible: boolean; type: 'overeating' | 'diet_warning'; message: string; suggestion: string; score: number }>({ visible: false, type: 'overeating', message: '', suggestion: '', score: 0 })
  const [savedMealId, setSavedMealId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setError('')
      const c = await compressImage(file, IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.quality)
      setPhotoBase64(c)
      setStep('preview')
    } catch { setError('图片处理失败') }
  }

  const analyze = async () => {
    setStep('analyzing')
    setError('')
    try {
      const s = await getSettings()
      if (!s.qwenApiKey && !(import.meta as any).env?.VITE_QWEN_API_KEY) {
        setError('API Key 未配置')
        setStep('preview')
        return
      }
      const thumb = await createThumbnail(photoBase64, IMAGE_CONFIG.thumbnailWidth)
      const id = await addMeal({ photoData: photoBase64, thumbnailData: thumb, mealType, timestamp: Date.now() })
      setSavedMealId(id)
      // 获取今天已吃的餐食，传给 AI 做差异化推荐
      const todayMeals = await getTodayMeals()
      const context = todayMeals.length > 0
        ? todayMeals.map((m) => `${MEAL_TYPE_LABELS[m.mealType as MealType]?.label}: ${m.reviewSummary || '已记录'}`).join('；')
        : ''
      const aiResult = await analyzeMealPhoto(photoBase64, s.qwenApiKey, context)
      await updateMeal(id, {
        reviewStatus: 'reviewed', reviewScore: aiResult.score, reviewSummary: aiResult.summary,
        stapleWarning: aiResult.stapleWarning, dangerFoods: aiResult.dangerFoods,
        suggestions: JSON.stringify(aiResult.suggestions), nextMeal: aiResult.nextMeal,
        foodItems: JSON.stringify(aiResult.foodItems),
        overeating: aiResult.overeating,
      })
      setResult(aiResult)
      setStep('result')
      if (aiResult.score <= s.alertScoreThreshold) {
        const t = aiResult.score <= 3 ? 'overeating' as const : 'diet_warning' as const
        setAlert({ visible: true, type: t, message: aiResult.score <= 3 ? '这餐好像有点多了呢…' : '差不多啦，稍微注意一下就完美了', suggestion: aiResult.suggestions?.[0] || '下次少盛点饭，多吃几口菜就好啦', score: aiResult.score })
        await addAlertLog(t, `${aiResult.score}分`, id, 'meal')
      }
    } catch (err: any) { setError(err.message || '分析失败'); setStep('preview'); if (savedMealId) await updateMeal(savedMealId, { reviewStatus: 'error' }) }
  }

  const reset = () => { setPhotoBase64(''); setResult(null); setStep('capture'); setSavedMealId(null) }

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <h1 className="text-[40px] font-bold text-primary tracking-tight text-center mb-6">拍饮食</h1>

      {error && <div className="bg-red-bg text-red rounded-card px-4 py-3 text-[20px] text-center mb-4">{error}</div>}

      {step === 'capture' && (
        <div className="text-center">
          <p className="text-[22px] text-secondary mb-8">拍下您这顿饭的照片，AI 帮您看看</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="breathe-ring w-[200px] h-[180px] rounded-full flex items-center justify-center text-[72px] mx-auto transition-transform active:scale-95"
            style={{ background: 'linear-gradient(150deg, #FF7E67, #FF9F43)', boxShadow: '0 8px 40px rgba(255,126,103,0.3)' }}
          >
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          <p className="text-[20px] text-tertiary mt-4">点击大按钮拍照</p>
        </div>
      )}

      {step === 'preview' && (
        <>
          <div className="bg-white rounded-card overflow-hidden shadow-card mb-4">
            <img src={photoBase64} alt="" className="w-full block" />
          </div>
          <div className="flex gap-2 justify-center mb-5 flex-wrap">
            {MEAL_TYPES.map((t) => (
              <button key={t} onClick={() => setMealType(t)} className="h-11 px-4 rounded-full text-[20px] font-medium transition-all active:scale-95"
                style={{
                  background: mealType === t ? 'var(--coral-soft)' : 'var(--white)',
                  color: mealType === t ? 'var(--coral)' : 'var(--text-secondary)',
                  border: mealType === t ? '1.5px solid var(--coral)' : '1px solid var(--border)',
                }}>
                {MEAL_TYPE_LABELS[t].emoji} {MEAL_TYPE_LABELS[t].label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 h-[64px] rounded-btn bg-white border border-[#EBEBE6] text-secondary font-medium text-[22px] active:bg-cream transition-colors">🔄 重拍</button>
            <button onClick={analyze} className="flex-[2] h-[64px] rounded-btn font-semibold text-[23px] active:scale-[0.97] transition-all" style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>🔍 分析这顿饭</button>
          </div>
        </>
      )}

      {step === 'analyzing' && (
        <div className="text-center py-16">
          <div className="spin-slow text-[80px] mb-6 inline-block">🍽️</div>
          <p className="text-[28px] font-semibold text-primary mb-2">正在帮您看看这顿饭...</p>
          <p className="text-[21px] text-secondary">AI 正在分析食材和份量</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="flex flex-col gap-4 stagger">
          <div className="bg-white rounded-card p-6 text-center shadow-card">
            <ScoreDisplay score={result.score} size="lg" />
            <p className="text-[23px] font-semibold text-primary mt-2">{result.summary}</p>
          </div>

          {result.foodItems.length > 0 && (
            <div className="bg-white rounded-card p-5 shadow-card">
              <p className="text-[20px] font-semibold text-primary mb-3">🔬 食物升糖分析</p>
              <div className="flex flex-col gap-2">
                {result.foodItems.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-[12px]" style={{ background: f.gi === '高' ? '#FFF0EC' : f.gi === '中' ? '#FFF8E1' : '#F2FAF0' }}>
                    <span className="text-[20px] font-medium text-primary">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: f.gi === '高' ? '#FFF0EC' : f.gi === '中' ? '#FFF8E1' : '#F2FAF0',
                        color: f.gi === '高' ? '#E57373' : f.gi === '中' ? '#C79520' : '#5B9E4F',
                        border: `1.5px solid ${f.gi === '高' ? '#E57373' : f.gi === '中' ? '#E8C560' : '#7EBF73'}`
                      }}>{f.gi === '高' ? '高升糖' : f.gi === '中' ? '中升糖' : '低升糖'}</span>
                      <span className="text-[18px] text-secondary">{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-5 shadow-card flex flex-col gap-3.5">
            <div><span className="text-[20px] font-semibold">🍚 主食</span><span className="text-[20px] text-secondary ml-2">{result.stapleWarning}</span></div>
            {result.dangerFoods && result.dangerFoods !== '无' && <div><span className="text-[20px] font-semibold">⚠️ 警惕</span><span className="text-[20px] text-red ml-2">{result.dangerFoods}</span></div>}
            <div>
              <span className="text-[20px] font-semibold">💡 建议</span>
              <ul className="mt-1.5 ml-4 space-y-1">
                {result.suggestions.map((s, i) => <li key={i} className="text-[20px] text-secondary">{s}</li>)}
              </ul>
            </div>
            {result.nextMeal && (
              <div className="bg-green-bg rounded-card p-4" style={{ border: '1px solid #C8E6C9' }}>
                <span className="text-[20px] font-semibold text-green">🥗 下一顿这样吃</span>
                <p className="text-[20px] text-green mt-1.5 leading-relaxed">{result.nextMeal}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 h-[64px] rounded-btn bg-white border border-[#EBEBE6] text-secondary font-medium text-[22px] active:bg-cream transition-colors">🔄 再拍</button>
            <button onClick={() => onNavigate('home')} className="flex-[2] h-[64px] rounded-btn font-semibold text-[23px] active:scale-[0.97] transition-all" style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>🏠 首页</button>
          </div>
        </div>
      )}

      <AlertModal visible={alert.visible} type={alert.type} score={alert.score} message={alert.message} suggestion={alert.suggestion} onClose={() => setAlert({ ...alert, visible: false })} />
    </div>
  )
}
