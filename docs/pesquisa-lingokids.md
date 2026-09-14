# Estudo do Lingokids — o que aprendemos e o que trouxemos para o Zuzuhop

Levantamento feito em setembro de 2026 a partir das páginas oficiais do
Lingokids, da central de ajuda, das lojas de aplicativos, de resenhas
independentes e da literatura de UX infantil. No fim de cada seção há a
tradução prática: **o que isso virou no Zuzuhop**.

---

## 1. O que o Lingokids é, em números

| Dado | Valor |
|---|---|
| Público-alvo | 2 a 8 anos |
| Alcance | 20+ milhões de famílias/mês |
| Biblioteca | 4.000+ jogos, músicas, vídeos e atividades |
| Objetivos pedagógicos | 650+ |
| Origem | Espanha (Monkimun Inc.), app lançado em 2016 |
| Modelo | Freemium — Basic gratuito, Plus por assinatura |

O posicionamento mudou ao longo do tempo: nasceu como "inglês para crianças"
e hoje se apresenta como **plataforma de entretenimento educativo**, com
marca própria (Playlearning™), personagens autorais e licenciamentos
(Disney, Marvel, Blippi, Pocoyo).

---

## 2. O método: Playlearning™

A tese central é que criança pequena aprende **brincando, repetindo e sendo
curiosa** — não estudando. Três consequências de projeto:

1. **Não existe "tela de lição".** Tudo é jogo. O conteúdo pedagógico está
   embutido na mecânica, não em uma explicação antes do jogo.
2. **Repetição espaçada disfarçada de variedade.** O mesmo objetivo aparece
   em formatos diferentes (memória, arrastar, colorir, cantar).
3. **Currículo declarado.** Cada atividade tem objetivo de aprendizagem
   explícito — é isso que alimenta o relatório para o responsável.

O currículo foi montado por um conselho educacional com gente vinda de
LeapFrog, Hasbro, Disney e Nickelodeon. Cobre:

- Leitura e alfabetização
- Matemática e engenharia
- Ciências e tecnologia (biologia, química, programação, robótica, atividades com a NASA)
- Música e arte
- Aprendizagem socioemocional (empatia, expressão, mindfulness)
- História e geografia

**No Zuzuhop:** o `src/games/catalog.ts` obriga todo jogo a declarar
`learningGoals: string[]`. O relatório de progresso da família é gerado a
partir da união desses objetivos — o responsável vê "memória visual de curto
prazo", "consciência fonológica", e não apenas "jogou 20 minutos". As oito
categorias do Zuzuhop (letras, números, cores, música, lógica, criatividade,
mundo, emoções) são um recorte enxuto do currículo deles.

---

## 3. Estrutura de navegação

Do que se observa no app e nas resenhas:

- **Feed principal** — grade de cards grandes e coloridos, um por atividade.
  Na versão gratuita são **10 jogos por dia**, renovados a cada 24 horas.
- **Worlds to Explore** — coleções temáticas fora do feed diário.
- **Lessons** — trilha completa: avaliação diagnóstica → 8 a 10 unidades de
  vídeos e jogos → unidade de revisão → avaliação somativa. Pensada para ser
  concluída em 1 a 2 semanas, em várias sessões.
- **Theater / Shows** — vídeos e séries próprias (ex.: *Adventures with Baby Bot*).
- **Play Together** — atividades para adulto e criança juntos.
- **Parents Area** — atrás de portão parental.

**No Zuzuhop:** implementamos o **feed principal agrupado por categoria** e a
**área da família**. Lessons, Theater e Play Together estão no roadmap
(`docs/roadmap.md`), nessa ordem de prioridade.

---

## 4. Tipos de jogo catalogados

Mecânicas identificadas: pareamento (matching), memória, quebra-cabeças de
lógica, labirintos, corrida, traçado de letras, colorir, adesivos, bingo,
karaokê/música, vestir personagens, classificação por atributo.

O padrão que se repete em todas: **uma regra só, aprendida em 3 segundos,
sem texto**.

**No Zuzuhop** implementamos nove jogos jogáveis, cobrindo as mecânicas de
maior retorno pedagógico por esforço de produção:

