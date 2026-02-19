/**
 * App.jsx — Componente raiz da aplicação Tech Wishlist.
 *
 * Gerencia:
 * - CRUD via hook useTechs (Supabase)
 * - Posições x,y de cada card no canvas (drag livre)
 * - Tamanhos w,h de cada card (resize)
 * - Posição e tamanho do TechFormWidget (novo)
 * - Layout geral da dashboard (Canvas Infinito)
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useTechs } from "./hooks/useTechs";
import TechFormWidget from "./components/TechFormWidget"; // Widget flutuante
import BrandLogoWidget from "./components/BrandLogoWidget"; // Logo arrastável
import ZoomControls from "./components/ZoomControls"; // Controles de Zoom
import TechList from "./components/TechList";
import ErrorBanner from "./components/ErrorBanner";

/**
 * Calcula posições iniciais em grid para cards sem posição definida.
 * Distribui em colunas de 300px com 16px de gap.
 */
function calculateGridPositions(techs, existingPositions, containerWidth = 900) {
  const positions = { ...existingPositions };
  const cardW = 280;
  const cardH = 72;
  const gapX = 16;
  const gapY = 16;
  const cols = Math.max(1, Math.floor(containerWidth / (cardW + gapX)));

  let nextIndex = 0;

  techs.forEach((tech) => {
    if (positions[tech.id]) return;
    const col = nextIndex % cols;
    const row = Math.floor(nextIndex / cols);
    // Offset inicial para não ficar em cima do form (exagerado para segurança)
    const startY = 400;
    positions[tech.id] = {
      x: col * (cardW + gapX),
      y: startY + row * (cardH + gapY),
    };
    nextIndex++;
  });

  return positions;
}

