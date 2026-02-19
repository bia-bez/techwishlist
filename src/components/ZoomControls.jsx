/**
 * ZoomControls — Barra de controle de zoom flutuante.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 MENTORIA — COMPONENTE PRESENTATIONAL (PURO)               ║
 * ║                                                                ║
 * ║  Este componente NÃO tem estado próprio. Ele apenas:           ║
 * ║  1. RECEBE dados (scale) e callbacks (onZoomIn, etc.) via props║
 * ║  2. RENDERIZA botões bonitos                                   ║
 * ║  3. CHAMA os callbacks quando clicados                         ║
 * ║                                                                ║
 * ║  Isso se chama "Presentational Component" (ou "Dumb Component")║
 * ║  → A lógica fica no pai (App.jsx),                             ║
 * ║  → Ele só se preocupa com APARÊNCIA.                           ║
 * ║                                                                ║
 * ║  Vantagem: fácil de testar, reutilizar e estilizar.            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Props:
 * @param {number} scale - Nível de zoom atual (ex: 1 = 100%, 0.5 = 50%)
 * @param {Function} onZoomIn - Callback ao clicar em "+"
 * @param {Function} onZoomOut - Callback ao clicar em "-"
 * @param {Function} onReset - Callback ao clicar em "Reset"
 */
import { Plus, Minus, RotateCcw } from "lucide-react";
import PropTypes from "prop-types";

function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }) {
    return (
        /**
         * 🎓 MENTORIA — Posicionamento Fixo
         *
         * "fixed bottom-6 right-6" = fixo no canto inferior direito da JANELA.
         * z-50 = z-index:50 → garante que fique acima do canvas (que tem z menores).
         * Essas classes são do Tailwind CSS:
         *   fixed    → position: fixed
         *   bottom-6 → bottom: 1.5rem (24px)
         *   right-6  → right: 1.5rem (24px)
         */
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
            {/* Botão Zoom In (+) */}
            <button
                onClick={onZoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Zoom In"
            >
                <Plus size={20} />
            </button>

            {/* Botão Zoom Out (-) */}
            <button
                onClick={onZoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Zoom Out"
            >
                <Minus size={20} />
            </button>

            {/* Botão Reset — volta para zoom 100% e posição (0,0) */}
            <button
                onClick={onReset}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white transition-all shadow-lg active:scale-95"
                title="Reset View"
            >
                <RotateCcw size={16} />
            </button>

            {/* 
              Indicador de porcentagem do zoom.
              Math.round(scale * 100) converte 0.5 → 50, 1 → 100, 2 → 200
              font-mono: fonte monoespaçada (dígitos com largura fixa = não "pula")
            */}
            <div className="text-center text-xs font-mono text-white/40 bg-black/50 rounded px-1 py-0.5 mt-1 backdrop-blur-sm">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
}

/**
 * 🎓 MENTORIA — PropTypes (Validação de Props)
 *
 * PropTypes verificam em runtime (modo dev) se os props recebidos
 * estão no formato correto. É como um "contrato" entre componentes.
 *
 * .isRequired = obrigatório — se faltar, React mostra warning no console.
 *
 * Em produção, PropTypes são removidos (não afetam performance).
 * Para projetos maiores, considere TypeScript como alternativa.
 */
ZoomControls.propTypes = {
    scale: PropTypes.number.isRequired,
    onZoomIn: PropTypes.func.isRequired,
    onZoomOut: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
};

export default ZoomControls;