| Jogo | Mecânica | Categoria |
|---|---|---|
| Memória dos Bichos | memória / pareamento | lógica |
| Conta Comigo | contagem e correspondência | números |
| Caça-Letras | consciência fonológica | letras |
| Mundo das Cores | classificação por atributo | cores |
| Piano Maluco | sequência auditiva (tipo Genius) | música |
| Ateliê de Pintura | criação livre em canvas | criatividade |
| Sequência Mágica | reconhecimento de padrões | lógica |
| Labirinto do Foguete | programação em blocos | mundo |
| Como Eu Me Sinto | vocabulário emocional | emoções |

---

## 5. Personagens e universo

Elliot (panda), Billy (inventor), Cowy (vaca artista), Lisa e Baby Bot (robô
construído por Billy e Cowy). O Baby Bot existe desde 2019 e virou série
própria. O universo vende brinquedos, jogos de tabuleiro e livros — a
propriedade intelectual é um ativo tão importante quanto o app.

Observação relevante: os personagens **não são marcados por gênero na
mecânica** — cada um tem um papel (engenheira, artista, explorador), o que é
exatamente o que se recomenda para um público misto.

**No Zuzuhop:** ainda não há personagens autorais — é o maior item pendente
de produto (ver roadmap, item "Mascotes"). Por ora usamos avatares que a
própria criança escolhe entre 12 opções, e **seis cores de tema sem conotação
de gênero**: quem decide a cor do perfil é a criança, não o app.

---

## 6. Área dos pais e controle parental

- Gerenciamento de múltiplos perfis de criança.
- **Limite de tempo de tela por criança**, ajustável por idade e por tipo de
  atividade (teatro, lição, brincar junto). Quando o tempo acaba, o app avisa
  a criança e bloqueia. **Esse recurso é exclusivo do plano pago.**
- **Progress Center**: atividades concluídas, tempo gasto, habilidades em
  desenvolvimento, pontos de dificuldade.
- Portão parental na entrada da área adulta.
- Discurso de marca "safety-first" e "co-play" (brincar acompanhado),
  sustentado por estudos próprios sobre hábitos de tela das famílias.

**No Zuzuhop:** controle parental **não é recurso pago**. Limite de tempo,
relatório de progresso, filtro por categoria e portão parental estão no plano
gratuito. Cobrar por segurança infantil é uma decisão que nos parece errada —
e é um diferencial de posicionamento real contra o concorrente.

Além disso, o limite de tempo é **contado no servidor** (`src/lib/screen-time.ts`).
Mudar o relógio do tablet ou mexer no JavaScript não estende a brincadeira.

---

## 7. Modelo de negócio

| | Basic (grátis) | Plus (assinatura) |
|---|---|---|
| Custo | zero, sem cartão | mensal ou anual (anual ~60% mais barato) |
| Conteúdo | 10 jogos/dia no feed, rotativos a cada 24h | catálogo completo |
| Offline | não | sim |
| Controle de tempo de tela | não | sim |
| Teste | — | 7 dias grátis |

O gatilho de conversão é a **escassez diária** ("acabaram os jogos de hoje"),
não anúncio. O app não exibe publicidade para crianças — o que é tanto uma
escolha ética quanto uma exigência regulatória de fato para o público 0-13.

**No Zuzuhop:** o mecanismo de plano (`free` / `plus`) está implementado e o
painel administrativo já marca jogos como exclusivos do Plus. A régua exata
(quantos jogos no grátis, preço) é decisão de negócio ainda em aberto — hoje
dois dos nove jogos estão marcados como Plus, apenas para exercitar o
mecanismo. **Não implementamos a escassez diária**: ela é um *temporal dark
pattern* documentado na literatura ("play by appointment") e preferimos
converter por valor (catálogo, offline, relatórios avançados).

---

## 8. UX para 2 a 8 anos — o que a literatura exige

Regras que valem para qualquer app desse público e que viraram restrição de
projeto no Zuzuhop:

