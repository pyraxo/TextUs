import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-16">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
          <br />
          It might have been moved, deleted, or never existed in the first
          place.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
