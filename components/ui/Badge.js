"use client";

export default function Badge({ children, color = "zinc" }) {
  const styles = {
    zinc: "bg-zinc-100 text-zinc-800 border-zinc-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[color] || styles.zinc,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

