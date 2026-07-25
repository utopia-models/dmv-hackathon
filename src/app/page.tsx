export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <span className="rounded-full border border-white/15 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
        DMV Hackathon · 2026-07-25
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        Something is being built here.
      </h1>
      <p className="max-w-md text-balance text-neutral-400">
        Team Utopia Models — Tyler Youk &amp; Izzu Sulieman. GMU Fuse, Arlington VA.
        The concept drops at the 9:00 track reveal; the build goes live here.
      </p>
      <p className="font-mono text-xs text-neutral-600">hack.utopiamodels.ai</p>
    </main>
  );
}
