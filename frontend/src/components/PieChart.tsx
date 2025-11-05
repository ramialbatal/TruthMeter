import { useTranslation } from 'react-i18next'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useState } from 'react'

interface PieChartProps {
  agreementScore: number
  disagreementScore: number
  neutralScore: number
  totalSources: number
}

export default function PieChart({
  agreementScore,
  disagreementScore,
  neutralScore,
  totalSources,
}: PieChartProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Calculate raw counts
  const agreementCount = Math.round((agreementScore / 100) * totalSources)
  const disagreementCount = Math.round((disagreementScore / 100) * totalSources)
  const neutralCount = Math.round((neutralScore / 100) * totalSources)

  // Data for pie chart
  const data = [
    {
      name: t('results.agreement.label'),
      value: agreementScore,
      count: agreementCount,
      color: '#16a34a', // green-600
    },
    {
      name: t('results.disagreement.label'),
      value: disagreementScore,
      count: disagreementCount,
      color: '#dc2626', // red-600
    },
    {
      name: t('results.neutral.label'),
      value: neutralScore,
      count: neutralCount,
      color: '#6b7280', // gray-600
    },
  ]

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 relative">
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value.toFixed(1)}% ({data.count} {t('results.sources.count').toLowerCase()})
          </p>
        </div>
      )
    }
    return null
  }

  // Handle click on pie segments for mobile
  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={300} height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
              onClick={handlePieClick}
              activeIndex={activeIndex ?? undefined}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ outline: 'none', cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
              trigger="hover"
            />
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center text overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('results.sources.title')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalSources}
          </div>
        </div>
      </div>

      {/* Mobile tooltip - shows below chart on click */}
      {activeIndex !== null && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64 md:hidden">
          <p className="font-semibold text-gray-900 dark:text-white">{data[activeIndex].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data[activeIndex].value.toFixed(1)}% ({data[activeIndex].count} {t('results.sources.count').toLowerCase()})
          </p>
        </div>
      )}
    </div>
  )
}
