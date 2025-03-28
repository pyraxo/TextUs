import ProtectedRoute from "@/components/auth/protected-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">{children}</div>
    </ProtectedRoute>
  );
}
