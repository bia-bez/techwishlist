/**
 * TechCard — Exibe uma única tecnologia com opções de editar e remover.
 *
 * Props:
 * - tech: objeto com { id, name, priority }
 * - onUpdate(id, updates): função para atualizar uma tech
 * - onDelete(id): função para remover uma tech
 *
 * Conceitos usados:
 * - useState: controlar modo de edição e estados visuais
 * - Renderização condicional: mostrar/esconder campos de edição
 * - Desestruturação de props
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { Pencil, Trash2, Check, X, Star } from "lucide-react";

// Cores para cada nível de prioridade (Tailwind classes)
const PRIORITY_COLORS = {
    1: "from-slate-500 to-slate-600",
    2: "from-blue-500 to-blue-600",
    3: "from-amber-500 to-amber-600",
    4: "from-orange-500 to-orange-600",
    5: "from-red-500 to-rose-600",
};

const PRIORITY_LABELS = {
    1: "Baixa",
    2: "Normal",
    3: "Média",
    4: "Alta",
    5: "Urgente",
};

function TechCard({ tech, onUpdate, onDelete }) {
    // Controla se o card está em modo de edição
    const [editing, setEditing] = useState(false);

    // Valores temporários durante edição (não altera o original até salvar)
    const [editName, setEditName] = useState(tech.name);
    const [editPriority, setEditPriority] = useState(tech.priority);

    // Controla estados de carregamento para cada ação
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Controla o modal de confirmação de exclusão
    const [confirmDelete, setConfirmDelete] = useState(false);

    /**
     * Salva as alterações de edição.
     * Só envia ao servidor se algo realmente mudou.
     */
    async function handleSave() {
        const trimmedName = editName.trim();
        if (!trimmedName) return;

        // Verifica se houve mudança real
        if (trimmedName === tech.name && editPriority === tech.priority) {
            setEditing(false);
            return;
        }

        setSaving(true);
        const success = await onUpdate(tech.id, {
            name: trimmedName,
            priority: editPriority,
        });

        if (success) {
            setEditing(false);
        }
        setSaving(false);
    }

    /**
     * Cancela a edição e restaura os valores originais.
     */
    function handleCancel() {
        setEditName(tech.name);
        setEditPriority(tech.priority);
        setEditing(false);
    }

    /**
     * Confirma e executa a exclusão.
     */
    async function handleDelete() {
        setDeleting(true);
        await onDelete(tech.id);
        setDeleting(false);
    }

    // ─── MODO DE EDIÇÃO ───
    if (editing) {
        return (
            <div className="glass-card p-4 rounded-xl animate-fade-in border border-emerald-500/30">
                {/* Campo de edição do nome */}
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="form-input mb-3 text-sm"
                    disabled={saving}
                    autoFocus
                />

                {/* Seletor de prioridade compacto */}
                <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setEditPriority(n)}
                            disabled={saving}
                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${editPriority === n
                                    ? "bg-emerald-500 text-white scale-105"
                                    : "bg-white/5 text-white/50 hover:bg-white/10"
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                {/* Botões salvar/cancelar */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || !editName.trim()}
                        className="btn-success flex-1 text-sm"
                    >
                        {saving ? (
                            <span className="loading-spinner mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-1">
                                <Check size={14} /> Salvar
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="btn-ghost flex-1 text-sm"
                    >
                        <span className="flex items-center justify-center gap-1">
                            <X size={14} /> Cancelar
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    // ─── CONFIRMAÇÃO DE EXCLUSÃO ───
    if (confirmDelete) {
        return (
            <div className="glass-card p-4 rounded-xl animate-fade-in border border-red-500/30">
                <p className="text-white/80 text-sm text-center mb-3">
                    Remover <strong className="text-white">{tech.name}</strong>?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn-danger flex-1 text-sm"
                    >
                        {deleting ? (
                            <span className="loading-spinner mx-auto" />
                        ) : (
                            "Sim, remover"
                        )}
                    </button>
                    <button
                        onClick={() => setConfirmDelete(false)}
                        disabled={deleting}
                        className="btn-ghost flex-1 text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // ─── VISUALIZAÇÃO NORMAL ───
    return (
        <div className="tech-card group">
            {/* Badge de prioridade com gradiente */}
            <div
                className={`priority-badge bg-gradient-to-r ${PRIORITY_COLORS[tech.priority]}`}
            >
                <Star size={10} className="fill-current" />
                <span>{tech.priority}</span>
            </div>

            {/* Info da tecnologia */}
            <div className="flex-1 min-w-0 ml-3">
                <h3 className="text-white font-medium truncate">{tech.name}</h3>
                <p className="text-white/40 text-xs mt-0.5">
                    {PRIORITY_LABELS[tech.priority]}
                </p>
            </div>

            {/* Ações (aparecem no hover) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={() => setEditing(true)}
                    className="action-btn hover:text-emerald-400"
                    title="Editar"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="action-btn hover:text-red-400"
                    title="Remover"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// Validação das props
TechCard.propTypes = {
    tech: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        priority: PropTypes.number.isRequired,
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TechCard;
