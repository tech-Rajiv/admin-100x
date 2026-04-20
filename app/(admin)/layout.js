import Header from "@/components/Header";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}

