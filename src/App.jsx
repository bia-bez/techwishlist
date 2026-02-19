/**
 * App.jsx — Componente raiz da aplicação Tech Wishlist.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 MENTORIA — ARQUITETURA DO COMPONENTE PRINCIPAL             ║
 * ║                                                                ║
 * ║  Este componente é o "Maestro" da aplicação. Ele:              ║
 * ║  1. Gerencia TODO o estado (posições, tamanhos, zoom, pan)     ║
 * ║  2. Passa callbacks (handleDragEnd, onUpdate, etc.) pros filhos║
 * ║  3. Persiste tudo no localStorage para sobreviver ao F5        ║
 * ║  4. Implementa Canvas Infinito com Zoom, Pan e Auto-Pan        ║
 * ║                                                                ║
 * ║  Padrão: "Lifting State Up" (elevar o estado)                  ║
 * ║  → O estado fica no componente pai e é passado para baixo      ║
 * ║    via props. Os filhos notificam mudanças via callbacks.       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useTechs } from "./hooks/useTechs";
import TechFormWidget from "./components/TechFormWidget";
import BrandLogoWidget from "./components/BrandLogoWidget";
import ZoomControls from "./components/ZoomControls";
import TechList from "./components/TechList";
import ErrorBanner from "./components/ErrorBanner";

/**
 * calculateGridPositions — Auto-layouter para cards novos.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 MENTORIA — POR QUE ISSO EXISTE?                            ║
 * ║                                                                ║
 * ║  Quando um card é criado, ele NÃO tem posição definida ainda.  ║
 * ║  Esta função calcula uma posição automática em GRID:           ║
 * ║                                                                ║
 * ║    [Card 1] [Card 2] [Card 3]                                  ║
 * ║    [Card 4] [Card 5] ...                                       ║
 * ║                                                                ║
 * ║  Se o card JÁ tem posição salva, pula (preserva layout do      ║
 * ║  usuário). Só calcula para cards NOVOS.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @param {Array} techs - Lista de tecnologias
 * @param {Object} existingPositions - Posições já salvas (chave: id)
 * @param {number} containerWidth - Largura do container (default: 900px)
 * @returns {Object} - Mapa de posições { [id]: { x, y } }
 */
