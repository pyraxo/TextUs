import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const profileTemplates = [
  {
    id: 1,
    title: "Template 1",
  },
  {
    id: 2,
    title: "Template 2",
  },
  {
    id: 3,
    title: "Template 3",
  },
  {
    id: 4,
    title: "Template 4",
  },
];

const createdProfiles = [
  {
    id: 1,
    title: "Profile #1",
  },
  {
    id: 2,
    title: "Profile #2",
  },
  {
    id: 3,
    title: "Profile #3",
  },
  {
    id: 4,
    title: "Profile #4",
  },
  {
    id: 5,
    title: "Profile #5",
  },
  {
    id: 6,
    title: "Profile #6",
  },
  {
    id: 7,
    title: "Profile #7",
  },
  {
    id: 8,
    title: "Profile #8",
  },
  {
    id: 9,
    title: "Profile #9",
  },
];

export default function CustomerProfilePage() {
  return (
    <div className="bg-foreground">
      {/* Header content area */}
      <div className="bg-[#E8F6F4] pt-8 pb-8">
        <div className="container mx-auto px-4">
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">
            Customer Profile Configuration
          </h1>

          {/* Subheading */}
          <h2 className="text-sm">
            Create and manage customer profiles for training scenarios
          </h2>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates section */}
          <div>
            <h2 className="text-xl font-bold mb-3">
              Select Template to generate Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-gray-200 border border-black overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 flex items-center justify-center h-16">
                    <h3 className="text-base font-medium">{template.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Profile preview section */}
          <div>
            <h2 className="text-xl font-bold mb-3">Profile #1</h2>
            <Card className="bg-gray-200 border border-black p-4 mb-4">
              <p className="text-sm mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                semper velit a tristique molestie. Sed consectetur leo rhoncus,
                tempus urna placerat, ornare arcu. Proin ac mi at elit tincidunt
                venenatis ut sit amet nunc. Phasellus luctus justo nec ultricies
                condimentum.
              </p>
              <p className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                faucibus arcu vitae neque tincidunt, consectetur posuere nibh
                finibus. Sed non elit sed nibh mattis fringilla at ac nisi.
                Fusce ultricies, urna a auctor cursus, ex urna suscipit nisl.
              </p>
            </Card>
          </div>
        </div>

        {/* Created profiles section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">Created Profiles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {createdProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="bg-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-2 flex items-center justify-center h-12">
                  <h3 className="text-sm font-medium">{profile.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scenarios section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">Scenarios</h2>
          <Card className="bg-gray-200 p-4">
            <h3 className="text-base font-medium mb-1">Create Scenarios</h3>
            <p className="text-sm mb-3">Drop down to select chosen profiles</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-cpf-teal text-backgound text-xs py-1 px-3 h-8"
              >
                Create Scenario
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
