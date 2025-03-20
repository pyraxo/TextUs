import { ReactNode } from "react";

interface PromptEngineeringLayoutProps {
  children: ReactNode;
}

export default function PromptEngineeringLayout({
  children,
}: PromptEngineeringLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 bg-[#A5CF4C] bg-opacity-80" />
      {children}
    </div>
  );
}
