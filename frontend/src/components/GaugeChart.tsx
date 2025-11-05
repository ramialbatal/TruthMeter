import { useTranslation } from 'react-i18next'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface GaugeChartProps {
  score: number // 0-100
  label: string
}

export default function GaugeChart({ score, label }: GaugeChartProps) {
  const { t } = useTranslation()

  // Get color based on score
  const getColor = (s: number) => {
    if (s >= 70) return '#16a34a' // green-600
    if (s >= 40) return '#f97316' // orange-500
    return '#dc2626' // red-600
  }

  const color = getColor(score)

  // Data for the radial bar chart
  const data = [
    {
      name: 'Score',
      value: score,
      fill: color,
    },
  ]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={280} height={200}>
        <RadialBarChart
          cx="50%"
          cy="70%"
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={10}
            animationDuration={1500}
            animationBegin={0}
          />
          {/* Score labels */}
          <text
            x="15%"
            y="95%"
            textAnchor="start"
            fontSize="12"
            fill="#9ca3af"
          >
            0
          </text>
          <text
            x="50%"
            y="30%"
            textAnchor="middle"
            fontSize="12"
            fill="#9ca3af"
          >
            50
          </text>
          <text
            x="85%"
            y="95%"
            textAnchor="end"
            fontSize="12"
            fill="#9ca3af"
          >
            100
          </text>
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Score display */}
      <div className="mt-2 text-center">
        <div className="text-5xl font-bold" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-3 max-w-[250px]">
          {t('results.accuracy.explanation')}
        </div>
      </div>
    </div>
  )
}
