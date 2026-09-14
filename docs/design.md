# Sistema de design e voz

Como o Zuzuhop se parece, por que se parece assim e como a narração foi feita
para soar gente, não máquina.

---

## 1. Três princípios

**Forma arredondada.** Nenhum canto vivo em todo o modo criança. Criança
pequena lê o mundo por silhueta, e forma arredondada é percebida como amigável
e segura. Os raios são grandes de propósito: `--radius-blob` (2rem) em cartões
e `--radius-pill` em botões.

**Profundidade física.** Todo botão tem espessura: uma sombra *sólida* (não
borrada) embaixo, e afunda 5px ao toque. É a classe `.chunky`:

```css
.chunky        { box-shadow: 0 6px 0 0 var(--chunky-shade), …; }
.chunky:active { transform: translateY(5px); box-shadow: 0 1px 0 0 …; }
```

Isso dá ao toque uma resposta tátil que a criança entende sem explicação —
o botão parece um objeto de borracha, não um retângulo pintado.

**Cor sem gênero.** Seis matizes fortes e igualmente convidativos (uva, manga,
menta, céu, coral, limão), cada um com escala de 50 a 700. Quem escolhe a cor
do perfil é a criança. Não existe rosa-para-menina nem azul-para-menino em
lugar nenhum do produto.

Os neutros são **quentes** (`--color-ink: #2b2140`, `--color-cream: #fffdf7`),
nunca cinza puro — cinza puro gela a interface.

---

## 2. Tipografia

| Fonte | Onde | Por quê |
|---|---|---|
| **Baloo 2** | títulos e todo o modo criança | Arredondada, cheia, com contraforma generosa. É a letra que uma criança pré-leitora reconhece melhor: formas fechadas, sem serifa, peso alto. |
| **Nunito** | textos corridos da área do responsável | Leitura confortável em blocos longos, mantendo o ar amigável. |

Ambas são carregadas com `next/font/google`, que **baixa os arquivos no build e
os serve pelo próprio domínio**. Isso não é detalhe: a CSP do app é
`font-src 'self'`, então uma fonte vinda de CDN seria bloqueada — e, mais
importante, nenhuma requisição parte do navegador da criança para terceiros.

---

## 3. Mascotes

`src/components/mascots.tsx`

- **Zuzu** — coelha exploradora. O "hop" da marca é o pulo dela.
- **Hop** — o robozinho que a Zuzu construiu, com um coração no peito.

Os dois seguem a regra que o estudo do concorrente apontou como o grande
acerto do Lingokids: **personagem tem papel, não gênero**. Zuzu explora, Hop é
invento. É assim que o mesmo conteúdo atrai meninas e meninos.

Tudo é **SVG inline**, sem nenhuma imagem externa: escala sem perder nitidez,
não gasta requisição e a expressão muda por prop em vez de exigir novo arquivo.

Quatro humores: `feliz`, `comemorando`, `sonolento`, `curioso`. Eles aparecem
onde importa — Zuzu comemorando na vitória, Zuzu sonolenta quando o tempo de
tela acaba, Hop curioso guardando o portão parental.

O detalhe que separa "desenho" de "personagem vivo" é a **piscada**: uma
animação de `scaleY` que roda a cada 5–6 segundos, dessincronizada entre os
dois.

---

## 4. Cenário

`src/components/scenery.tsx`

- `SkyScene` — céu em gradiente, nuvens navegando, morros ao fundo, sol difuso.
- `NightScene` — estrelas piscando e lua, para a despedida do fim do tempo.
- `Confetti`, `Sparkles`, `Bubbles` — celebração e vida de fundo.

Uma regra técnica vale registrar: **todas as posições e atrasos são
constantes**, nunca `Math.random()` no render. Valor sorteado em render quebra
a hidratação do Next, porque servidor e cliente sorteiam diferente. Constantes
bem escolhidas parecem igualmente orgânicas e não têm esse custo.

---

## 5. Movimento

Animações declaradas em `globals.css`: `pop-in`, `wiggle`, `float-slow`,
`shake`, `breathe`, `hop`, `blink`, `sparkle`, `confetti-fall`, `drift`, `rise`.

Duas com intenção específica:

- **`hop`** — pulo com antecipação e amassado (`scaleY` 0.86 → 1.08). É o
  princípio de *squash and stretch* da animação clássica; sem ele o pulo parece
  um elevador.
- **`breathe`** — escala de 3,5% em ciclo lento. Dá vida a mascote parado.

Tudo é desligado sob `prefers-reduced-motion: reduce` — importante para
crianças com sensibilidade vestibular, TEA ou epilepsia fotossensível.

