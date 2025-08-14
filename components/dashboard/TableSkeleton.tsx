'use client';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-600">
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="text-left py-3 px-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`border-b border-gray-700/50 ${
                rowIndex % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
              }`}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-3 px-4">
                  <div className={`h-4 bg-gray-600 rounded animate-pulse ${
                    colIndex === 0 ? 'w-16' : // Symbol column
                    colIndex === 1 ? 'w-20' : // Date column
                    colIndex === 2 ? 'w-12' : // Short badges
                    colIndex === 3 ? 'w-20' : // Prices
                    'w-16' // Default
                  }`} style={{
                    animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`
                  }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}