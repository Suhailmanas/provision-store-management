interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color: string
  loading?: boolean
}

export default function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-medium opacity-75">{label}</p>
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold mt-1">{value}</p>
      )}
    </div>
  )
}
