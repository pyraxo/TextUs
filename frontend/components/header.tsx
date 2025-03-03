import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between px-8 bg-cpf-teal text-white">
      <div className="flex items-center gap-2">
        <Image
          src="/cpf_logo.png"
          alt="CPF Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <span className="text-xl font-bold">CPF Board</span>
      </div>
      <Button variant="ghost" className="text-white hover:bg-cpf-teal-dark">
        Log In
      </Button>
    </header>
  );
}
