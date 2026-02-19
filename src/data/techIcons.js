/**
 * Mapeamento de tecnologias → ícones do Devicon.
 *
 * Usamos o CDN do Devicon para carregar os SVGs das tecnologias.
 * URL base: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/
 *
 * Para adicionar uma nova tecnologia, basta incluir o slug do Devicon
 * e o nome de exibição neste mapa.
 *
 * Referência completa de ícones disponíveis:
 * → https://devicon.dev/
 */

const DEVICON_BASE =
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

/**
 * Mapa de tecnologias suportadas.
 * Chave: palavras-chave para match (lowercase).
 * Valor: { slug, file, label }
 *   - slug: pasta no devicon
 *   - file: nome do arquivo SVG
 *   - label: nome de exibição
 */
const TECH_MAP = [
    // ─── Linguagens ───
    { keywords: ["javascript", "js"], slug: "javascript", file: "javascript-original.svg", label: "JavaScript" },
    { keywords: ["typescript", "ts"], slug: "typescript", file: "typescript-original.svg", label: "TypeScript" },
    { keywords: ["python", "py"], slug: "python", file: "python-original.svg", label: "Python" },
    { keywords: ["java"], slug: "java", file: "java-original.svg", label: "Java" },
    { keywords: ["csharp", "c#", "c sharp"], slug: "csharp", file: "csharp-original.svg", label: "C#" },
    { keywords: ["c++", "cpp"], slug: "cplusplus", file: "cplusplus-original.svg", label: "C++" },
    { keywords: ["c lang", "linguagem c"], slug: "c", file: "c-original.svg", label: "C" },
    { keywords: ["go", "golang"], slug: "go", file: "go-original.svg", label: "Go" },
    { keywords: ["rust"], slug: "rust", file: "rust-original.svg", label: "Rust" },
    { keywords: ["ruby"], slug: "ruby", file: "ruby-original.svg", label: "Ruby" },
    { keywords: ["php"], slug: "php", file: "php-original.svg", label: "PHP" },
    { keywords: ["swift"], slug: "swift", file: "swift-original.svg", label: "Swift" },
    { keywords: ["kotlin"], slug: "kotlin", file: "kotlin-original.svg", label: "Kotlin" },
    { keywords: ["dart"], slug: "dart", file: "dart-original.svg", label: "Dart" },
    { keywords: ["r lang", "r language", "rlang"], slug: "r", file: "r-original.svg", label: "R" },
    { keywords: ["lua"], slug: "lua", file: "lua-original.svg", label: "Lua" },
    { keywords: ["scala"], slug: "scala", file: "scala-original.svg", label: "Scala" },
    { keywords: ["elixir"], slug: "elixir", file: "elixir-original.svg", label: "Elixir" },

    // ─── Frontend ───
    { keywords: ["react", "react.js", "reactjs", "react native"], slug: "react", file: "react-original.svg", label: "React" },
    { keywords: ["vue", "vue.js", "vuejs"], slug: "vuejs", file: "vuejs-original.svg", label: "Vue.js" },
    { keywords: ["angular"], slug: "angularjs", file: "angularjs-original.svg", label: "Angular" },
    { keywords: ["svelte"], slug: "svelte", file: "svelte-original.svg", label: "Svelte" },
    { keywords: ["next", "next.js", "nextjs"], slug: "nextjs", file: "nextjs-original.svg", label: "Next.js" },
    { keywords: ["nuxt", "nuxt.js"], slug: "nuxtjs", file: "nuxtjs-original.svg", label: "Nuxt.js" },
    { keywords: ["html", "html5"], slug: "html5", file: "html5-original.svg", label: "HTML5" },
    { keywords: ["css", "css3"], slug: "css3", file: "css3-original.svg", label: "CSS3" },
    { keywords: ["sass", "scss"], slug: "sass", file: "sass-original.svg", label: "Sass" },
    { keywords: ["tailwind", "tailwindcss"], slug: "tailwindcss", file: "tailwindcss-original.svg", label: "Tailwind CSS" },
    { keywords: ["bootstrap"], slug: "bootstrap", file: "bootstrap-original.svg", label: "Bootstrap" },
    { keywords: ["jquery"], slug: "jquery", file: "jquery-original.svg", label: "jQuery" },

    // ─── Backend & Frameworks ───
    { keywords: ["node", "node.js", "nodejs"], slug: "nodejs", file: "nodejs-original.svg", label: "Node.js" },
    { keywords: ["express", "express.js"], slug: "express", file: "express-original.svg", label: "Express" },
    { keywords: ["django"], slug: "django", file: "django-plain.svg", label: "Django" },
    { keywords: ["flask"], slug: "flask", file: "flask-original.svg", label: "Flask" },
    { keywords: ["fastapi"], slug: "fastapi", file: "fastapi-original.svg", label: "FastAPI" },
    { keywords: ["spring", "spring boot"], slug: "spring", file: "spring-original.svg", label: "Spring" },
    { keywords: ["rails", "ruby on rails"], slug: "rails", file: "rails-original-wordmark.svg", label: "Rails" },
    { keywords: ["laravel"], slug: "laravel", file: "laravel-original.svg", label: "Laravel" },
    { keywords: [".net", "dotnet", "asp.net"], slug: "dot-net", file: "dot-net-original.svg", label: ".NET" },
    { keywords: ["blazor"], slug: "blazor", file: "blazor-original.svg", label: "Blazor" },

    // ─── Mobile ───
    { keywords: ["flutter"], slug: "flutter", file: "flutter-original.svg", label: "Flutter" },
    { keywords: ["android"], slug: "android", file: "android-original.svg", label: "Android" },
    { keywords: ["apple", "ios"], slug: "apple", file: "apple-original.svg", label: "iOS" },
    { keywords: ["expo"], slug: "expo", file: "expo-original.svg", label: "Expo" },

    // ─── Bancos de Dados ───
    { keywords: ["postgres", "postgresql"], slug: "postgresql", file: "postgresql-original.svg", label: "PostgreSQL" },
    { keywords: ["mysql"], slug: "mysql", file: "mysql-original.svg", label: "MySQL" },
    { keywords: ["mongodb", "mongo"], slug: "mongodb", file: "mongodb-original.svg", label: "MongoDB" },
    { keywords: ["redis"], slug: "redis", file: "redis-original.svg", label: "Redis" },
    { keywords: ["sqlite"], slug: "sqlite", file: "sqlite-original.svg", label: "SQLite" },
    { keywords: ["sql server", "sqlserver", "mssql"], slug: "microsoftsqlserver", file: "microsoftsqlserver-original.svg", label: "SQL Server" },
    { keywords: ["firebase", "firestore"], slug: "firebase", file: "firebase-original.svg", label: "Firebase" },
    { keywords: ["supabase"], slug: "supabase", file: "supabase-original.svg", label: "Supabase" },

    // ─── DevOps & Cloud ───
    { keywords: ["docker"], slug: "docker", file: "docker-original.svg", label: "Docker" },
    { keywords: ["kubernetes", "k8s"], slug: "kubernetes", file: "kubernetes-original.svg", label: "Kubernetes" },
    { keywords: ["aws", "amazon"], slug: "amazonwebservices", file: "amazonwebservices-original-wordmark.svg", label: "AWS" },
    { keywords: ["azure"], slug: "azure", file: "azure-original.svg", label: "Azure" },
    { keywords: ["gcp", "google cloud"], slug: "googlecloud", file: "googlecloud-original.svg", label: "Google Cloud" },
    { keywords: ["linux"], slug: "linux", file: "linux-original.svg", label: "Linux" },
    { keywords: ["nginx"], slug: "nginx", file: "nginx-original.svg", label: "Nginx" },
    { keywords: ["git"], slug: "git", file: "git-original.svg", label: "Git" },
    { keywords: ["github"], slug: "github", file: "github-original.svg", label: "GitHub" },
    { keywords: ["gitlab"], slug: "gitlab", file: "gitlab-original.svg", label: "GitLab" },
    { keywords: ["vercel"], slug: "vercel", file: "vercel-original.svg", label: "Vercel" },
    { keywords: ["heroku"], slug: "heroku", file: "heroku-original.svg", label: "Heroku" },

    // ─── Ferramentas ───
    { keywords: ["vscode", "visual studio code"], slug: "vscode", file: "vscode-original.svg", label: "VS Code" },
    { keywords: ["figma"], slug: "figma", file: "figma-original.svg", label: "Figma" },
    { keywords: ["webpack"], slug: "webpack", file: "webpack-original.svg", label: "Webpack" },
    { keywords: ["vite"], slug: "vitejs", file: "vitejs-original.svg", label: "Vite" },
    { keywords: ["graphql"], slug: "graphql", file: "graphql-plain.svg", label: "GraphQL" },
    { keywords: ["jest"], slug: "jest", file: "jest-plain.svg", label: "Jest" },
    { keywords: ["terraform"], slug: "terraform", file: "terraform-original.svg", label: "Terraform" },

    // ─── IA & Data ───
    { keywords: ["tensorflow"], slug: "tensorflow", file: "tensorflow-original.svg", label: "TensorFlow" },
    { keywords: ["pytorch"], slug: "pytorch", file: "pytorch-original.svg", label: "PyTorch" },
    { keywords: ["pandas"], slug: "pandas", file: "pandas-original.svg", label: "Pandas" },
    { keywords: ["numpy"], slug: "numpy", file: "numpy-original.svg", label: "NumPy" },
    { keywords: ["jupyter"], slug: "jupyter", file: "jupyter-original.svg", label: "Jupyter" },
];

