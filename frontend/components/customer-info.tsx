import { ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

// Dummy data - replace with your actual data
const customerInfo = {
  name: "Naomi Austin",
  role: "Product Marketing Manager at Unity",
  email: "naomi.austin@unity.com",
  phone: "(650) 555-9876",
  location: "Pacific Time (US & Canada)",
  language: "English (United States)",
  status: {
    current: "Prospect",
    date: "2nd April 2023",
    history: [
      {
        status: "Qualified lead",
        date: "1st April 2023",
      },
      {
        status: "Paying customer",
        date: "31st March 2023",
      },
    ],
  },
  tags: ["april-campaign", "demo-account", "enterprise"],
  company: {
    name: "Unity",
    type: "Game development",
    address: "760 Market Street, San Francisco, US",
  },
}

export function CustomerInfo() {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col divide-y">
        {/* Header */}
        <div className="p-6">
          <h2 className="text-xl font-semibold">{customerInfo.name}</h2>
          <p className="text-sm text-muted-foreground">{customerInfo.role}</p>
        </div>

        {/* Key Information */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Key information</h3>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm">{customerInfo.email}</p>
            <p className="text-sm">{customerInfo.phone}</p>
            <p className="text-sm">{customerInfo.location}</p>
            <p className="text-sm">{customerInfo.language}</p>
          </div>
        </div>

        {/* Status */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Status</h3>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">{customerInfo.status.current}</span>
              <span className="text-sm text-muted-foreground">{customerInfo.status.date}</span>
            </div>
            {customerInfo.status.history.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">{item.status}</span>
                <span className="text-sm text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tags</h3>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {customerInfo.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Company</h3>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium">{customerInfo.company.name}</p>
            <p className="text-sm">{customerInfo.company.type}</p>
            <p className="text-sm text-muted-foreground">{customerInfo.company.address}</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

