Tech Wishlist
Aplicação web desenvolvida com React + Vite para gerenciamento de tecnologias que desejo aprender, permitindo definição de prioridade e persistência em banco de dados na nuvem.

🔗 Deploy: (em breve)
📦 Repositório: ([link do GitHub](https://github.com/bia-bez/Tech-Wishlist))

🧠 Sobre o Projeto
O objetivo da aplicação é permitir o cadastro e organização de tecnologias com nível de prioridade (1 a 5), garantindo:

Persistência em banco de dados

Ordenação por prioridade

Integração frontend + BaaS

Deploy público funcional

O projeto foi desenvolvido com foco em organização de código, separação de responsabilidades e boas práticas de segurança.

Stack Utilizada

Frontend

React (Vite)

Tailwind CSS

Hooks (useState, useEffect)

Backend / BaaS

Supabase

Row Level Security (RLS)

Deploy

Vercel

Integração com o Supabase
A conexão foi realizada utilizando o pacote oficial:

@supabase/supabase-js
Foi criado um client dedicado:

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

Inserção de dados
await supabase
.from("tech_wishlist")
.insert([{ name, priority }]);
Consulta de dados
await supabase
.from("tech_wishlist")
.select("\*")
.order("priority", { ascending: false });
Os dados são carregados no useEffect, garantindo sincronização ao iniciar a aplicação.

Segurança e RLS
Durante o desenvolvimento ocorreu o erro:

new row violates row-level security policy
A causa foi o Row Level Security (RLS) ativado por padrão no Supabase.

A solução adotada foi criar policies específicas permitindo:

SELECT para role anon

INSERT para role anon

Sem desativar o RLS, mantendo boas práticas de segurança.

Deploy
O projeto foi publicado na Vercel, com configuração das seguintes variáveis de ambiente:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
Isso garantiu funcionamento correto em ambiente de produção.

📁 Estrutura do Projeto
src/
├── components/
│ ├── TechForm.jsx
│ └── TechList.jsx
├── supabaseClient.js
└── App.jsx
Separação clara entre:

Componentes

Lógica de estado

Camada de integração com backend

Melhorias Futuras
Autenticação de usuários

Edição e remoção de tecnologias

Atualização em tempo real (Supabase Realtime)

Filtro por prioridade

Desenvolvido por
bia-bez
