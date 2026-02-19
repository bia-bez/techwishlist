/**
 * App.jsx — Componente principal da aplicação Tech Wishlist.
 *
 * Aqui orquestramos todos os componentes e usamos o hook customizado
 * useTechs para gerenciar os dados.
 *
 * Arquitetura:
 * ┌─────────────────────────────────┐
 * │            App                  │
 * │  ┌───────────────────────────┐  │
 * │  │      ErrorBanner          │  │
 * │  ├───────────────────────────┤  │
 * │  │      TechForm             │  │
 * │  ├───────────────────────────┤  │
 * │  │      TechList             │  │
 * │  │  ┌─────────────────────┐  │  │
 * │  │  │   TechCard (cada)   │  │  │
 * │  │  └─────────────────────┘  │  │
 * │  └───────────────────────────┘  │
 * └─────────────────────────────────┘
 *
 * Conceitos usados:
 * - Custom Hook (useTechs): toda lógica de dados está isolada
 * - Composição: App monta os componentes como blocos
 * - Props drilling: App passa funções para os filhos
 */
import TechForm from "./components/TechForm";
import TechList from "./components/TechList";
import ErrorBanner from "./components/ErrorBanner";
import { useTechs } from "./hooks/useTechs";
import { Code2 } from "lucide-react";

function App() {
  // Hook customizado retorna dados + funções CRUD + estados
  const { techs, loading, error, addTech, updateTech, deleteTech, clearError } =
    useTechs();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center relative overflow-hidden">
      {/* Efeitos de fundo decorativos */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* Container principal com padding responsivo */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-10 flex flex-col items-center">
        {/* Logo e título */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4 shadow-lg shadow-emerald-500/20">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tech Wishlist
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Organize suas metas de aprendizado
          </p>
        </header>

        {/* Banner de erro (só aparece quando há erro) */}
        <ErrorBanner message={error} onClose={clearError} />

        {/* Formulário de adição */}
        <TechForm onAdd={addTech} />

        {/* Lista de tecnologias */}
        <TechList
          techs={techs}
          onUpdate={updateTech}
          onDelete={deleteTech}
          loading={loading}
        />
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 w-full text-center py-6 mt-auto">
        <p className="text-white/20 text-xs">
          Feito com ❤️ por{" "}
          <a
            href="https://github.com/bia-bez"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500/50 hover:text-emerald-400 transition-colors"
          >
            bia-bez
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
