import React from "react";

function ProgressBar({
  value = 0,
  max = 100,
  label = "",
  showPercentage = true,
  size = "md",
  color = "primary",
  className = "",
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5",
  };

  const colors = {
    primary: "from-primary to-primary/80",
    green: "from-green-500 to-green-400",
    blue: "from-blue-500 to-blue-400",
    yellow: "from-yellow-500 to-yellow-400",
    red: "from-red-500 to-red-400",
    purple: "from-purple-500 to-purple-400",
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs text-muted-foreground font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs text-muted-foreground font-bold">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-muted/50 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
