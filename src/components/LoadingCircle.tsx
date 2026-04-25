interface LoadingCircleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingCircle({ size = "md", className = "" }: LoadingCircleProps) {
  const sizeClass = size === "sm" ? "loader-sm" : size === "lg" ? "loader-lg" : "loader-md";

  return (
    <span className={`loading-circle ${sizeClass} ${className}`.trim()} aria-hidden="true">
      <span className="loading-circle-aura" />
      <span className="loading-circle-ring" />
      <span className="loading-circle-orbit">
        <span className="loading-circle-dot loading-circle-dot-primary" />
        <span className="loading-circle-dot loading-circle-dot-secondary" />
      </span>
      <span className="loading-circle-core" />
    </span>
  );
}
