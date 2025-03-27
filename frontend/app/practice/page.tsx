import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Home,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";

const schemes = [
  {
    title: "Home Ownership",
    description: "Understand the essentials of home ownership",
    href: "/practice/home-ownership",
    icon: <Home className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Retirement",
    description: "Retirement income with CPF",
    href: "/practice/retirement",
    icon: <BookOpen className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Healthcare",
    description: "Peace of mind for your healthcare needs",
    href: "/practice/healthcare",
    icon: <HeartPulse className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Education",
    description: "Support for lifelong learning",
    href: "/practice/education",
    icon: <GraduationCap className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Employer Services",
    description: "Managing CPF contributions for employees",
    href: "/practice/employer-services",
    icon: <Briefcase className="h-8 w-8 text-black stroke-[2px]" />,
  },
  {
    title: "Housing Protection Scheme",
    description: "Protection for your housing loan",
    href: "/practice/housing-protection",
    icon: <HomeIcon className="h-8 w-8 text-black stroke-[2px]" />,
  },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header content area */}
      <div className="bg-[#E8F6F4] pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6">Schemes</h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal">
            Which scheme would you like to practice today?
          </h2>
        </div>
      </div>

      {/* Schemes grid */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <Link href={scheme.href} key={scheme.title}>
              <Card className="overflow-hidden border rounded-lg hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col">
                  <div className="px-6 py-6">
                    <div className="flex items-center gap-4 mb-3">
                      {scheme.icon}
                      <h3 className="text-xl font-bold">{scheme.title}</h3>
                    </div>
                    <p className="text-sm">{scheme.description}</p>
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
