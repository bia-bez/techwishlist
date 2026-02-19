/**
 * Hook customizado para gerenciar as operações CRUD de tecnologias.
 *
 * Por que um hook customizado?
 * → Separar a lógica de dados (Supabase) da interface (componentes).
 * → Isso facilita manutenção, testes e reutilização.
 *
 * Conceitos usados:
 * - useState: armazena estado local (lista, loading, erro)
 * - useEffect: executa código quando o componente monta
 * - useCallback: memoriza funções para evitar re-renders desnecessários
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

// Nome da tabela no Supabase
const TABLE = "tech_wishlist";

/**
 * Função pura que busca os dados do Supabase.
 * Separada do hook para manter o código organizado.
 */
async function fetchFromSupabase() {
    // Se o Supabase não está configurado, retorna lista vazia
    if (!supabase) return [];

    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("priority", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

export function useTechs() {
    // Estado da lista de tecnologias
    const [techs, setTechs] = useState([]);

    // Indica se está carregando dados do servidor
    const [loading, setLoading] = useState(true);

    // Armazena mensagens de erro para exibir ao usuário
    const [error, setError] = useState(null);

    /**
     * Busca todas as tecnologias do Supabase.
     * Usa try/catch para tratamento de erros limpo.
     */
    const fetchTechs = useCallback(async () => {
        try {
            const data = await fetchFromSupabase();
            setTechs(data);
            setError(null);
        } catch (err) {
            console.error("Erro ao buscar tecnologias:", err);
            setError("Não foi possível carregar as tecnologias. Tente novamente.");
        } finally {
            // finally roda SEMPRE, independente de sucesso ou erro.
            setLoading(false);
        }
    }, []);

    /**
     * Adiciona uma nova tecnologia à lista.
     * Retorna true se sucesso, false se erro.
     */
    const addTech = useCallback(
        async (tech) => {
            if (!supabase) {
                // Modo offline: adiciona apenas localmente (Optimistic UI fake)
                setTechs((prev) => [{ id: Date.now(), ...tech }, ...prev]);
                return true;
            }

            setError(null);

            const { error: insertError } = await supabase
                .from(TABLE)
                .insert([tech]);

            if (insertError) {
                console.error("Erro ao adicionar:", insertError);
                setError("Erro ao adicionar tecnologia. Tente novamente.");
                return false;
            }

            // Recarrega a lista atualizada do servidor para garantir sincronia
            await fetchTechs();
            return true;
        },
        [fetchTechs]
    );

    /**
     * Atualiza uma tecnologia existente pelo ID.
     * Recebe o id e os campos a serem atualizados.
     */
    const updateTech = useCallback(
        async (id, updates) => {
            if (!supabase) {
                // Modo offline: atualiza localmente
                setTechs((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
                );
                return true;
            }

            setError(null);

            const { error: updateError } = await supabase
                .from(TABLE)
                .update(updates)
                .eq("id", id);

            if (updateError) {
                console.error("Erro ao atualizar:", updateError);
                setError("Erro ao atualizar tecnologia. Tente novamente.");
                return false;
            }

            await fetchTechs();
            return true;
        },
        [fetchTechs]
    );

    /**
     * Remove uma tecnologia pelo ID.
     */
    const deleteTech = useCallback(
        async (id) => {
            if (!supabase) {
                // Modo offline: remove localmente (String cast para segurança de tipos)
                setTechs((prev) => prev.filter((t) => String(t.id) !== String(id)));
                return true;
            }

            setError(null);

            const { error: deleteError } = await supabase
                .from(TABLE)
                .delete()
                .eq("id", id);

            if (deleteError) {
                console.error("Erro ao remover:", deleteError);
                setError("Erro ao remover tecnologia. Tente novamente.");
                return false;
            }

            await fetchTechs();
            return true;
        },
        [fetchTechs]
    );

    // Função para limpar o erro (também memorizada)
    const clearError = useCallback(() => setError(null), []);

    // Busca os dados quando o hook é usado pela primeira vez
    useEffect(() => {
        fetchTechs();
    }, [fetchTechs]);

    // Retorna tudo que os componentes precisam (Interface Pública do Hook)
    return {
        techs,
        setTechs,
        loading,
        error,
        addTech,
        updateTech,
        deleteTech,
        clearError,
    };
}
