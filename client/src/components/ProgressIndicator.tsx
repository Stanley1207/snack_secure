interface ProgressIndicatorProps {
  current: number
  total: number
  labels?: string[]
}

export default function ProgressIndicator({ current, total, labels }: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {current} / {total}
        </span>
        <span className="text-sm font-medium text-primary-600">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-4">
          {labels.map((label, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index < current ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < current
                    ? 'bg-primary-600 text-white'
                    : index === current
                    ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 text-center max-w-[80px]">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