/**
 * Busca o ícone de uma tecnologia pelo nome.
 * Faz fuzzy matching — o nome não precisa ser exato.
 *
 * @param {string} techName - Nome da tecnologia digitado pelo usuário
 * @returns {{ iconUrl: string, label: string } | null} - URL do ícone ou null
 */
export function getTechIcon(techName) {
    if (!techName) return null;

    const search = techName.toLowerCase().trim();

    // Busca exata primeiro, depois parcial
    const match = TECH_MAP.find(
        (tech) =>
            tech.keywords.some((kw) => kw === search) ||
            tech.keywords.some((kw) => search.includes(kw) || kw.includes(search))
    );

    if (!match) return null;

    return {
        iconUrl: `${DEVICON_BASE}/${match.slug}/${match.file}`,
        label: match.label,
    };
}

/**
 * Retorna lista de sugestões de tecnologias baseada no texto digitado.
 * Usado para autocomplete no formulário.
 *
 * @param {string} query - Texto parcial digitado
 * @param {number} limit - Máximo de sugestões
 * @returns {Array<{ name: string, iconUrl: string }>}
 */
export function getSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];

    const search = query.toLowerCase().trim();

    return TECH_MAP.filter((tech) =>
        tech.keywords.some((kw) => kw.includes(search) || search.includes(kw))
    )
        .slice(0, limit)
        .map((tech) => ({
            name: tech.label,
            iconUrl: `${DEVICON_BASE}/${tech.slug}/${tech.file}`,
        }));
}
