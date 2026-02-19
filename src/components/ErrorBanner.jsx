/**
 * ErrorBanner — Banner de erro que aparece no topo da tela.
 *
 * Props:
 * - message: texto do erro
 * - onClose: função para fechar o banner
 *
 * Conceitos usados:
 * - Renderização condicional: só aparece se message existir
 * - Props para comunicação com componente pai
 */
import PropTypes from "prop-types";
import { AlertTriangle, X } from "lucide-react";

function ErrorBanner({ message, onClose }) {
    // Não renderiza nada se não houver mensagem
    if (!message) return null;

    return (
        <div className="w-full max-w-lg mb-4 animate-fade-in">
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                    title="Fechar"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

ErrorBanner.propTypes = {
    message: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default ErrorBanner;
