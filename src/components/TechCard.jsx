/**
 * TechCard — Card arrastável de tecnologia com resize e scaling.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎓 MENTORIA — COMPONENTE COM ESTADO LOCAL                     ║
 * ║                                                                ║
 * ║  Diferente do ZoomControls (puro), este componente TEM estado: ║
 * ║  - editing: boolean → modo edição (inline edit)                ║
 * ║  - confirmDelete: boolean → diálogo de confirmação             ║
 * ║  - isResizing: boolean → se está sendo redimensionado           ║
 * ║                                                                ║
 * ║  Ele também combina dois padrões importantes:                  ║
 * ║  1. "Conditional Rendering" — renderiza UI diferente baseada   ║
 * ║     no estado (if editing / if confirmDelete / modo normal)    ║
 * ║  2. "Responsive Scaling" — ícones e fontes escalam conforme    ║
 * ║     o card é redimensionado (proporcional ao tamanho)          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDraggable } from "@dnd-kit/core";
import { Pencil, Trash2, Check, X, GripVertical, Star } from "lucide-react";
import TechIcon from "./TechIcon";

/**
 * Mapa de cores por prioridade (Tailwind gradient classes).
 * Cada prioridade tem um gradiente visual distinto.
 */
const PRIORITY_COLORS = {
    1: "from-gray-500 to-gray-600",    // Baixa
    2: "from-blue-500 to-blue-600",    // Normal
    3: "from-amber-500 to-amber-600",  // Média
    4: "from-orange-500 to-orange-600", // Alta
    5: "from-red-500 to-red-600",      // Urgente
};

/** Labels de prioridade para exibição ao usuário */
const PRIORITY_LABELS = {
    1: "Baixa",
    2: "Normal",
    3: "Média",
    4: "Alta",
    5: "Urgente",
};

/**
 * 🎓 MENTORIA — Constantes de Limite
 * Definidas fora do componente (não mudam entre renders).
 * Isso evita recriação desnecessária a cada render.
 */
const MIN_W = 200;  // Largura mínima do card
const MIN_H = 60;   // Altura mínima do card
const MAX_W = 600;  // Largura máxima do card
const MAX_H = 400;  // Altura máxima do card

/**
 * @param {Object} tech - Dados da tecnologia { id, name, priority }
 * @param {Object} position - Coordenadas no canvas { x, y }
 * @param {Object} size - Dimensões { w, h } (opcional, tem defaults)
 * @param {Function} onUpdate - Callback para salvar edições
 * @param {Function} onDelete - Callback para remover a tecnologia
 * @param {Function} onResize - Callback para salvar novo tamanho
 */
