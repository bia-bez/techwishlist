/**
 * TechForm — Formulário para adicionar novas tecnologias.
 *
 * Props:
 * - onAdd(tech): função chamada quando o formulário é enviado
 *
 * Conceitos usados:
 * - useState: controlar os campos do formulário (controlled inputs)
 * - PropTypes: validar que as props recebidas estão corretas
 * - Feedback visual: botão muda de estado durante envio
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { Plus, Sparkles } from "lucide-react";

// Labels amigáveis para cada nível de prioridade
const PRIORITY_LABELS = {
  1: "Baixa",
  2: "Normal",
  3: "Média",
  4: "Alta",
  5: "Urgente",
};

function TechForm({ onAdd }) {
  // Estado dos campos do formulário
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(3);

  // Controla se o formulário está enviando (para feedback visual)
  const [submitting, setSubmitting] = useState(false);

  /**
   * Processa o envio do formulário.
   * Previne o comportamento padrão (recarregar página),
   * valida o campo, envia e limpa o formulário.
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // Validação: não permite nome vazio
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSubmitting(true);

    // Chama a função do componente pai para salvar no Supabase
    const success = await onAdd({ name: trimmedName, priority });

    if (success) {
      // Limpa o formulário só se salvou com sucesso
      setName("");
      setPriority(3);
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      {/* Container com efeito de vidro (glassmorphism) */}
      <div className="glass-card p-6 rounded-2xl">
        {/* Cabeçalho do formulário */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={20} className="text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">
            Adicionar Tecnologia
          </h2>
        </div>

        {/* Campo de nome da tecnologia */}
        <div className="mb-4">
          <label htmlFor="tech-name" className="form-label">
            Nome da tecnologia
          </label>
          <input
            type="text"
            id="tech-name"
            placeholder="Ex: React, Python, Docker..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            disabled={submitting}
            autoComplete="off"
          />
        </div>

        {/* Seletor de prioridade */}
        <div className="mb-5">
          <label htmlFor="tech-priority" className="form-label">
            Prioridade
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPriority(n)}
                disabled={submitting}
                className={`priority-btn ${priority === n ? "priority-btn-active" : ""
                  }`}
                title={PRIORITY_LABELS[n]}
              >
                <span className="text-sm font-bold">{n}</span>
                <span className="text-[10px] opacity-70">
                  {PRIORITY_LABELS[n]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn-primary w-full"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading-spinner" />
              Salvando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Plus size={18} />
              Adicionar à Wishlist
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

// Validação das props recebidas
TechForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default TechForm;