function App() {
  const { techs, loading, error, addTech, updateTech, deleteTech, clearError } =
    useTechs();

  // Cards state
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem("tech_layout_positions");
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = {};
      // Sanitiza cada posição salva
      Object.keys(parsed).forEach((key) => {
        sanitized[key] = {
          x: Math.max(0, parsed[key].x),
          y: Math.max(0, parsed[key].y),
        };
      });
      return sanitized;
    }
    return {};
  });
  const [sizes, setSizes] = useState(() => {
    const saved = localStorage.getItem("tech_layout_sizes");
    return saved ? JSON.parse(saved) : {};
  });

  // Form Widget state
  const [formPos, setFormPos] = useState(() => {
    const saved = localStorage.getItem("tech_layout_form_pos");
    if (saved) {
      const p = JSON.parse(saved);
      return { x: Math.max(0, p.x), y: Math.max(0, p.y) };
    }
    return { x: 20, y: 140 };
  });
  const [formSize, setFormSize] = useState(() => {
    const saved = localStorage.getItem("tech_layout_form_size");
    return saved ? JSON.parse(saved) : { w: 360, h: "auto" };
  });

  // Logo Widget state
  const [logoPos, setLogoPos] = useState(() => {
    const saved = localStorage.getItem("tech_layout_logo_pos");
    if (saved) {
      const p = JSON.parse(saved);
      return { x: Math.max(0, p.x), y: Math.max(0, p.y) };
    }
    return { x: 400, y: 20 };
  });

  const containerRef = useRef(null);

  // Atribui posições automáticas
  useEffect(() => {
    if (techs.length === 0) return;
    const width = containerRef.current?.offsetWidth || 900;
    setPositions((prev) => calculateGridPositions(techs, prev, width));
  }, [techs]);

  /**
   * handleDragEnd: O Coração do Drag & Drop
   * 
   * Esta função é chamada quando o usuário solta um item.
   * O objeto 'active' diz quem foi arrastado.
   * O objeto 'delta' diz o quanto ele se moveu (x, y) desde o início.
   */
  /**
   * handleDragEnd: O Coração do Drag & Drop
   * 
   * Agora com "Physic Walls":
   * Impede que os elementos saiam de QUALQUER borda da tela.
   * Respeita o tamanho atual da janela (viewport).
   */
  // View State (Pan & Zoom)
  const [viewState, setViewState] = useState(() => {
    const saved = localStorage.getItem("tech_layout_view");
    return saved ? JSON.parse(saved) : { x: 0, y: 0, scale: 1 };
  });

  // Persist View State
  useEffect(() => {
    localStorage.setItem("tech_layout_view", JSON.stringify(viewState));
  }, [viewState]);

  // ─── Zoom Helpers ───
  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 5) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }));
  }, []);

  const handleReset = useCallback(() => {
    setViewState({ x: 0, y: 0, scale: 1 });
  }, []);

  /**
   * handleDragEnd: O Coração do Drag & Drop
   * 
   * Ajuste para Zoom:
   * Quando o canvas está com zoom (scale != 1), o movimento do mouse
   * não corresponde 1:1 aos pixels do canvas.
   * Precisamos dividir o delta pelo scale.
   */
  const handleDragEnd = useCallback((event) => {
    const { active, delta } = event;
    if (!delta) return;

    // Compensar o zoom
    const scale = viewState.scale;
    const adjustedDelta = {
      x: delta.x / scale,
      y: delta.y / scale,
    };

    if (active.id === "tech-form-widget") {
      setFormPos((prev) => ({
        x: prev.x + adjustedDelta.x,
        y: prev.y + adjustedDelta.y,
      }));
    } else if (active.id === "brand-logo-widget") {
      setLogoPos((prev) => ({
        x: prev.x + adjustedDelta.x,
        y: prev.y + adjustedDelta.y,
      }));
    } else {
      setPositions((prev) => {
        const current = prev[active.id] || { x: 0, y: 0 };
        return {
          ...prev,
          [active.id]: {
            x: current.x + adjustedDelta.x,
            y: current.y + adjustedDelta.y,
          },
        };
      });
    }
  }, [viewState.scale]);

  // ─── Canvas Pan & Zoom Handlers ───

  const handleWheel = useCallback((e) => {
    // Se estiver segurando Ctrl ou usando pinch-to-zoom (trackpad)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, viewState.scale + delta), 5); // Min 0.1x, Max 5x

      // Zoom focalizado no mouse (mais complexo, por enquanto zoom simples no centro/canto)
      // Futuramente podemos implementar zoom focalizado subtraindo offsets.

      setViewState(prev => ({ ...prev, scale: newScale }));
    } else {
      // Pan normal com scroll
      setViewState(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [viewState.scale]);

  // ─── Background Pan Handlers ───
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    // Só inicia Pan se clicar no fundo (app-container ou dashboard-canvas)
    // e se NÃO estiver clicando em algo interativo (botões, inputs, cards)
    const isInteractive = e.target.closest("button, input, a, .tech-card, .glass-card, .resize-handle");

    // Middle click (button 1) ou Left click (button 0) no fundo
    if (!isInteractive && (e.button === 0 || e.button === 1)) {
      setIsPanning(true);
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault(); // Evita seleção de texto
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;

    const dx = e.clientX - lastPanRef.current.x;
    const dy = e.clientY - lastPanRef.current.y;

    lastPanRef.current = { x: e.clientX, y: e.clientY };

    setViewState((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Listener global para MouseUp (caso solte fora do elemento)
  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Pan com botão do meio ou Space+Drag seria implementado aqui ou no wrapper


  const handleResizeCard = useCallback((id, newSize) => {
    setSizes((prev) => ({ ...prev, [id]: newSize }));
  }, []);

  const handleResizeForm = useCallback((newSize) => {
    setFormSize(newSize);
  }, []);

  // ─── EFFECTS: PERSISTÊNCIA ───
  // Para que o usuário não perca o layout ao dar F5, salvamos tudo no localStorage.
  // O useEffect roda sempre que o estado especificado no array de dependências muda.

  useEffect(() => {
    // JSON.stringify converte o objeto JS em string para salvar no browser
    localStorage.setItem("tech_layout_positions", JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("tech_layout_sizes", JSON.stringify(sizes));
  }, [sizes]);

  useEffect(() => {
    localStorage.setItem("tech_layout_form_pos", JSON.stringify(formPos));
  }, [formPos]);

  useEffect(() => {
    localStorage.setItem("tech_layout_form_size", JSON.stringify(formSize));
  }, [formSize]);

  useEffect(() => {
    localStorage.setItem("tech_layout_logo_pos", JSON.stringify(logoPos));
  }, [logoPos]);

  return (
    <div
      className={`app-container ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{
        // Garante que o container capture, mas permite cursor customizado
        touchAction: "none" // Melhora performance em touch
      }}
    >
      {/* Efeitos decorativos de fundo */}
      <div className="glow glow-1" />
      <div className="glow glow-2" />



      {/* Banner de erro */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* DndContext Global (Canvas) gerenciado pelo TechList
          Mas o TechFormWidget precisa estar DENTRO do contexto de drag.
          
          Como o TechList já tem o DndContext interno, precisamos refatorar
          para elevar o DndContext para o App, OU passar o Widget como children pro TechList.
          
          Vou usar a estratégia de passar como children para o TechList (que virou um CanvasWrapper).
       */}

      <TechList
        techs={techs}
        positions={positions}
        sizes={sizes}
        onUpdate={updateTech}
        onDelete={deleteTech}
        onDragEnd={handleDragEnd}
        onResize={handleResizeCard}
        loading={loading}
        viewState={viewState} // Passando estado da câmera
      >
        {/* Logo Widget arrastável */}
        <BrandLogoWidget position={logoPos} />

        {/* TechFormWidget agora vive dentro do Canvas Context */}
        <TechFormWidget
          onAdd={addTech}
          position={formPos}
          size={formSize}
          onResize={handleResizeForm}
          techCount={techs.length}
        />
      </TechList>

      {/* Controles de Zoom Flutuantes */}
      <ZoomControls
        scale={viewState.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Footer */}
      <footer className="app-footer pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2">
        <p>
          Feito com <span className="text-red-400">♥</span> por{" "}
          <strong>Vintage DevStack</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
