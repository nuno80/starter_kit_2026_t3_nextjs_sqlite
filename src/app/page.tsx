import { HeroSection, StackSection } from "~/app/_components/landing-sections";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full bg-plaster text-ink">
      <HeroSection />
      <StackSection />
    </main>
  );
}
