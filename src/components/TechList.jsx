/**
 * TechList — Exibe a lista de tecnologias com suporte a edição e remoção.
 *
 * Props:
 * - techs: array de objetos { id, name, priority }
 * - onUpdate(id, updates): função para atualizar
 * - onDelete(id): função para remover
 * - loading: boolean indicando carregamento
 *
 * Conceitos usados:
 * - map(): transforma cada item do array em um componente React
 * - key: identificador único para React otimizar re-renders
 * - Renderização condicional: mostra loading, empty ou lista
 */
import PropTypes from "prop-types";
import TechCard from "./TechCard";
import EmptyState from "./EmptyState";
import { Loader2 } from "lucide-react";

function TechList({ techs, onUpdate, onDelete, loading }) {
  // Estado de carregamento — mostra skeleton animado
  if (loading) {
    return (
      <div className="w-full max-w-lg mt-6">
        <div className="flex items-center justify-center gap-2 text-white/50 py-8">
          <Loader2 size={20} className="animate-spin" />
          <span>Carregando tecnologias...</span>
        </div>
      </div>
    );
  }

  // Estado vazio — mostra mensagem amigável
  if (techs.length === 0) {
    return <EmptyState />;
  }

  // Lista de tecnologias
  return (
    <div className="w-full max-w-lg mt-6 space-y-3">
      {/* Cabeçalho da lista */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-white/60 text-sm font-medium">
          Sua Wishlist
        </h2>
        <span className="text-white/30 text-xs">
          {techs.length} {techs.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* 
        Renderiza cada tech como um TechCard.
        IMPORTANTE: usamos tech.id como key (nunca o index!)
        → O React usa a key para saber qual item mudou, foi adicionado ou removido.
        → Usar index como key pode causar bugs visuais em listas dinâmicas.
      */}
      {techs.map((tech) => (
        <TechCard
          key={tech.id}
          tech={tech}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// Validação das props
TechList.propTypes = {
  techs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      priority: PropTypes.number.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default TechList;
