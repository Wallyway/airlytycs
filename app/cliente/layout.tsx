import { ClientStoreHeader } from "@/components/client/ClientStoreHeader";

export const metadata = {
  title: "Tienda - Equipo Médico",
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ClientStoreHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
