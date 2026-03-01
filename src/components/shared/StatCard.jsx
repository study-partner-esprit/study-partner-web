import React from "react";

function StatCard({ icon, label, value, trend, className = "" }) {
  return (
    <div className={`bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {icon && <div className="text-primary">{icon}</div>}
        {trend !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend > 0
                ? "bg-green-500/10 text-green-500"
                : trend < 0
                ? "bg-red-500/10 text-red-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

export default StatCard;
