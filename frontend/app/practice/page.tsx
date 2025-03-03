import CircularProgress from "@/components/circular-progress";
import PracticeTable from "@/components/practice-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PracticePage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Practice Questions</h1>
        <p className="text-muted-foreground">
          Refine your skills with real-world scenarios
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
            <CircularProgress value={25} label="Comprehension" />
            <CircularProgress value={60} label="Tone" />
            <CircularProgress value={90} label="Accuracy" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Practice Sessions</CardTitle>
          <Button className="bg-primary hover:bg-primary/90">
            Start New Practice
          </Button>
        </CardHeader>
        <CardContent>
          <PracticeTable showRecommended={true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Account Information",
              "Dependent Protection Scheme",
              "Education",
            ].map((scheme) => (
              <Card key={scheme} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-muted h-32 flex items-center justify-center">
                    <div className="text-primary text-lg font-medium">
                      {scheme.split(" ")[0]}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-2">{scheme}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Practice scenarios related to {scheme.toLowerCase()}{" "}
                      inquiries.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
