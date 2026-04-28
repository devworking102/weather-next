export type AlertLevel = 'info' | 'warning' | 'danger'

export interface WeatherAlert {
  id: string
  level: AlertLevel
  icon: string
  title: string
  message: string
}
