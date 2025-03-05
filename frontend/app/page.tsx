import SchemeGrid from "@/components/scheme-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-6 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start training with CPF Simulator
          </h1>
          <p className="text-muted-foreground mb-8">
            This is a training simulator to help you master concepts that are
            relevant to customer service officers. It will help you to provide
            accurate and efficient responses to customer enquiries.
          </p>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8">
              Login to Start
            </Button>
          </Link>
        </div>
        <div className="w-full max-w-xl bg-muted rounded-lg overflow-hidden shadow-md">
          <div className="bg-background m-4 rounded-lg p-4">
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Welcome, Brighton</h2>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">
                    Average Scores
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    All
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["Comprehension", "Tone", "Accuracy"].map(
                    (category, index) => (
                      <div
                        key={category}
                        className="flex flex-col items-center"
                      >
                        <div className="relative w-24 h-24">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="white"
                              stroke="#d9d9d9"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              stroke="#0b6160"
                              strokeWidth="10"
                              strokeDasharray={`${
                                [25, 60, 90][index] * 2.83
                              } 283`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold">
                              {[25, 60, 90][index]}%
                            </span>
                          </div>
                        </div>
                        <span className="text-sm mt-2">{category}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Scheme Mastery</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    60% Complete
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Understand major scheme concepts relevant to customer service
                  officers. Master key information to provide accurate responses
                  to customer enquiries.
                </p>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Practice Details</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <div className="text-xs">
                  <div className="grid grid-cols-2 gap-2 font-medium py-1 border-b">
                    <span>Scenario</span>
                    <span>Score</span>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 gap-2 py-1 border-b last:border-b-0"
                    >
                      <span className="truncate pr-2">
                        Enquiry about CPF Withdrawal
                      </span>
                      <span>76/100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Section */}
      <section className="w-full max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Practice and refine your skills
          </h2>
          <p className="text-muted-foreground mb-8">
            The practice cases within the simulator are adapted from real-life
            enquiries received by the Customer Service Centre and CPO, ensuring
            you are prepared for authentic scenarios during training.
          </p>
        </div>
        <div className="w-full max-w-xl bg-muted rounded-lg overflow-hidden shadow-md p-4">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Overall Scores</h3>
            <div className="grid grid-cols-3 gap-4">
              {["Comprehension", "Tone", "Accuracy"].map((category, index) => (
                <div key={category} className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="white"
                        stroke="#d9d9d9"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke="#0b6160"
                        strokeWidth="10"
                        strokeDasharray={`${[25, 60, 90][index] * 2.83} 283`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {[25, 60, 90][index]}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm mt-2">{category}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {["Comprehension", "Tone", "Accuracy"].map((category) => (
                <div key={category} className="text-xs text-muted-foreground">
                  <h4 className="font-medium text-sm text-foreground mb-2">
                    {category}
                  </h4>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing.
                    Pellentesque pharetra felis turpis, sed feugiat est eleifend
                    non. Vivamus ultrices. Mauris id ligula consequat nibla a
                    cursus nunc.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="w-full max-w-7xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Gain valuable feedback on your performance
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-12">
          Through this immersive training experience, you can identify areas of
          strength and opportunities for improvement, ultimately enhancing your
          ability to provide effective and efficient responses to customer
          enquiries.
        </p>

        <SchemeGrid />
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 flex justify-center">
        <Link href="/login">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8">
            Log In to Start
          </Button>
        </Link>
      </section>
    </div>
  );
}
