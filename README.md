# Tech Wishlist 🚀

Um projeto moderno e interativo para organizar suas metas de aprendizado tecnológico.

<img width="1919" height="858" alt="image" src="https://github.com/user-attachments/assets/6a334177-4b86-47d4-aedb-c2a53c8c6918" />


## 🎯 Objetivo Didático (Mentoria)

Este projeto foi construído não apenas para funcionar, mas para **ensinar**. O código está repleto de comentários explicativos ("Educational Comments") cobrindo conceitos avançados de React:

-   **Custom Hooks (`useTechs`)**: Como separar lógica de estado da UI.
-   **Context API & Drag-and-Drop (`@dnd-kit`)**: Gerenciamento de estado complexo e interações físicas.
-   **Optimistic UI**: Como atualizar a interface antes mesmo do servidor responder (sensação de zero latência).
-   **Supabase Integration**: Backend-as-a-Service para persistência de dados real.
-   **LocalStorage Persistence**: Como manter o estado do usuário entre sessões.

## 🛠️ Stack Tecnológico

-   **Frontend:** React, Vite
-   **Estilização:** Tailwind CSS (Glassmorphism UI)
-   **Ícones:** Lucide React + Devicon CDN
-   **Backend:** Supabase (Database + Realtime)
-   **Drag & Drop:** @dnd-kit/core

## 🚀 Como Executar

### Pré-requisitos
-   Node.js 20+ (Recomendado usar `nvm`)

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/pikulitomarkin/techwishlist.git
    cd techwishlist
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração (Opcional para modo Offline):**
    Para persistência na nuvem, crie um arquivo `.env` na raiz com suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_aqui
    ```
    *Sem isso, o app funciona em modo "Offline" (salva apenas na memória).*

4.  **Rode o projeto:**
    ```bash
    npm run dev
    ```

## 📂 Estrutura do Projeto

-   `src/components`: Componentes reutilizáveis (Cards, Widgets, Listas).
-   `src/hooks`: Lógica de negócio isolada (ex: `useTechs.js`).
-   `src/data`: Dados estáticos e helpers (ex: mapeamento de ícones).

---

Feito com 💜 para a comunidade dev.
