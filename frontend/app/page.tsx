import { LineChart } from "@/components/charts/line-chart";
import { MetricGauge } from "@/components/metrics/metric-gauge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#001a1a] text-foreground">
      {/* TODO: Needs the hero image, but also looks quite bad */}
      <section className="relative w-full px-6 py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a1a] to-[#003333] opacity-90" />
          <div className="absolute inset-0 bg-[url('/ai-grid.svg')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            Introducing TextUs
          </h1>
          <p className="text-xl text-emerald-100/80 max-w-2xl mb-8">
            Enhance your CCU Officers' proficiency with our cutting-edge
            GenAI-powered training simulator. Designed to refine their skills in
            handling text inquiries efficiently, for a smarter, more effective
            training experience.
          </p>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 text-emerald-400">
        <div className="bg-[#002626] rounded-xl p-8 shadow-lg border border-emerald-900/30">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-6">
                Performance Metrics
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <MetricGauge title="Comprehension" value={85} color="emerald" />
                <MetricGauge title="Tone" value={75} color="teal" />
                <MetricGauge title="Accuracy" value={95} color="cyan" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Progress Tracking</h2>
                <div className="text-emerald-400 text-2xl font-bold">3.5/5</div>
              </div>
              <div className="h-64">
                <LineChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#002626] p-6 rounded-lg border border-emerald-900/30">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">
              Real-Time Progress Tracking
            </h3>
            <p className="text-emerald-100/70">
              Monitor performance as officers train, with instant feedback and
              analytics.
            </p>
          </div>
          <div className="bg-[#002626] p-6 rounded-lg border border-emerald-900/30">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">
              Data-Driven Insights
            </h3>
            <p className="text-emerald-100/70">
              Identify strengths and areas for development through comprehensive
              analytics.
            </p>
          </div>
          <div className="bg-[#002626] p-6 rounded-lg border border-emerald-900/30">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">
              Performance Reports
            </h3>
            <p className="text-emerald-100/70">
              Get detailed feedback for continuous improvement and skill
              development.
            </p>
          </div>
          <div className="bg-[#002626] p-6 rounded-lg border border-emerald-900/30">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">
              Training Effectiveness
            </h3>
            <p className="text-emerald-100/70">
              Measure skill growth over time with comprehensive progress
              metrics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 text-center">
        <Link href="/login">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-foreground px-8 py-6 text-lg rounded-lg">
            Login to Try TextUs
          </Button>
        </Link>
      </section>
    </div>
  );
}
