/**
 * TechForm — Formulário para adicionar tecnologias à wishlist.
 *
 * Novidades nesta versão:
 * - Autocomplete que sugere tecnologias conhecidas enquanto digita
 * - Preview do ícone da tecnologia em tempo real
 * - Seletor visual de prioridade com botões
 * - Feedback de submissão (loading state)
 * - PropTypes para validação
 */
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import { getSuggestions, getTechIcon } from "../data/techIcons";
import TechIcon from "./TechIcon";

function TechForm({ onAdd }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Atualiza sugestões conforme o usuário digita
  useEffect(() => {
    const results = getSuggestions(name);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 && name.length >= 2);
  }, [name]);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSubmitting(true);
    const success = await onAdd({ name: trimmedName, priority });

    if (success) {
      setName("");
      setPriority(3);
      setShowSuggestions(false);
    }
    setSubmitting(false);
  }

  function selectSuggestion(suggestion) {
    setName(suggestion.name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  // Preview do ícone da tecnologia atual
  const currentIcon = getTechIcon(name);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="glass-card p-6 rounded-2xl">
        {/* Campo de nome com autocomplete */}
        <div className="relative">
          <label htmlFor="tech-name" className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
            Tecnologia
          </label>
          <div className="relative flex items-center">
            {/* Preview do ícone no input */}
            {currentIcon && (
              <div className="absolute left-3 pointer-events-none">
                <TechIcon name={name} size={20} />
              </div>
            )}
            <input
              ref={inputRef}
              id="tech-name"
              type="text"
              placeholder="Ex: React, Python, Docker..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className={`input-field w-full ${currentIcon ? "pl-10" : ""}`}
              autoComplete="off"
            />
          </div>

          {/* Dropdown de sugestões */}
          {showSuggestions && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="suggestion-item"
                >
                  <img src={s.iconUrl} alt={s.name} width={20} height={20} className="tech-icon" />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Seletor de prioridade */}
        <div className="mt-4">
          <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
            Prioridade
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`priority-btn ${priority === p ? "priority-btn-active" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de submit */}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="btn-primary w-full mt-4"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading-spinner" /> Salvando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Plus size={18} /> Adicionar à Wishlist
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

TechForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default TechForm;
