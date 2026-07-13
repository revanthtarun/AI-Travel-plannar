export default function Hero() {
  return (
    <div className="hero-gradient py-12 md:py-20 px-4 md:px-8 text-center text-white min-h-[380px] flex flex-col items-center">
      <div className="max-w-3xl animate-fade-in relative z-[2]">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-blue-200 mb-4">
          <span>✨ Personalized cost sheets via GenAI reasoning</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          AI Travel Budget Planner
        </h2>
        <p className="text-white/80 mt-3 text-sm md:text-base font-light max-w-xl mx-auto">
          Estimate transportation, accommodation, meals, sightseeing, and shopping — then chat with AI to optimize in real-time.
        </p>
      </div>
    </div>
  );
}
