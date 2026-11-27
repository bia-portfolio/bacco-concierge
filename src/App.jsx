import BaccoConcierge from './components/BaccoConcierge';

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#070708] px-4 py-12 text-slate-200">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Bacco · Strict-RAG Wine Concierge
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Interactive Conversation Design prototype by Ana Beatriz Miranda
        </p>
      </div>
      <BaccoConcierge />
    </main>
  );
}