interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color: string
  loading?: boolean
}

export default function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  return (
    <div className={`${color} rounded-[12px] p-4 border border-border bg-card`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-8 bg-muted rounded-md animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-poppins font-semibold mt-1 text-foreground">{value}</p>
      )}
    </div>
  )
}
