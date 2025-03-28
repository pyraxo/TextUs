import ProtectedRoute from "@/components/auth/protected-route";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute trainerOnly>{children}</ProtectedRoute>;
}
