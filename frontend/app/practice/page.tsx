"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Icon, IconName } from "@/components/ui/icon-picker";
import { useSchemes } from "@/hooks/use-schemes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEFAULT_ICON = "home";

export default function PracticePage() {
  const { data: schemes } = useSchemes();
  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-muted-background hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6 text-foreground">Schemes</h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal text-foreground">
            Which scheme would you like to practice today?
          </h2>
        </div>
      </div>

      {/* Schemes grid */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes &&
            schemes.map((scheme) => (
              <Link href={`/practice/${scheme.slug}`} key={scheme.id}>
                <Card className="overflow-hidden rounded-lg hover:shadow-md transition-shadow border-0 group relative h-full">
                  <CardContent className="p-0 flex flex-col">
                    <div className="px-6 py-6">
                      <div className="flex items-center gap-4 mb-3">
                        <Icon
                          name={(scheme.icon || DEFAULT_ICON) as IconName}
                          className="h-8 w-8 stroke-[2px]"
                        />
                        <h3 className="text-xl font-bold text-card-foreground">
                          {scheme.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scheme.description}
                      </p>
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
