// StatsCard.tsx - Updated
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({
  title,
  value,
  trend,
  icon: Icon
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  icon?: React.ElementType;
}) {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        {Icon && (
          <div className="p-3 bg-green-50 rounded-lg">
            <Icon className="w-6 h-6 text-green-600" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '+12%' : '-5%'} from last month
          </span>
        </div>
      )}
    </div>
  );
}