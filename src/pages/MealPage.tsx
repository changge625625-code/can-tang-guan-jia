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
import Icon from '../components/Icon'
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
      <h1 className="text-center mb-6" style={{ fontSize: 'var(--fs-display)', fontWeight: 700, color: 'var(--text)' }}>拍饮食</h1>

      {error && <div className="rounded-card px-4 py-3 mb-4" style={{ fontSize: 'var(--fs-body-lg)', background: 'var(--red-bg)', color: 'var(--red)' }}>{error}</div>}

      {step === 'capture' && (
        <div className="text-center">
          <p style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)', marginBottom: 32 }}>拍下您这顿饭的照片，AI 帮您看看</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="breathe-ring w-[200px] h-[180px] rounded-full flex flex-col items-center justify-center mx-auto transition-transform active:scale-95"
            style={{ background: 'var(--mint)', fontSize: 'var(--fs-score)' }}
          >
            <Icon name="camera" size={48} color="#FFFFFF" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          <p style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 16 }}>点击大按钮拍照</p>
        </div>
      )}

      {step === 'preview' && (
        <>
          <div className="bg-white rounded-card overflow-hidden shadow-card mb-4">
            <img src={photoBase64} alt="" className="w-full block" />
          </div>
          <div className="flex gap-2 justify-center mb-5 flex-wrap">
            {MEAL_TYPES.map((t) => (
              <button key={t} onClick={() => setMealType(t)} className="h-11 px-4 rounded-full font-medium transition-all active:scale-95"
                style={{
                  fontSize: 'var(--fs-label)',
                  background: mealType === t ? 'var(--mint-soft)' : 'var(--white)',
                  color: mealType === t ? 'var(--mint)' : 'var(--text-secondary)',
                  border: mealType === t ? '1.5px solid var(--mint)' : '1px solid var(--border)',
                }}>
                {MEAL_TYPE_LABELS[t].emoji} {MEAL_TYPE_LABELS[t].label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 h-[64px] rounded-btn bg-white border border-[#E8E5DF] font-medium active:bg-gray-50 transition-colors" style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)' }}>
              <Icon name="refresh" size={20} color="var(--text-secondary)" />
              <span className="ml-2">重拍</span>
            </button>
            <button onClick={analyze} className="flex-[2] h-[64px] rounded-btn font-semibold active:scale-[0.97] transition-all" style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF' }}>
              <Icon name="search" size={20} color="#FFFFFF" />
              <span className="ml-2">分析这顿饭</span>
            </button>
          </div>
        </>
      )}

      {step === 'analyzing' && (
        <div className="text-center py-16">
          <div className="spin-slow mb-6 inline-block" style={{ fontSize: 'var(--fs-score)' }}>🍽️</div>
          <p style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>正在帮您看看这顿饭...</p>
          <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>AI 正在分析食材和份量</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="flex flex-col gap-4 stagger">
          <div className="bg-white rounded-card p-6 text-center shadow-card">
            <ScoreDisplay score={result.score} size="lg" />
            <p style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>{result.summary}</p>
          </div>

          {result.foodItems.length > 0 && (
            <div className="bg-white rounded-card p-5 shadow-card">
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="microbe" size={20} color="var(--text)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--text)' }}>食物升糖分析</span>
              </div>
              <div className="flex flex-col gap-2">
                {result.foodItems.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-[12px]" style={{ background: f.gi === '高' ? 'var(--red-bg)' : f.gi === '中' ? 'var(--yellow-bg)' : 'var(--green-bg)' }}>
                    <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 500, color: 'var(--text)' }}>{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                        fontSize: 'var(--fs-small)',
                        background: f.gi === '高' ? 'var(--red-bg)' : f.gi === '中' ? 'var(--yellow-bg)' : 'var(--green-bg)',
                        color: f.gi === '高' ? 'var(--red)' : f.gi === '中' ? 'var(--yellow)' : 'var(--mint)',
                        border: `1.5px solid ${f.gi === '高' ? 'var(--red)' : f.gi === '中' ? 'var(--yellow)' : 'var(--mint)'}`
                      }}>{f.gi === '高' ? '高' : f.gi === '中' ? '中' : '低'}</span>
                      <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)' }}>{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-5 shadow-card flex flex-col gap-3.5">
            <div className="flex items-start gap-2">
              <Icon name="salad" size={20} color="var(--text)" />
              <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>主食</span>
              <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>{result.stapleWarning}</span>
            </div>
            {result.dangerFoods && result.dangerFoods !== '无' && (
              <div className="flex items-start gap-2">
                <Icon name="alert" size={20} color="var(--red)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>警惕</span>
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--red)' }}>{result.dangerFoods}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Icon name="tip" size={20} color="var(--text)" />
              <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>建议</span>
            </div>
            <ul className="ml-9 space-y-1">
              {result.suggestions.map((s, i) => <li key={i} style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>{s}</li>)}
            </ul>
            {result.nextMeal && (
              <div className="rounded-card p-4" style={{ background: 'var(--green-bg)', border: '1px solid var(--mint)' }}>
                <div className="flex items-center gap-1.5">
                  <Icon name="salad" size={20} color="var(--mint)" />
                  <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--mint)' }}>下一顿这样吃</span>
                </div>
                <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--mint)', marginTop: 6 }}>{result.nextMeal}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 h-[64px] rounded-btn bg-white border border-[#E8E5DF] font-medium active:bg-gray-50 transition-colors" style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)' }}>
              <Icon name="refresh" size={20} color="var(--text-secondary)" />
              <span className="ml-2">再拍</span>
            </button>
            <button onClick={() => onNavigate('home')} className="flex-[2] h-[64px] rounded-btn font-semibold active:scale-[0.97] transition-all" style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF' }}>
              <Icon name="home" size={20} color="#FFFFFF" />
              <span className="ml-2">首页</span>
            </button>
          </div>
        </div>
      )}

      <AlertModal visible={alert.visible} type={alert.type} score={alert.score} message={alert.message} suggestion={alert.suggestion} onClose={() => setAlert({ ...alert, visible: false })} />
    </div>
  )
}
