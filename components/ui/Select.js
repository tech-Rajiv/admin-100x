"use client";

export default function Select({ label, className, children, ...props }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-zinc-700">
          {label}
        </span>
      ) : null}
      <select
        className={[
          "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-zinc-300",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