function TechCard({ tech, position, size, onUpdate, onDelete, onResize }) {
    // ─── Estado local para edição inline ───
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(tech.name);
    const [editPriority, setEditPriority] = useState(tech.priority);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ─── Estado de redimensionamento ───
    const [isResizing, setIsResizing] = useState(false);
    /** 
     * useRef para armazenar posição inicial do mouse e tamanho
     * durante o resize. Ref porque NÃO queremos re-render a cada
     * pixel de movimento — apenas quando o resize termina.
     */
    const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

    /**
     * 🎓 MENTORIA — useDraggable (dnd-kit)
     *
     * Hook que torna este elemento arrastável. Retorna:
     * - attributes: props de acessibilidade (aria-*, role, tabindex)
     * - listeners: event handlers de drag (onPointerDown, etc.)
     * - setNodeRef: callback ref para o elemento DOM
     * - transform: { x, y } — offset visual DURANTE o drag
     * - isDragging: boolean — se está sendo arrastado agora
     *
     * disabled: desabilita drag durante edição, delete ou resize
     * para evitar "capture" acidental.
     */
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: tech.id,
            disabled: editing || confirmDelete || isResizing,
        });

    // ═══════════════════════════════════════════════════════
    // 📏 RESIZE — Redimensionamento via Handle
    // ═══════════════════════════════════════════════════════

    /**
     * 🎓 MENTORIA — Padrão de Resize Manual
     *
     * COMO FUNCIONA:
     * 1. mouseDown no handle → salva posição inicial do mouse e tamanho atual
     * 2. mouseMove na WINDOW → calcula delta (diferença) → novo tamanho
     * 3. mouseUp → para de redimensionar
     *
     * e.stopPropagation() é CRUCIAL aqui — sem isso, o drag do dnd-kit
     * capturaria o evento e interpretaria como "arrastar o card".
     */
    const handleResizeStart = useCallback(
        (e) => {
            e.preventDefault();       // Previne seleção de texto
            e.stopPropagation();      // Impede que o dnd-kit capture o evento
            setIsResizing(true);
            resizeStart.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                w: size?.w ?? 280,    // Nullish coalescing: usa default se size for null/undefined
                h: size?.h ?? 72,
            };
        },
        [size]
    );

    /**
     * 🎓 MENTORIA — Effect para Listeners Temporários
     *
     * Os listeners de mousemove/mouseup são adicionados APENAS
     * enquanto isResizing === true. Quando o resize termina,
     * a cleanup function os remove.
     *
     * Isso é um padrão comum para qualquer interação de "drag":
     * mouseDown → addEventListener → mouseMove/mouseUp → removeEventListener
     */
    useEffect(() => {
        if (!isResizing) return; // Não está redimensionando → nada a fazer

        function handleMouseMove(e) {
            // Calcula o quanto o mouse se moveu desde o início
            const dx = e.clientX - resizeStart.current.mouseX;
            const dy = e.clientY - resizeStart.current.mouseY;
            // Aplica o delta ao tamanho original, respeitando min/max
            const newW = Math.min(MAX_W, Math.max(MIN_W, resizeStart.current.w + dx));
            const newH = Math.min(MAX_H, Math.max(MIN_H, resizeStart.current.h + dy));
            // Notifica o pai (App.jsx) para salvar
            onResize(tech.id, { w: newW, h: newH });
        }

        function handleMouseUp() {
            setIsResizing(false);
        }

        // Listeners na WINDOW para capturar mouse fora do elemento
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, tech.id, onResize]);

    // ═══════════════════════════════════════════════════════
    // 📐 RESPONSIVE SCALING — Ícones e fontes proporcionais
    // ═══════════════════════════════════════════════════════

    /**
     * 🎓 MENTORIA — Scaling Proporcional
     *
     * Quando o usuário redimensiona o card, os elementos internos
     * (ícone, título, badge) ESCALAM proporcionalmente.
     *
     * Isso usa uma fórmula: clamp(min, valor * fator, max)
     * Em JS: Math.min(max, Math.max(min, valor))
     *
     * Exemplo para iconSize:
     *   Card com h=72:  Math.min(120, Math.max(28, 72 * 0.6)) = 43px
     *   Card com h=200: Math.min(120, Math.max(28, 200 * 0.6)) = 120px
     *   Card com h=30:  Math.min(120, Math.max(28, 30 * 0.6)) = 28px
     */
    const cardW = size?.w ?? 280;
    const cardH = size?.h ?? 72;

    // Ícone: cresce com a menor dimensão (h*0.6 ou w*0.3), limitado 28-120px
    const iconSize = Math.min(120, Math.max(28, Math.min(cardH * 0.6, cardW * 0.3)));
    // Título: cresce com a altura, limitado 14-32px
    const titleSize = Math.min(32, Math.max(14, cardH * 0.25));
    // Metadados (prioridade): cresce menos, limitado 10-14px
    const metaSize = Math.min(14, Math.max(10, cardH * 0.15));

    /**
     * 🎓 MENTORIA — Style Object (Inline Styles Dinâmicos)
     *
     * Para propriedades que MUDAM em runtime (posição, tamanho, transform),
     * usamos inline styles em vez de classes CSS.
     *
     * O transform é aplicado pelo dnd-kit DURANTE o drag.
     * Quando isDragging=false, transform é undefined (sem efeito).
     *
     * zIndex dinâmico: card sendo arrastado fica no topo (100),
     * card sendo redimensionado logo abaixo (99), outros em 1.
     */
    const style = {
        position: "absolute",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: cardW,
        minHeight: cardH,
        // Transform visual do dnd-kit (offset durante drag)
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        opacity: isDragging ? 0.6 : 1,        // Semi-transparente durante drag
        zIndex: isDragging ? 100 : isResizing ? 99 : 1,
        transition: isDragging || isResizing ? "none" : "box-shadow 0.2s ease",
    };

    // ═══════════════════════════════════════════════════════
    // 💾 CRUD HANDLERS — Edição e Exclusão
    // ═══════════════════════════════════════════════════════

    /**
     * Salva as alterações de edição (nome + prioridade).
     * async/await porque onUpdate faz chamada ao Supabase.
     */
    async function handleSave() {
        const trimmed = editName.trim();
        if (!trimmed) return; // Não salva nome vazio
        setSaving(true);
        await onUpdate(tech.id, { name: trimmed, priority: editPriority });
        setSaving(false);
        setEditing(false);
    }

    /** Cancela edição: restaura valores originais */
    function handleCancel() {
        setEditName(tech.name);
        setEditPriority(tech.priority);
        setEditing(false);
    }

    /**
     * Deleta a tecnologia.
     * e.stopPropagation() evita que o click propague para o drag.
     */
    async function handleDelete(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDeleting(true);
        await onDelete(tech.id);
        // Se o delete falhar e o componente não desmontar:
        setDeleting(false);
        setConfirmDelete(false);
    }

    // ═══════════════════════════════════════════════════════
    // 🎨 CONDITIONAL RENDERING — 3 modos de exibição
    // ═══════════════════════════════════════════════════════

    /**
     * 🎓 MENTORIA — Early Returns
     * 
     * O componente retorna JSX diferente baseado no estado:
     * - editing=true → formulário inline
     * - confirmDelete=true → diálogo de confirmação
     * - ambos false → card normal arrastável
     *
     * "Early return" = retorna antes de chegar ao final da função.
     * Muito mais legível que ternários aninhados.
     */

    // ─── Modo Edição (Inline) ───
    if (editing) {
        return (
            <div ref={setNodeRef} style={style} className="tech-card-edit" {...attributes}>
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="tech-card-input"
                    autoFocus
                />
                {/* Seletor de prioridade: 5 botões numerados */}
                <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setEditPriority(p)}
                            className={`priority-btn-sm ${editPriority === p ? "priority-btn-active" : ""}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 mt-3">
                    <button onClick={handleSave} disabled={saving} className="btn-save-sm">
                        <Check size={14} /> {saving ? "..." : "Salvar"}
                    </button>
                    <button onClick={handleCancel} className="btn-cancel-sm">
                        <X size={14} /> Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // ─── Modo Confirmação de Delete ───
    if (confirmDelete) {
        return (
            <div ref={setNodeRef} style={style} className="tech-card-delete" {...attributes}>
                <p className="text-white/80 text-sm mb-3">
                    Remover <strong>{tech.name}</strong>?
                </p>
                <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={deleting} className="btn-danger-sm">
                        {deleting ? "Removendo..." : "Confirmar"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="btn-cancel-sm">
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // ─── Modo Normal (Card Arrastável + Scalable) ───
    return (
        <div ref={setNodeRef} style={style} className="tech-card group flex flex-row items-center gap-3" {...attributes}>
            {/* 
              Grip Handle — Área onde o usuário "segura" para arrastar.
              {...listeners} aplica os event handlers de drag do dnd-kit.
              Separar a área de drag do card inteiro permite que botões
              e inputs funcionem normalmente (sem acionar drag acidental).
            */}
            <button className="drag-handle" {...listeners} aria-label="Arrastar card">
                <GripVertical size={Math.max(16, cardH * 0.2)} />
            </button>

            {/* Ícone da tecnologia — tamanho escala com o card */}
            <div
                className="tech-card-icon transition-all duration-75"
                style={{ width: iconSize + 10, height: iconSize + 10 }}
            >
                <TechIcon name={tech.name} size={iconSize} />
            </div>

            {/* Informações da tecnologia — fonte escala com o card */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <h3
                    className="text-white font-medium truncate transition-all duration-75"
                    style={{ fontSize: titleSize, lineHeight: 1.2 }}
                >
                    {tech.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Dot colorido de prioridade */}
                    <span className={`priority-dot bg-gradient-to-r ${PRIORITY_COLORS[tech.priority]}`} />
                    <span
                        className="text-white/40 transition-all duration-75"
                        style={{ fontSize: metaSize }}
                    >
                        {PRIORITY_LABELS[tech.priority]}
                    </span>
                </div>
            </div>

            {/* Badge de prioridade — canto direito, também escala */}
            <div className={`priority-badge-mini bg-gradient-to-r ${PRIORITY_COLORS[tech.priority]}`}>
                <Star size={Math.max(8, cardH * 0.12)} />
                <span style={{ fontSize: Math.max(10, cardH * 0.12) }}>{tech.priority}</span>
            </div>

            {/* 
              Ações (Editar/Remover) — aparecem no hover (via CSS .card-actions).
              position: absolute + top/right para não atrapalhar o layout flexbox.
            */}
            <div className="card-actions absolute top-2 right-2 flex gap-1 bg-black/50 backdrop-blur-sm rounded-md p-1">
                <button onClick={() => setEditing(true)} className="action-btn hover:text-emerald-400" title="Editar">
                    <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmDelete(true)} className="action-btn hover:text-red-400" title="Remover">
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Resize Handle — canto inferior direito, aparece no hover */}
            <div
                className="resize-handle"
                onMouseDown={handleResizeStart}
                title="Redimensionar"
            />
        </div>
    );
}

/**
 * 🎓 MENTORIA — PropTypes como Documentação
 *
 * Além de validar, PropTypes servem como DOCUMENTAÇÃO para outros devs.
 * Ao ler isso, qualquer dev sabe exatamente quais props o componente espera,
 * seus tipos, e se são obrigatórias.
 *
 * oneOfType: aceita string OU number (ids do Supabase podem variar).
 * shape: define a "forma" exata do objeto esperado.
 */
TechCard.propTypes = {
    tech: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        priority: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    size: PropTypes.shape({
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
    }),
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onResize: PropTypes.func.isRequired,
};

export default TechCard;
