import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, FileText, GraduationCap, Heart, Users } from "lucide-react";

export default function SchemeGrid() {
  const schemes = [
    {
      title: "Account Information",
      icon: <FileText className="h-10 w-10 text-primary" />,
      scenarios: 8,
    },
    {
      title: "Dependent Protection Scheme",
      icon: <Users className="h-10 w-10 text-primary" />,
      scenarios: 6,
    },
    {
      title: "Education",
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      scenarios: 4,
    },
    {
      title: "ElderShield & CareShield Life",
      icon: <Heart className="h-10 w-10 text-primary" />,
      scenarios: 10,
    },
    {
      title: "Employer Services & Agencies",
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      scenarios: 5,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {schemes.map((scheme) => (
        <Card key={scheme.title} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-[#fcf9f2] h-32 flex items-center justify-center">
              {scheme.icon}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm mb-2">{scheme.title}</h3>
              <div className="flex items-center justify-between text-xs">
                <span>Core Scenarios: {scheme.scenarios}</span>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  60%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