---

## 6. Som

`src/games/sound.ts`

Sintetizado na Web Audio API, **sem nenhum arquivo de áudio**. Três razões: a
CSP bloqueia terceiros, o bundle fica leve e a resposta ao toque é instantânea.

O que faz diferença na percepção:

- **Acordes, não bipes.** `sfx.correct` toca um arpejo maior e fecha em acorde.
  Bipe quadrado seco é o que faz um app soar barato.
- **Envelope suave.** Ataque de 15ms e cauda longa, em vez de liga/desliga —
  soa como madeira ou sino, não como alarme.
- **Micro-atraso entre as vozes do acorde** (12ms), que dá largura, como dedos
  caindo num teclado.
- **O erro nunca pune.** `sfx.wrong` são duas notas graves descendentes e
  suaves. Nada de buzina.

---

## 7. Voz — o que estava robotizado e o que mudou

`src/games/voice.ts`

O problema não era a Web Speech API. Era o **padrão** dela: o navegador entrega
a primeira voz que casa com o idioma, que no Linux costuma ser o eSpeak e no
macOS a variante "compact". Três mudanças alteram a percepção por completo:

### 7.1 Escolha da voz
Em vez de aceitar a primeira, pontuamos todas as vozes disponíveis:

| Critério | Peso |
|---|---|
| `pt-BR` | +100 (outro `pt` vale +40; qualquer outro idioma é eliminado) |
| Nome conhecidamente bom (Francisca, Luciana, Thalita, Google pt-BR…) | +45 |
| Pista de voz neural (`natural`, `neural`, `online`, `wavenet`, `premium`) | +35 |
| Não é serviço local (costuma ser a neural do servidor) | +20 |
| Pista de sintetizador antigo (`espeak`, `festival`, `compact`, `pico`) | **−60** |

As vozes carregam de forma assíncrona no Chrome — na primeira chamada
`getVoices()` volta vazio —, então `initVoice()` também escuta `voiceschanged`.

### 7.2 Prosódia
O tom estava em **1,15**, que é justamente o que produz o efeito de desenho
robotizado. Agora:

- `rate` ≈ **0,97** — quase ritmo de conversa. Abaixo de 0,9 soa arrastado.
- `pitch` ≈ **1,06** — acolhedor sem virar esquilo.
- **Variação minúscula por frase** (±0,035 em rate, ±0,04 em pitch). Este é o
  ponto mais importante: o que mais denuncia uma máquina é repetir algo
  *idêntico*.

### 7.3 Fraseado
O texto é quebrado em orações e falado como enunciados separados, o que produz
a pausa natural entre elas. Num bloco só, a maioria dos sintetizadores atropela
a vírgula.

E as falas de reforço vêm de **repertório**, com sorteio que nunca repete a
última usada:

```
praise()    → "Isso!" · "Muito bem!" · "Boa!" · "Acertou!" · "É isso aí!" · …
encourage() → "Quase!" · "Hum... olha de novo." · "Ainda não. Você consegue!" · …
celebrate() → "Você conseguiu! Que orgulho!" · "Uhuuu! Conseguiu chegar ao fim!" · …
greet(nome) → "Oi, Tetê! O que a gente vai brincar hoje?" · …
```

Ninguém diz "muito bem" oito vezes seguidas. O app também não.

### 7.4 Limite honesto
A qualidade final ainda depende da voz instalada no aparelho. Em Android com
Google TTS, Windows com Edge e iOS/macOS recentes o resultado é bom. Em Linux
com eSpeak como única opção, continua metálico — não há o que fazer pelo
navegador.

**A solução definitiva é locução gravada** por uma pessoa, para as falas fixas
(instruções, reforços, nomes dos jogos), deixando a síntese só para o que é
dinâmico, como o apelido da criança. Está registrado no roadmap.

---

## 8. Acessibilidade

- Alvos de toque de no mínimo **64×64px** (`.tap-target`), acima dos 48dp
  recomendados, com folga entre eles.
- Foco sempre visível, com contorno branco e espesso no modo criança.
- Toda instrução é **falada**, não só escrita — o app é usável por quem não lê.
- Emoji decorativo sempre com `aria-hidden`; o significado vai no
  `aria-label` do controle.
- Cenário e mascotes decorativos não são anunciados por leitor de tela.
- `prefers-reduced-motion` respeitado globalmente.

Pendente: auditoria com leitor de tela real, verificação de contraste WCAG AA
em toda a paleta e modo daltônico (nos jogos de cor, usar forma + cor, nunca
cor sozinha). Está no roadmap.
