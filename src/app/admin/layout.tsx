import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin | Feel Better Club",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand-light">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
