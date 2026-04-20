"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function Header() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">
          Quiz Admin
        </div>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