function calculateGridPositions(techs, existingPositions, containerWidth = 900) {
  // Spread operator (...) cria uma CÓPIA para não mutar o original
  const positions = { ...existingPositions };
  const cardW = 280;   // Largura de cada card
  const cardH = 72;    // Altura de cada card
  const gapX = 16;     // Espaço horizontal entre cards
  const gapY = 16;     // Espaço vertical entre cards
  // Quantas colunas cabem na largura? (mínimo 1)
  const cols = Math.max(1, Math.floor(containerWidth / (cardW + gapX)));

  let nextIndex = 0; // Contador de cards SEM posição

  techs.forEach((tech) => {
    // Se já tem posição salva, não recalcula
    if (positions[tech.id]) return;

    // Calcula posição em grid (coluna e linha)
    const col = nextIndex % cols;           // Operador módulo: volta pra 0 após última coluna
    const row = Math.floor(nextIndex / cols); // Linha = divisão inteira

    // startY: offset vertical para não sobrepor o formulário lá em cima
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
  /**
   * 🎓 MENTORIA — Hook useTechs
   * Desestruturação do hook customizado. Cada valor retornado é uma
   * peça do estado ou uma ação (CRUD):
   * - techs: array de tecnologias vindas do Supabase
   * - loading: boolean, true enquanto carrega
   * - error: string com mensagem de erro (ou null)
   * - addTech, updateTech, deleteTech: funções async de CRUD
   * - clearError: limpa o banner de erro
   */
  const { techs, loading, error, addTech, updateTech, deleteTech, clearError } =
    useTechs();

  // ═══════════════════════════════════════════════════════
  // 📦 ESTADO: Posições e Tamanhos (Cards + Widgets)
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — "Lazy Initial State" (Estado Inicial Preguiçoso)
   *
   * Passamos uma FUNÇÃO para useState (em vez de um valor direto).
   * Isso faz o React executar a função APENAS na primeira renderização.
   * Importante porque localStorage.getItem + JSON.parse é "caro" —
   * não queremos executar a cada re-render.
   *
   * Sintaxe: useState(() => { ... }) em vez de useState(valor)
   */
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem("tech_layout_positions");
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = {};
      // Math.max(0, ...) garante que nenhum card fique em coordenadas negativas
      Object.keys(parsed).forEach((key) => {
        sanitized[key] = {
          x: Math.max(0, parsed[key].x),
          y: Math.max(0, parsed[key].y),
        };
      });
      return sanitized;
    }
    return {}; // Primeiro acesso: nenhum card posicionado
  });

  const [sizes, setSizes] = useState(() => {
    const saved = localStorage.getItem("tech_layout_sizes");
    return saved ? JSON.parse(saved) : {};
  });

  // Posição e tamanho do Widget de Formulário
  const [formPos, setFormPos] = useState(() => {
    const saved = localStorage.getItem("tech_layout_form_pos");
    if (saved) {
      const p = JSON.parse(saved);
      return { x: Math.max(0, p.x), y: Math.max(0, p.y) };
    }
    return { x: 20, y: 140 }; // Posição padrão no canto superior esquerdo
  });
  const [formSize, setFormSize] = useState(() => {
    const saved = localStorage.getItem("tech_layout_form_size");
    return saved ? JSON.parse(saved) : { w: 360, h: "auto" };
  });

  // Posição do Logo Widget
  const [logoPos, setLogoPos] = useState(() => {
    const saved = localStorage.getItem("tech_layout_logo_pos");
    if (saved) {
      const p = JSON.parse(saved);
      return { x: Math.max(0, p.x), y: Math.max(0, p.y) };
    }
    return { x: 400, y: 20 };
  });

  // ═══════════════════════════════════════════════════════
  // 🎥 VIEW STATE — Câmera do Canvas Infinito (Pan & Zoom)
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — O "viewState" é a CÂMERA da aplicação.
   *
   * Imagine o canvas como um mapa infinito. O viewState diz:
   * - x, y: para onde a câmera está OLHANDO (pan/deslocamento)
   * - scale: nível de zoom (1 = 100%, 0.5 = 50%, 2 = 200%)
   *
   * Esse conceito é usado em ferramentas como:
   * - Railway, Miro, Figma, Google Maps
   *
   * A transformação CSS aplicada ao canvas é:
   *   transform: translate(x, y) scale(scale)
   *   transformOrigin: 0 0  ← (topo-esquerdo como ponto de referência)
   */
  const [viewState, setViewState] = useState(() => {
    const saved = localStorage.getItem("tech_layout_view");
    return saved ? JSON.parse(saved) : { x: 0, y: 0, scale: 1 };
  });

  // Ref do container principal (para medir largura, etc.)
  const containerRef = useRef(null);

  // ═══════════════════════════════════════════════════════
  // 📐 GRID AUTO-POSICIONAMENTO
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — useEffect com array de dependências
   *
   * Este useEffect roda toda vez que a lista `techs` muda.
   * → Quando o Supabase retorna novos dados, o grid é recalculado.
   * → Cards que já têm posição NÃO são movidos (preserva layout).
   */
  useEffect(() => {
    if (techs.length === 0) return; // Sem cards, nada a fazer
    const width = containerRef.current?.offsetWidth || 900;
    setPositions((prev) => calculateGridPositions(techs, prev, width));
  }, [techs]);

  // ═══════════════════════════════════════════════════════
  // 🖱️ HANDLE DRAG END — Salva posição após arrastar
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Compensação de Zoom no Drag
   *
   * PROBLEMA: Quando o canvas está com zoom 200% (scale: 2),
   * o mouse se move 100px, mas no espaço do canvas isso equivale
   * a apenas 50px (100 / 2).
   *
   * SOLUÇÃO: Dividir o delta (distância do mouse) pelo scale.
   *
   * Exemplo:
   *   Mouse moveu: delta.x = 100px
   *   Zoom atual: scale = 2
   *   Movimento real no canvas: 100 / 2 = 50px ✅
   *
   * useCallback memoriza a função para evitar re-criação a cada render.
   * Só recria quando viewState.scale muda (array de dependências).
   */
  const handleDragEnd = useCallback((event) => {
    const { active, delta } = event;
    if (!delta) return; // Proteção: se não houve movimento

    // Compensar o zoom dividindo pelo scale
    const scale = viewState.scale;
    const adjustedDelta = {
      x: delta.x / scale,
      y: delta.y / scale,
    };

    // Identifica QUEM foi arrastado pelo active.id
    if (active.id === "tech-form-widget") {
      // Widget do formulário
      setFormPos((prev) => ({
        x: prev.x + adjustedDelta.x,
        y: prev.y + adjustedDelta.y,
      }));
    } else if (active.id === "brand-logo-widget") {
      // Widget do logo
      setLogoPos((prev) => ({
        x: prev.x + adjustedDelta.x,
        y: prev.y + adjustedDelta.y,
      }));
    } else {
      // Card de tecnologia (id dinâmico vindo do Supabase)
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

  // ═══════════════════════════════════════════════════════
  // 🔍 ZOOM HELPERS — Botões de Zoom (+, -, Reset)
  // ═══════════════════════════════════════════════════════

  /** Zoom In: incrementa 10% (máximo 500%) */
  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.1, 5) }));
  }, []);

  /** Zoom Out: decrementa 10% (mínimo 10%) */
  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }));
  }, []);

  /** Reset: volta para zoom 100% e posição (0, 0) */
  const handleReset = useCallback(() => {
    setViewState({ x: 0, y: 0, scale: 1 });
  }, []);

  // ═══════════════════════════════════════════════════════
  // 🏗️ AUTO-PAN (Edge Scrolling)
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Auto-Pan: O Canvas se Move Enquanto Arrasta
   *
   * CONCEITO: Quando o usuário arrasta um card até a BORDA da tela,
   * a câmera (viewState) se move automaticamente para revelar mais
   * espaço. Isso permite arrastar para o "infinito".
   *
   * COMO FUNCIONA:
   * 1. Quando um drag COMEÇA → isDraggingItem = true
   * 2. Um setInterval roda a 60fps checando a posição do mouse
   * 3. Se o mouse está perto da borda (< 100px):
   *    → Calcula velocidade proporcional à proximidade
   *    → Atualiza viewState.x / viewState.y
   * 4. Quando o drag TERMINA → limpa tudo
   *
   * PADRÃO: "Animation Loop" (similar a um game loop)
   * → setInterval(fn, 16ms) ≈ 60fps
   * → A velocidade é armazenada em um ref (não causa re-render)
   * → O intervalo LÊ do ref a cada tick
   */
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  /**
   * useRef vs useState:
   * - useRef: atualiza SEM causar re-render (ideal para timers e velocidades)
   * - useState: atualiza E causa re-render (ideal para UI visível)
   */
  const autoPanIntervalRef = useRef(null);
  const currentPanVelocity = useRef({ dx: 0, dy: 0 });

  /** Chamado quando o DndContext detecta início de drag */
  const handleGlobalDragStart = useCallback(() => {
    setIsDraggingItem(true);
  }, []);

  /**
   * Chamado quando o DndContext detecta fim de drag.
   * IMPORTANTE: Chama handleDragEnd para salvar a posição final,
   * e limpa o auto-pan.
   */
  const handleGlobalDragEnd = useCallback(
    (event) => {
      setIsDraggingItem(false);
      handleDragEnd(event); // Salva posição final do item arrastado

      // Limpa o intervalo de auto-pan
      if (autoPanIntervalRef.current) {
        clearInterval(autoPanIntervalRef.current);
        autoPanIntervalRef.current = null;
      }
      currentPanVelocity.current = { dx: 0, dy: 0 };
    },
    [handleDragEnd]
  );

  /**
   * 🎓 MENTORIA — useEffect como "Lifecycle Manager"
   *
   * Este effect gerencia todo o ciclo de vida do auto-pan:
   * - MOUNT (isDraggingItem = true): Inicia listeners + interval
   * - UNMOUNT (cleanup / isDraggingItem = false): Remove tudo
   *
   * O "return () => { ... }" é a CLEANUP FUNCTION.
   * React a executa quando:
   * 1. O componente desmonta
   * 2. As dependências mudam (antes de re-executar o effect)
   */
  useEffect(() => {
    if (!isDraggingItem) {
      // Não está arrastando → limpa tudo e sai
      if (autoPanIntervalRef.current) {
        clearInterval(autoPanIntervalRef.current);
        autoPanIntervalRef.current = null;
      }
      currentPanVelocity.current = { dx: 0, dy: 0 };
      return;
    }

    // ─── Inicia o "game loop" de auto-pan (~60fps) ───
    autoPanIntervalRef.current = setInterval(() => {
      const { dx, dy } = currentPanVelocity.current;
      if (dx !== 0 || dy !== 0) {
        // Functional update: garante que lemos o valor MAIS RECENTE do state
        setViewState((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }
    }, 16); // 16ms ≈ 60fps (1000ms / 60 ≈ 16.67ms)

    /**
     * checkEdge — Calcula velocidade de pan baseada na posição do mouse.
     *
     * Quanto MAIS PERTO da borda, MAIS RÁPIDO o pan.
     * edgeThreshold = 100px → zona de "gatilho"
     * maxSpeed = 25px/tick → velocidade máxima
     *
     * Fórmula: speed = (distância_até_borda) / 2
     *   → Mouse a 100px da borda = 0 (fora da zona)
     *   → Mouse a 50px da borda = 25px/tick
     *   → Mouse a 0px da borda = 50px/tick (capped a 25)
     */
    const checkEdge = (x, y) => {
      const edgeThreshold = 100; // Tamanho da zona de detecção (px)
      const maxSpeed = 25;       // Velocidade máxima (px por tick)
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let dx = 0;
      let dy = 0;

      // Borda ESQUERDA → pan para direita (dx positivo)
      if (x < edgeThreshold) dx = Math.min(maxSpeed, (edgeThreshold - x) / 2);
      // Borda DIREITA → pan para esquerda (dx negativo)
      if (x > vw - edgeThreshold)
        dx = -Math.min(maxSpeed, (x - (vw - edgeThreshold)) / 2);
      // Borda SUPERIOR → pan para baixo (dy positivo)
      if (y < edgeThreshold) dy = Math.min(maxSpeed, (edgeThreshold - y) / 2);
      // Borda INFERIOR → pan para cima (dy negativo)
      if (y > vh - edgeThreshold)
        dy = -Math.min(maxSpeed, (y - (vh - edgeThreshold)) / 2);

      // Armazena no ref (não causa re-render, apenas atualiza a velocidade)
      currentPanVelocity.current = { dx, dy };
    };

    // Listeners globais: rastreiam posição do mouse na JANELA inteira
    const onMouseMove = (e) => checkEdge(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        checkEdge(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    // Cleanup: remove listeners e para o intervalo
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (autoPanIntervalRef.current) {
        clearInterval(autoPanIntervalRef.current);
        autoPanIntervalRef.current = null;
      }
    };
  }, [isDraggingItem]); // Roda quando isDraggingItem muda

  // ═══════════════════════════════════════════════════════
  // 🔄 WHEEL ZOOM & PAN — Roda do Mouse
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Zoom via Scroll (Ctrl/Meta + Wheel)
   *
   * Padrão usado por Google Maps, Figma, etc:
   * - Ctrl + Scroll → Zoom In/Out
   * - Scroll sem Ctrl → Pan (mover o canvas)
   *
   * deltaY: positivo = scroll para baixo, negativo = scroll para cima
   * deltaX: scroll horizontal (trackpad)
   *
   * e.preventDefault() impede o zoom nativo do browser (Ctrl+Scroll
   * normalmente dá zoom na página inteira — não queremos isso).
   */
  const handleWheel = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Impede zoom nativo do browser
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity; // Inverte: scroll up = zoom in
        const newScale = Math.min(
          Math.max(0.1, viewState.scale + delta), // Mínimo: 10%
          5                                        // Máximo: 500%
        );
        setViewState((prev) => ({ ...prev, scale: newScale }));
      } else {
        // Pan: mover o canvas na direção oposta ao scroll
        setViewState((prev) => ({
          ...prev,
          x: prev.x - e.deltaX, // Scroll esquerda → pan direita
          y: prev.y - e.deltaY, // Scroll para cima → pan para baixo
        }));
      }
    },
    [viewState.scale]
  );

  // ═══════════════════════════════════════════════════════
  // ✋ BACKGROUND PAN — Click + Drag no fundo
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Pan via Drag no Fundo (Estilo Figma/Miro)
   *
   * CONCEITO: Clicar em uma área "vazia" (fundo) e arrastar
   * move a câmera (viewState). É diferente de arrastar um card.
   *
   * IMPLEMENTAÇÃO:
   * 1. mouseDown: Verifica se o clique é no fundo (não em botão/card)
   *    → Se sim, ativa isPanning e salva posição inicial do mouse
   * 2. mouseMove: Calcula o delta (diferença) desde o último frame
   *    → Atualiza viewState.x/y com o delta
   * 3. mouseUp: Desativa isPanning
   *
   * DETALHE IMPORTANTE:
   * Os listeners de mouseMove/mouseUp são adicionados na WINDOW
   * (não no elemento). Isso garante que o pan continue mesmo se
   * o cursor sair do elemento (ex: arrastou rápido demais).
   */
  const [isPanning, setIsPanning] = useState(false);
  const lastPanRef = useRef({ x: 0, y: 0 }); // Última posição do mouse

  const handleMouseDown = useCallback((e) => {
    // closest() busca o ancestral mais próximo que match o seletor CSS.
    // Se encontrar, significa que clicamos em algo interativo → NÃO pan.
    const isInteractive = e.target.closest(
      "button, input, a, .tech-card, .glass-card, .resize-handle"
    );

    // Button 0 = Left Click, Button 1 = Middle Click (roda do mouse)
    if (!isInteractive && (e.button === 0 || e.button === 1)) {
      setIsPanning(true);
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault(); // Evita seleção de texto durante drag
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isPanning) return; // Se não está fazendo pan, ignora

      // Delta = posição atual - posição anterior
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;

      // Atualiza a referência para o próximo frame
      lastPanRef.current = { x: e.clientX, y: e.clientY };

      // Move a câmera
      setViewState((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  /**
   * 🎓 MENTORIA — Listeners Globais Condicionais
   *
   * Adicionamos listeners na WINDOW (não no elemento) para:
   * - Capturar mouseup mesmo fora da janela
   * - Capturar mousemove com precisão total
   *
   * A cleanup function remove os listeners quando isPanning muda.
   * Isso evita memory leaks (vazamento de memória).
   */
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

  // ═══════════════════════════════════════════════════════
  // 📏 RESIZE HELPERS
  // ═══════════════════════════════════════════════════════

  /** Atualiza o tamanho de um card específico (por id) */
  const handleResizeCard = useCallback((id, newSize) => {
    setSizes((prev) => ({ ...prev, [id]: newSize }));
  }, []);

  /** Atualiza o tamanho do widget de formulário */
  const handleResizeForm = useCallback((newSize) => {
    setFormSize(newSize);
  }, []);

  // ═══════════════════════════════════════════════════════
  // 💾 PERSISTÊNCIA — localStorage
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Salvamento Automático
   *
   * Cada useEffect abaixo "observa" um pedaço do estado.
   * Quando esse estado muda, serializa em JSON e salva no localStorage.
   *
   * localStorage.setItem("chave", JSON.stringify(valor))
   * → Salva como string (o browser só aceita strings)
   *
   * Na inicialização (useState com lazy init), fazemos o inverso:
   * localStorage.getItem("chave") → JSON.parse(string) → objeto
   *
   * Isso cria um ciclo completo de persistência:
   *   Estado muda → salva no localStorage → F5 → carrega do localStorage
   */
  useEffect(() => {
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

  useEffect(() => {
    localStorage.setItem("tech_layout_view", JSON.stringify(viewState));
  }, [viewState]);

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER — Montagem da Interface
  // ═══════════════════════════════════════════════════════

  /**
   * 🎓 MENTORIA — Estrutura do Render
   *
   * app-container (viewport fixo, 100vw x 100vh)
   * ├── glow-1, glow-2 (efeitos decorativos de fundo)
   * ├── ErrorBanner (banner de erro, condicional)
   * ├── TechList (wrapper do DndContext + canvas transformado)
   * │   ├── BrandLogoWidget (logo arrastável)
   * │   ├── TechFormWidget (formulário arrastável)
   * │   └── TechCard × N (cards de tecnologia)
   * ├── ZoomControls (botões fixos +/-/Reset)
   * └── footer (créditos, fixo no bottom)
   *
   * O cursor muda: "grab" quando parado, "grabbing" quando arrastando fundo.
   */
  return (
    <div
      className={`app-container ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ touchAction: "none" }} // Desativa gestos nativos de touch
    >
      {/* Efeitos decorativos de fundo (blur colorido) */}
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      {/* Banner de erro — só aparece se error !== null */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* 
        TechList encapsula o DndContext (drag-and-drop) e o canvas transformado.
        O viewState controla a transformação CSS (translate + scale).
        Children (BrandLogoWidget, TechFormWidget) são renderizados DENTRO do canvas.
      */}
      <TechList
        techs={techs}
        positions={positions}
        sizes={sizes}
        onUpdate={updateTech}
        onDelete={deleteTech}
        onDragStart={handleGlobalDragStart}
        onDragEnd={handleGlobalDragEnd}
        onResize={handleResizeCard}
        loading={loading}
        viewState={viewState}
      >
        {/* Widgets renderizados dentro do DndContext via children pattern */}
        <BrandLogoWidget position={logoPos} />
        <TechFormWidget
          onAdd={addTech}
          position={formPos}
          size={formSize}
          onResize={handleResizeForm}
          techCount={techs.length}
        />
      </TechList>

      {/* Controles de Zoom — fixos no canto inferior direito (z-index alto) */}
      <ZoomControls
        scale={viewState.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Footer — pointer-events-none impede que capture cliques de pan */}
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
