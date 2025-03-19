import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Sliders, Users } from "lucide-react";
import Link from "next/link";

const settingsOptions = [
  {
    title: "Prompt Engineering Controls",
    description: "Configure AI prompt engineering settings",
    href: "/admin/settings/prompt-engineering",
    icon: <Sliders className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Question Bank Modifier",
    description: "Manage the question bank for assessments",
    href: "/admin/settings/question-bank",
    icon: <MessageSquare className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Customer Profile Configuration",
    description: "Configure customer profile settings",
    href: "/admin/settings/customer-profile",
    icon: <Users className="h-8 w-8 text-black stroke-[2px]" />,
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header content area */}
      <div className="bg-[#E8F6F4] pt-16 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6">Settings</h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal">
            Which settings would you like to configure today?
          </h2>
        </div>
      </div>

      {/* Settings grid */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsOptions.map((option) => (
            <Link href={option.href} key={option.title}>
              <Card className="overflow-hidden border rounded-lg hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col">
                  <div className="px-6 py-6">
                    <div className="flex items-center gap-4 mb-3">
                      {option.icon}
                      <h3 className="text-xl font-bold">{option.title}</h3>
                    </div>
                    <p className="text-sm">{option.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
