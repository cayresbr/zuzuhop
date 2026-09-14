/**
 * Catálogo de conteúdo do Zuzuhop.
 *
 * Fonte única da verdade: o seed do banco lê daqui e o app renderiza daqui.
 * Cada jogo declara objetivos pedagógicos explícitos — é isso que alimenta o
 * relatório de progresso mostrado ao responsável ("o que meu filho aprendeu").
 */

export type Category =
  | "letras"
  | "numeros"
  | "cores"
  | "musica"
  | "logica"
  | "criatividade"
  | "mundo"
  | "emocoes";

export interface GameDefinition {
  slug: string;
  title: string;
  description: string;
  category: Category;
  emoji: string;
  color: "grape" | "mango" | "mint" | "sky" | "coral" | "lime";
  minAge: number;
  maxAge: number;
  isPremium: boolean;
  sortOrder: number;
  learningGoals: string[];
}

/**
 * `label` é o nome completo, para o responsável e o painel.
 * `short` é o que aparece nos chips do modo criança — nome longo em botão
 * infantil não é lido, é ignorado.
 */
export const CATEGORY_LABELS: Record<
  Category,
  { label: string; short: string; emoji: string }
> = {
  letras: { label: "Letras e palavras", short: "Letras", emoji: "🔤" },
  numeros: { label: "Números e lógica matemática", short: "Números", emoji: "🔢" },
  cores: { label: "Cores e formas", short: "Cores", emoji: "🎨" },
  musica: { label: "Música e ritmo", short: "Música", emoji: "🎵" },
  logica: { label: "Raciocínio e memória", short: "Memória", emoji: "🧩" },
  criatividade: { label: "Criatividade", short: "Arte", emoji: "🖌️" },
  mundo: { label: "Mundo e ciências", short: "Mundo", emoji: "🌍" },
  emocoes: { label: "Emoções e convivência", short: "Emoções", emoji: "💛" },
};

export const GAMES: GameDefinition[] = [
  {
    slug: "memoria-dos-bichos",
    title: "Memória dos Bichos",
    description: "Ache os pares de animais antes que eles fujam!",
    category: "logica",
    emoji: "🐯",
    color: "mango",
    minAge: 3,
    maxAge: 8,
    isPremium: false,
    sortOrder: 10,
    learningGoals: [
      "Memória visual de curto prazo",
      "Atenção sustentada",
      "Reconhecimento de animais",
    ],
  },
  {
    slug: "conta-comigo",
    title: "Conta Comigo",
    description: "Conte foguetes, frutas e estrelas para achar o número certo.",
    category: "numeros",
    emoji: "🚀",
    color: "sky",
    minAge: 3,
    maxAge: 7,
    isPremium: false,
    sortOrder: 20,
    learningGoals: [
      "Contagem até 10",
      "Correspondência quantidade-numeral",
      "Noção de mais e menos",
    ],
  },
  {
    slug: "caca-letras",
    title: "Caça-Letras",
    description: "Qual letra começa a palavra? Toque na certa!",
    category: "letras",
    emoji: "🅰️",
    color: "coral",
    minAge: 4,
    maxAge: 8,
    isPremium: false,
    sortOrder: 30,
    learningGoals: [
      "Consciência fonológica",
      "Identificação de letras iniciais",
      "Vocabulário",
    ],
  },
  {
    slug: "mundo-das-cores",
    title: "Mundo das Cores",
    description: "Arraste cada forma para o balde da cor certinha.",
    category: "cores",
    emoji: "🎨",
    color: "grape",
    minAge: 2,
    maxAge: 6,
    isPremium: false,
    sortOrder: 40,
    learningGoals: [
      "Nomeação de cores",
      "Classificação por atributo",
      "Coordenação motora fina",
    ],
  },
  {
    slug: "piano-maluco",
    title: "Piano Maluco",
    description: "Escute a melodia e repita na ordem. Cada nota, uma cor!",
    category: "musica",
    emoji: "🎹",
    color: "mint",
    minAge: 3,
    maxAge: 8,
    isPremium: false,
    sortOrder: 50,
    learningGoals: [
      "Memória auditiva sequencial",
      "Percepção de altura sonora",
      "Ritmo e turno de vez",
    ],
  },
  {
    slug: "atelie-de-pintura",
    title: "Ateliê de Pintura",
    description: "Um espaço livre para desenhar o que você quiser.",
    category: "criatividade",
    emoji: "🖌️",
    color: "lime",
    minAge: 2,
    maxAge: 8,
    isPremium: false,
    sortOrder: 60,
    learningGoals: [
      "Expressão criativa livre",
      "Controle motor fino",
      "Exploração de cor e traço",
    ],
  },
  {
    slug: "sequencia-magica",
    title: "Sequência Mágica",
    description: "Descubra qual peça continua o padrão.",
    category: "logica",
    emoji: "🔮",
    color: "grape",
    minAge: 4,
    maxAge: 8,
    isPremium: true,
    sortOrder: 70,
    learningGoals: [
      "Reconhecimento de padrões",
      "Pensamento algorítmico inicial",
      "Antecipação lógica",
    ],
  },
  {
    slug: "labirinto-do-foguete",
    title: "Labirinto do Foguete",
    description: "Programe o caminho do foguete até o planeta.",
    category: "mundo",
    emoji: "🛸",
    color: "sky",
    minAge: 5,
    maxAge: 8,
    isPremium: true,
    sortOrder: 80,
    learningGoals: [
      "Noções de programação em blocos",
      "Orientação espacial",
      "Planejamento e depuração",
    ],
  },
  {
    slug: "como-eu-me-sinto",
    title: "Como Eu Me Sinto",
    description: "Ajude os amigos a reconhecer cada emoção.",
    category: "emocoes",
    emoji: "💛",
    color: "coral",
    minAge: 3,
    maxAge: 8,
    isPremium: false,
    sortOrder: 90,
    learningGoals: [
      "Vocabulário emocional",
      "Empatia e leitura de expressões",
      "Autorregulação",
    ],
  },
];

export function getGame(slug: string): GameDefinition | undefined {
  return GAMES.find((game) => game.slug === slug);
}
