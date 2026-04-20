"use client";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  return (
    <button
      className={cn(base, styles[variant] || styles.primary, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

