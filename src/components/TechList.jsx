/**
 * TechList — Canvas livre para cards arrastáveis.
 *
 * Diferente de um grid tradicional, este componente cria uma
 * área (canvas) onde os cards podem ser posicionados livremente,
 * como na dashboard do Railway.
 *
 * Conceitos:
 * - DndContext: provedor de drag-and-drop do @dnd-kit
 * - PointerSensor / TouchSensor: detectam drag via mouse/touch
 * - Canvas com position: relative contém cards com position: absolute
 * - Cada card tem suas coordenadas x,y e tamanho w,h independentes
 */
import PropTypes from "prop-types";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import TechCard from "./TechCard";
import EmptyState from "./EmptyState";

function TechList({
  techs,
  positions,
  sizes,
  onUpdate,
  onDelete,
  onDragEnd,
  onResize,
  loading,
  viewState, // Novo prop
  children,
}) {
  /**
   * Sensors definem como o drag é iniciado.
   * 
   * - PointerSensor: Mouse e Pen. activationConstraint (distance: 8) previne
   *   que qualquer clique seja confundido com drag. O usuário precisa mover 8px
   *   para o drag começar.
   * 
   * - TouchSensor: Telas de toque (celular/tablet).
   *   delay: 200ms e tolerance: 5px evitam que o scroll da página
   *   seja bloqueado acidentalmente.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // ─── Loading ───
  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={24} className="animate-spin text-violet-400" />
        <span className="text-white/50">Carregando tecnologias...</span>
      </div>
    );
  }

  // ─── Estilo do Canvas Infinito ───
  const canvasStyle = {
    transform: `translate(${viewState?.x ?? 0}px, ${viewState?.y ?? 0}px) scale(${viewState?.scale ?? 1})`,
    transformOrigin: "0 0", // Zoom e Pan partem do topo esquerdo (simplifica math)
    width: "100%",
    height: "100%",
  };

  return (
    <div className="dashboard-container">
      {/* Canvas de drag livre */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="dashboard-canvas"
          style={canvasStyle}
        >
          {/* Grid de referência visual (pontos) - Escala junto ou fica fixo? 
              Se ficar dentro, escala junto (melhor para referência de espaço).
          */}
          <div className="canvas-grid" />

          {/* Renderiza Widgets (TechForm) */}
          {children}

          {/* Renderiza Cards ou Empty State */}
          {techs.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <EmptyState />
            </div>
          ) : (
            techs.map((tech) => (
              <TechCard
                key={tech.id}
                tech={tech}
                position={positions[tech.id] || { x: 0, y: 0 }}
                size={sizes[tech.id]}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onResize={onResize}
              />
            ))
          )}
        </div>
      </DndContext>
    </div>
  );
}

TechList.propTypes = {
  techs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      priority: PropTypes.number.isRequired,
    })
  ).isRequired,
  positions: PropTypes.object.isRequired,
  sizes: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  viewState: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
  }),
  children: PropTypes.node,
};

export default TechList;