| Princípio | Implementação no Zuzuhop |
|---|---|
| Alvos de toque ≥ 48dp, idealmente 64px, com folga entre eles | classe `.tap-target` (mín. 64×64px) em todo botão infantil |
| Criança de 3 a 7 anos não lê: instrução por áudio e imagem | `speak()` narra a instrução ao abrir cada jogo; botão 🔊 repete |
| Feedback imediato a cada toque — som, tremida, pop | `sfx.tap/pop/correct/wrong/win` via Web Audio, sem arquivo externo |
| Sem texto na navegação | grade de emojis grandes; o título é reforço, não requisito |
| Erro não pode punir | som grave curto + "tente de novo", nunca perda de progresso |
| Zero saída acidental | `.kid-mode` desliga seleção, zoom e arrastar; sem links externos |
| Movimento acessível | `prefers-reduced-motion` respeitado no CSS global |

---

## 9. Gamificação — o que copiar e o que evitar

A pesquisa sobre recompensas em apps infantis é menos animadora do que o
marketing sugere. Meta-análises mostram ganho em motivação intrínseca,
autonomia e pertencimento, mas impacto **mínimo em competência**. E há um
efeito bem documentado: quando se introduz recompensa externa em uma tarefa
que a criança já gostava de fazer, a motivação intrínseca **cai**.

A distinção que importa:

