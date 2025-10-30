import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight font-handjet">
          Create Heroes ⚡ and Villains 💀. Give them superpowers. Let the carnage begin 🔥
        </h1>
        <p className="text-zinc-700 text-lg">
          The games are fair — ruled by an AI Supreme called 🍪 Cookie. We know the name isn’t scary, but trust us: Cookie is your worst nightmare. Never challenge them to a duel ⚠️
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="/profile">Create Characters</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/how-it-works">How it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

