/**
 * Configuração do cliente Supabase.
 *
 * O Supabase é um Backend as a Service (BaaS) que usamos como banco de dados.
 * As credenciais ficam em variáveis de ambiente para segurança.
 *
 * Variáveis necessárias no arquivo .env na raiz do projeto:
 *   VITE_SUPABASE_URL=sua_url_aqui
 *   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
 *
 * IMPORTANTE: O prefixo VITE_ é obrigatório para o Vite expor
 * a variável no frontend via import.meta.env
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Aviso no console se as variáveis não estiverem configuradas
if (!supabaseUrl || !supabaseKey) {
    console.warn(
        "⚠️ Variáveis do Supabase não configuradas!\n" +
        "Crie um arquivo .env na raiz do projeto com:\n" +
        "  VITE_SUPABASE_URL=sua_url\n" +
        "  VITE_SUPABASE_ANON_KEY=sua_chave\n" +
        "A aplicação vai funcionar em modo offline (sem persistência)."
    );
}

/**
 * Cliente Supabase — pode ser null se as variáveis não existirem.
 * Os componentes que usam o supabase devem verificar se ele existe.
 */
export const supabase =
    supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
