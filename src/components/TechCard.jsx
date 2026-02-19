import { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDraggable } from "@dnd-kit/core";
import { Pencil, Trash2, Check, X, GripVertical, Star } from "lucide-react";
import TechIcon from "./TechIcon";

const PRIORITY_COLORS = {
    1: "from-gray-500 to-gray-600",
    2: "from-blue-500 to-blue-600",
    3: "from-amber-500 to-amber-600",
    4: "from-orange-500 to-orange-600",
    5: "from-red-500 to-red-600",
};

const PRIORITY_LABELS = {
    1: "Baixa",
    2: "Normal",
    3: "Média",
    4: "Alta",
    5: "Urgente",
};

// Tamanhos limites
const MIN_W = 200;
const MIN_H = 60;
const MAX_W = 600;
const MAX_H = 400;

function TechCard({ tech, position, size, onUpdate, onDelete, onResize }) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(tech.name);
    const [editPriority, setEditPriority] = useState(tech.priority);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Resize state
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: tech.id,
            disabled: editing || confirmDelete || isResizing,
        });

    // ─── Resize Handlers ───
    const handleResizeStart = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            resizeStart.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                w: size?.w ?? 280,
                h: size?.h ?? 72,
            };
        },
        [size]
    );

    useEffect(() => {
        if (!isResizing) return;

        function handleMouseMove(e) {
            const dx = e.clientX - resizeStart.current.mouseX;
            const dy = e.clientY - resizeStart.current.mouseY;
            const newW = Math.min(MAX_W, Math.max(MIN_W, resizeStart.current.w + dx));
            const newH = Math.min(MAX_H, Math.max(MIN_H, resizeStart.current.h + dy));
            onResize(tech.id, { w: newW, h: newH });
        }

        function handleMouseUp() {
            setIsResizing(false);
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, tech.id, onResize]);

    // Dimensões atuais
    const cardW = size?.w ?? 280;
    const cardH = size?.h ?? 72;

    // ─── Cálculos de Scaling Proporcional ───
    // Ícone cresce com a altura (até 60%) ou largura (até 30%), limitado entre 28px e 120px
    const iconSize = Math.min(120, Math.max(28, Math.min(cardH * 0.6, cardW * 0.3)));

    // Fonte do título cresce com a largura/altura, limitada entre 14px e 32px
    const titleSize = Math.min(32, Math.max(14, cardH * 0.25));

    // Fonte secundária (prioridade) também escala um pouco
    const metaSize = Math.min(14, Math.max(10, cardH * 0.15));

    const style = {
        position: "absolute",
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: cardW,
        minHeight: cardH,
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 100 : isResizing ? 99 : 1,
        transition: isDragging || isResizing ? "none" : "box-shadow 0.2s ease",
    };

    // ─── Handlers CRUD ───
    async function handleSave() {
        const trimmed = editName.trim();
        if (!trimmed) return;
        setSaving(true);
        await onUpdate(tech.id, { name: trimmed, priority: editPriority });
        setSaving(false);
        setEditing(false);
    }

    function handleCancel() {
        setEditName(tech.name);
        setEditPriority(tech.priority);
        setEditing(false);
    }

    async function handleDelete(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDeleting(true);
        await onDelete(tech.id);
        // Não precisamos setDeleting(false) se o componente desmontar
        // Mas por segurança, se falhar:
        setDeleting(false);
        setConfirmDelete(false);
    }

    // ─── Modo Edição (Fixo) ───
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

    // ─── Modo Confirmação (Fixo) ───
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

    // ─── Card Normal (Arrastável + Scalable) ───
    return (
        <div ref={setNodeRef} style={style} className="tech-card group flex flex-row items-center gap-3" {...attributes}>
            {/* Grip handle */}
            <button className="drag-handle" {...listeners} aria-label="Arrastar card">
                <GripVertical size={Math.max(16, cardH * 0.2)} />
            </button>

            {/* Ícone Scalable */}
            <div
                className="tech-card-icon transition-all duration-75"
                style={{ width: iconSize + 10, height: iconSize + 10 }}
            >
                <TechIcon name={tech.name} size={iconSize} />
            </div>

            {/* Info Scalable */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <h3
                    className="text-white font-medium truncate transition-all duration-75"
                    style={{ fontSize: titleSize, lineHeight: 1.2 }}
                >
                    {tech.name}
                </h3>

                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`priority-dot bg-gradient-to-r ${PRIORITY_COLORS[tech.priority]}`} />
                    <span
                        className="text-white/40 transition-all duration-75"
                        style={{ fontSize: metaSize }}
                    >
                        {PRIORITY_LABELS[tech.priority]}
                    </span>
                </div>
            </div>

            {/* Badge Scalable */}
            <div className={`priority-badge-mini bg-gradient-to-r ${PRIORITY_COLORS[tech.priority]}`}>
                <Star size={Math.max(8, cardH * 0.12)} />
                <span style={{ fontSize: Math.max(10, cardH * 0.12) }}>{tech.priority}</span>
            </div>

            {/* Ações (position absolute para não atrapalhar layout) */}
            <div className="card-actions absolute top-2 right-2 flex gap-1 bg-black/50 backdrop-blur-sm rounded-md p-1">
                <button onClick={() => setEditing(true)} className="action-btn hover:text-emerald-400" title="Editar">
                    <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmDelete(true)} className="action-btn hover:text-red-400" title="Remover">
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Resize Handle */}
            <div
                className="resize-handle"
                onMouseDown={handleResizeStart}
                title="Redimensionar"
            />
        </div>
    );
}

TechCard.propTypes = {
    // ... (mesmos propTypes)
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
