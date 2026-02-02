interface ResultCardProps {
  title: string
  status: 'passed' | 'failed' | 'partial'
  items: {
    label: string
    status: 'passed' | 'failed' | 'partial' | 'na'
    recommendation?: string
  }[]
}

export default function ResultCard({ title, status, items }: ResultCardProps) {
  const statusColors = {
    passed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const itemStatusColors = {
    passed: 'text-green-600',
    failed: 'text-red-600',
    partial: 'text-yellow-600',
    na: 'text-gray-400'
  }

  const statusIcons = {
    passed: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    failed: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    partial: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    na: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`px-6 py-4 border-b ${statusColors[status]}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="flex items-center space-x-1">
            {statusIcons[status]}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-start justify-between">
              <span className="text-gray-700">{item.label}</span>
              <span className={`flex items-center ${itemStatusColors[item.status]}`}>
                {statusIcons[item.status]}
              </span>
            </div>
            {item.recommendation && item.status === 'failed' && (
              <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                {item.recommendation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