- Recompensa **controladora** ("faça isso para ganhar aquilo") → corrói.
- Recompensa **informacional** ("esta estrela significa que você dominou
  isto") → sustenta.

Dark patterns a evitar explicitamente, porque são comuns no setor:

- *Play by appointment* — só liberar conteúdo em horário definido pelo app.
- Streaks que punem a falta (culpa como motor de retenção).
- Moeda virtual e loot boxes para criança.
- Botão de compra acessível dentro do modo criança.

**No Zuzuhop:** estrelas são **informacionais** (3 = sem erros, e nada se
perde com 1). Não há streak, não há moeda, não há loja no modo criança e o
Ateliê de Pintura é deliberadamente **sem pontuação** — atividade aberta,
onde não existe errar.

---

## 10. Conformidade — COPPA (EUA) e LGPD (Brasil)

### COPPA, com as mudanças em vigor desde abril de 2026
- Consentimento verificável dos pais antes de coletar dado pessoal de menor de 13.
- Categoria "mixed audience": mesmo sem ser primariamente infantil, coletar
  dado de criança exige consentimento.
- A FTC (política de fevereiro/2026) permite verificação técnica de idade sem
  consentimento prévio, desde que o dado de verificação seja usado só para
  isso, apagado logo, com aviso claro e segurança razoável.
- Fluxo de consentimento difícil ou confuso é risco regulatório — a FTC mira
  design enganoso.

### LGPD (Lei 13.709/2018)
- Art. 14, §1º: dados de criança (até 12 anos incompletos) exigem
  **consentimento específico e em destaque** de pelo menos um dos pais ou
  responsável legal.
- Exige **esforço razoável de verificação** de que quem consentiu é mesmo o
  responsável.
- Tratamento sempre no **melhor interesse da criança**.
- A ANPD cobra transparência em linguagem compreensível e vigia *dark
  patterns* que induzam a criança a fornecer dado em excesso.
- Adolescente: a lei não exige consentimento parental explícito, mas a
  orientação da ANPD é cuidado equivalente em tratamentos de maior risco.

**No Zuzuhop** (detalhe completo em `docs/seguranca.md`):
- A conta é **sempre do adulto**. A criança não faz login, não tem e-mail,
  não tem senha.
- Do perfil infantil guardamos **apelido, ano de nascimento, avatar e
  progresso**. Nada de nome completo, foto, geolocalização, contatos ou
  microfone. O campo de apelido rejeita e-mail e telefone por validação.
- Duas caixas separadas no cadastro: declaração de ser responsável legal +
  aceite de termos/privacidade. Registramos **data, IP e versão** do
  consentimento.
- Direitos do titular sem precisar abrir chamado: exportar tudo em JSON,
  excluir um perfil, excluir a conta inteira com cascata.

---

## 11. Onde dá para ser melhor que o Lingokids

Cinco lacunas identificadas que viraram decisão de produto:

1. **Controle parental cobrado.** No Lingokids, limite de tempo de tela é
   recurso Plus. No Zuzuhop é gratuito.
2. **App só em inglês.** Para o Brasil, uma experiência nativa em português,
   com narração pt-BR e vocabulário local, é vantagem imediata.
3. **Escassez diária como gatilho.** Trocamos por conversão baseada em valor.
4. **Currículo amplo, mas raso em socioemocional.** Nosso "Como Eu Me Sinto"
   já entra com situação → emoção → estratégia de regulação ("respiro fundo
   três vezes"), que é o que a literatura recomenda e o concorrente trata de
   forma mais superficial.
5. **Transparência de dados.** Botão de exportar tudo em JSON e exclusão
   imediata, na própria interface — raro no setor.

---

## Fontes

- [Playlearning™ Curriculum — Lingokids](https://lingokids.com/playlearning-curriculum)
- [Lingokids: Games & Shows — App Store](https://apps.apple.com/us/app/lingokids-games-shows/id1002043426)
- [Lingokids: Games & Shows — Google Play](https://play.google.com/store/apps/details?id=es.monkimun.lingokids&hl=en_US)
- [Lingokids Basic vs. Plus — Central de ajuda](https://help.lingokids.com/hc/en-us/articles/9522274605585-Lingokids-Basic-vs-Plus)
- [Lingokids Basic (Free Version) — Central de ajuda](https://help.lingokids.com/hc/en-us/articles/115005840745-Lingokids-Basic-Free-Version)
- [How to Set Screen Time Limits in Lingokids — Central de ajuda](https://help.lingokids.com/hc/en-us/articles/360017671017-How-to-Set-Screen-Time-Limits-in-Lingokids)
- [What is the Parents Area? — Central de ajuda](https://help.lingokids.com/hc/en-us/articles/115005129325-What-is-the-Parents-Area)
- [Lingokids Universe (personagens)](https://lingokids.com/lingokids-universe)
- [Lingokids Announces 'Adventures with Baby Bot' — Animation Magazine](https://www.animationmagazine.net/2023/09/lingokids-announces-first-long-form-series-adventures-with-baby-bot/)
- [Lingokids — Common Sense Media](https://www.commonsensemedia.org/app-reviews/lingokids-play-and-learn)
- [What is Lingokids? — Internet Matters](https://www.internetmatters.org/advice/apps-and-platforms/skills-building/lingokids/)
- [Lingokids Strengthens Safety-First, Co-Play Strategy — TipRanks](https://www.tipranks.com/news/private-companies/lingokids-strengthens-safety-first-co-play-strategy-with-new-parental-screen-time-study)
- [Children's UX: Usability Issues in Designing for Young People — Nielsen Norman Group](https://www.nngroup.com/articles/childrens-websites-usability-issues/)
- [UI/UX Design for Children: Age-Appropriate App Guidelines — Aufait UX](https://www.aufaitux.com/blog/ui-ux-designing-for-children/)
- [UX Design for Kids: Principles and Recommendations — Ramotion](https://www.ramotion.com/blog/ux-design-for-kids/)
- [Gamification enhances student intrinsic motivation… (meta-análise) — Springer](https://link.springer.com/article/10.1007/s11423-023-10337-7)
- [Mind the Dark: Deceptive Design Awareness for Children — arXiv](https://arxiv.org/pdf/2506.23017)
- [Gamification Gone Wrong: When Streaks and Badges Become the Point — NerdSip](https://nerdsip.com/blog/gamification-gone-wrong-when-streaks-become-the-point)
- [COPPA Rule Update 2026: What Changed + Compliance Checklist — PrivacyLawMap](https://privacylawmap.com/blog/coppa-rule-amendments-april-2026-compliance-checklist)
- [FTC Issues COPPA Policy Statement on Age-Verification — Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/ftc-issues-coppa-policy-statement-encouraging-adoption-of-age-verification-technologies)
- [Child Safety in App Development: COPPA, Age Verification, Parental Controls in 2026 — Chop Dawg](https://www.chopdawg.com/child-safety-in-app-development-coppa-compliance-age-verification-and-parental-controls-in-2026/)
- [Guia Orientativo: Tratamento de Dados Pessoais de Crianças e Adolescentes — ANPD (PDF)](https://www.mpce.mp.br/wp-content/uploads/2023/10/Guia-orientativo-de-tratamento-de-dados-pessoais-de-criancas-e-adolescentes.pdf)
- [Dados de Crianças e Adolescentes na LGPD: Regras Especiais — Confidata](https://confidata.com.br/blog/dados-criancas-adolescentes-lgpd)
