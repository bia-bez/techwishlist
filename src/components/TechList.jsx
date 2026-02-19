/**
 * TechList — Canvas livre para cards arrastáveis.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 MENTORIA — O CANVAS INFINITO                               ║
 * ║                                                                ║
 * ║  Diferente de um grid tradicional (onde itens ficam em colunas ║
 * ║  e linhas fixas), este componente cria uma ÁREA LIVRE (canvas) ║
 * ║  onde cards ficam com position: absolute em coordenadas x, y.  ║
 * ║                                                                ║
 * ║  É como uma mesa infinita onde você pode colocar Post-its      ║
 * ║  em qualquer lugar. Esse padrão é usado por:                   ║
 * ║  Railway, Miro, Figma, Excalidraw, etc.                        ║
 * ║                                                                ║
 * ║  A "mágica" está na CSS transform aplicada ao canvas:          ║
 * ║    transform: translate(x, y) scale(zoom)                      ║
 * ║  Isso move o canvas INTEIRO (com todos os filhos) de uma vez.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Hierarquia esperada:
 *   <DndContext>            ← provedor de drag-and-drop
 *     <dashboard-canvas>    ← div com transform de pan/zoom
 *       <canvas-grid>       ← grid de pontos decorativo
 *       {children}          ← widgets (logo, formulário)
 *       <TechCard /> × N    ← cards de tecnologia
 *     </dashboard-canvas>
 *   </DndContext>
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
  onDragStart,  // Callback para Auto-Pan (sinaliza início de drag)
  onDragMove,   // Callback opcional para rastrear posição do drag
  onResize,
  loading,
  viewState,    // Estado da câmera { x, y, scale }
  children,     // Widgets passados como filhos (composition pattern)
}) {
  /**
   * 🎓 MENTORIA — Sensors (sensores de drag)
   *
   * Sensores definem COMO e QUANDO o drag é ativado.
   * Sem eles, qualquer clique seria interpretado como drag.
   *
   * PointerSensor (mouse/pen):
   *   activationConstraint: { distance: 8 }
   *   → O usuário precisa mover o mouse 8px ANTES do drag iniciar.
   *   → Isso previne que cliques normais acidentalmente arrastem.
   *
   * TouchSensor (celular/tablet):
   *   delay: 200ms → precisa segurar 200ms antes de arrastar
   *   tolerance: 5px → pode mover até 5px durante o delay
   *   → Isso evita que o scroll da página seja bloqueado.
   *
   * useSensors() combina múltiplos sensores. O dnd-kit usa o
   * primeiro que ativar (PointerSensor no desktop, TouchSensor no mobile).
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={24} className="animate-spin text-violet-400" />
        <span className="text-white/50">Carregando tecnologias...</span>
      </div>
    );
  }

  /**
   * 🎓 MENTORIA — CSS Transform para Canvas Infinito
   *
   * A transformação CSS é o "coração" do canvas infinito:
   *
   * translate(x, y) → Move o canvas (pan)
   *   x positivo = canvas vai para direita
   *   y positivo = canvas vai para baixo
   *
   * scale(zoom) → Zoom in/out
   *   1 = 100% (normal)
   *   0.5 = 50% (zoom out)
   *   2 = 200% (zoom in)
   *
   * transformOrigin: "0 0" → O ponto de referência (0,0) é o topo-esquerdo.
   *   Isso simplifica muito a matemática: o translate funciona em
   *   coordenadas absolutas da tela, sem compensações complicadas.
   *
   * Nullish coalescing (?? 0): fallback se viewState for undefined.
   */
  const canvasStyle = {
    transform: `translate(${viewState?.x ?? 0}px, ${viewState?.y ?? 0}px) scale(${viewState?.scale ?? 1})`,
    transformOrigin: "0 0",
    width: "100%",
    height: "100%",
  };

  return (
    <div className="dashboard-container">
      {/*
        🎓 MENTORIA — DndContext (Provedor de Drag-and-Drop)

        O DndContext é o "contexto" do dnd-kit. Funciona como um
        React Context que fornece dados de drag para TODOS os filhos.

        Props de eventos:
        - onDragStart: quando qualquer useDraggable começa a ser arrastado
        - onDragMove: a cada pixel de movimento durante drag
        - onDragEnd: quando o drag termina (solta o item)

        Esses callbacks são repassados do App.jsx (handleGlobalDragStart,
        handleGlobalDragEnd) para ativar o auto-pan e salvar posições.
      */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd} onDragStart={onDragStart} onDragMove={onDragMove}>
        <div
          className="dashboard-canvas"
          style={canvasStyle}
        >
          {/* Grid de pontos decorativo — referência visual para o canvas */}
          <div className="canvas-grid" />

          {/* 
            Widgets via Children Pattern (Composition):
            O App.jsx passa <BrandLogoWidget /> e <TechFormWidget />
            como children, que são renderizados aqui dentro do canvas
            transformado. Isso garante que zoom/pan afetam tudo igualmente.
          */}
          {children}

          {/* Cards de tecnologia — ou EmptyState se não houver nenhum */}
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

/**
 * 🎓 MENTORIA — PropTypes Completos
 *
 * arrayOf(shape({...})): array de objetos com formato específico
 * object: qualquer objeto (para mapas como positions/sizes)
 * node: qualquer coisa que o React pode renderizar (JSX, string, number, etc.)
 *
 * Dica: em projetos grandes, use TypeScript em vez de PropTypes
 * para validação em tempo de compilação (mais seguro).
 */
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
  onDragStart: PropTypes.func,   // Opcional — usado pelo Auto-Pan
  onDragMove: PropTypes.func,    // Opcional — não usado ativamente
  onResize: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  viewState: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
  }),
  children: PropTypes.node,      // Widgets passados via composition
};

export default TechList;
