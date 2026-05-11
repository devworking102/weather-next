import { Card } from '@/shared/ui/Card'
import { Sparkles, Shirt, Activity, Map, Smile, CloudLightning } from 'lucide-react'
import { AiBadge, type AiBadgeSource } from '@/shared/ui/AiBadge'

interface AiInsightsProps {
  city: string
  badgeSource?: AiBadgeSource
  insights: {
    summary: string
    outfit: string
    health: string
    travel: string
    mood: string
    /** Cảnh báo ngắn khi thời tiết nguy hiểm — bỏ qua nếu rỗng */
    severe?: string
  }
}

export function AiWeatherSummary({ city, insights, badgeSource = 'gemini' }: AiInsightsProps) {
  const severe = insights.severe?.trim()

  return (
    <section
      className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
      aria-label={`Gợi ý AI cho ${city}`}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-500" />
          AI Khuyên Dùng
        </h2>
        <AiBadge source={badgeSource} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Summary & Mood - Span 2 columns */}
        <Card className="md:col-span-2 flex flex-col justify-between bg-gradient-to-br from-sky-500/10 to-purple-500/10 dark:from-sky-400/10 dark:to-purple-500/10 border-sky-200/50 dark:border-sky-800/50">
          <div>
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 mb-2">
              <Smile className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tâm trạng thời tiết</span>
            </div>
            <p className="text-xl font-medium text-slate-900 dark:text-white leading-snug">
              <span className="text-sky-500/90" aria-hidden>
                “
              </span>
              {insights.mood}
              <span className="text-sky-500/90" aria-hidden>
                ”
              </span>
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {insights.summary}
          </p>
        </Card>

        {/* Outfit Recommendation */}
        <Card className="flex flex-col gap-2 group hover:bg-white/50 dark:hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Shirt className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Trang phục</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {insights.outfit}
          </p>
        </Card>

        {/* Health Insights */}
        <Card className="flex flex-col gap-2 group hover:bg-white/50 dark:hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Sức khỏe (AQI & UV)</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            {insights.health}
          </p>
        </Card>

        {/* Travel Suggestion */}
        <Card className="md:col-span-2 lg:col-span-4 flex flex-row items-center gap-4 group hover:bg-white/50 dark:hover:bg-black/40 transition-colors">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
             <Map className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">Gợi ý hoạt động</span>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
              {insights.travel}
            </p>
          </div>
        </Card>

        {severe ? (
          <Card className="border-amber-300/60 bg-amber-50/80 dark:border-amber-700/40 dark:bg-amber-950/30 md:col-span-2 lg:col-span-4">
            <div className="flex flex-row items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                <CloudLightning className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                  Thời tiết nguy hiểm
                </span>
                <p className="mt-1 text-sm font-medium text-amber-950 dark:text-amber-50">{severe}</p>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </section>
  )
}