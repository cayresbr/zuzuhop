# O que sugiro implantar a seguir

Lista priorizada, saída do estudo do Lingokids cruzado com o que já está
pronto no Zuzuhop. Cada item tem o porquê e o tamanho aproximado.

Legenda de esforço: **P** (dias), **M** (1–3 semanas), **G** (1–2 meses).

---

## Fase 1 — Fechar o básico antes de mostrar para alguém

### 1.1 Verificação de e-mail e recuperação de senha — **P**
O modelo `VerificationToken` já existe no banco; faltam o envio e as telas.
Sem recuperação de senha, um responsável que esquece a senha perde o acesso
aos perfis das crianças. É o item mais urgente da lista.

### 1.2 PostgreSQL + migrations versionadas — **P**
Hoje roda em SQLite com `db push`. Trocar antes de haver dado real é barato;
depois, não.

### 1.3 PWA instalável e funcionamento offline — **M**
Tablet de criança costuma viver em Wi-Fi ruim e viagem de carro. Service
worker com cache dos jogos já jogados, manifest, ícone, splash. Os jogos já
são autossuficientes (sem assets externos), então o custo é baixo e o ganho
percebido é alto. No Lingokids, offline é recurso pago — aqui pode ser o
argumento de conversão mais honesto.

### 1.4 Onboarding da primeira criança — **P**
Hoje, quem cria a conta cai numa tela vazia. Um fluxo de 3 passos (apelido →
avatar → tempo de tela) com a criança junto, escolhendo o próprio avatar, é o
momento de encantamento que define a retenção.

---

## Fase 2 — Conteúdo, que é o produto

### 2.1 Mascotes próprios — **G**
É a maior lacuna em relação ao concorrente. Baby Bot, Cowy e Elliot são o
ativo mais valioso do Lingokids: viram série, brinquedo e reconhecimento
imediato. Sugestão para o Zuzuhop:

- **Zuzu**, uma coelha exploradora (a marca já é "Zuzuhop").
- **Hop**, um robozinho saltitante construído por ela.
- Mais dois amigos com papéis (não com gênero): quem inventa, quem cuida.

Regra que o concorrente segue e funciona: personagem tem **papel**
(engenheira, artista, exploradora), nunca estereótipo de gênero. É assim que
se atrai meninos e meninas com o mesmo conteúdo.

Entregas: guia de estilo, ilustrações em SVG animável, presença como guia
dentro de cada jogo (é o mascote que narra, não uma voz sem rosto).

### 2.2 Mais 15–20 jogos — **G**
Nove jogos seguram uma semana, não um mês. Sugestões por categoria, todas com
mecânica de uma regra só:

| Categoria | Jogos sugeridos |
|---|---|
| Letras | traçado de letra com o dedo; formar palavra com sílabas; caça-palavras ilustrado |
| Números | mais/menos; somar com objetos; relógio; formas geométricas |
| Lógica | quebra-cabeça deslizante; qual não pertence; labirinto livre; jogo da velha |
| Música | karaokê com letra destacada; bateria; ditado rítmico |
| Criatividade | vestir personagem; livro de colorir com contorno; fotógrafo de cenas |
| Mundo | de onde vem a comida; separar o lixo; corpo humano; sistema solar |
| Emoções | respiração guiada; "e se fosse com você?"; roda das emoções |

Prioridade: **traçado de letras** (alta demanda de responsável),
**respiração guiada** (diferencia de verdade) e **karaokê** (retenção).

### 2.3 Trilhas (equivalente a "Lessons") — **G**
Sequência de 8 a 10 unidades com diagnóstico no começo e revisão no fim,
feita ao longo de 1 a 2 semanas. É o que transforma "meu filho brinca" em
"meu filho está aprendendo X" — e é o que sustenta preço.

### 2.4 Músicas e vídeos curtos — **M**
Descanso entre jogos e alívio de carga cognitiva. Cuidado: vídeo é consumo
passivo. Sugiro limitar a proporção por sessão e deixar isso visível para o
responsável no relatório.

---

## Fase 3 — Valor para quem paga

### 3.1 Relatório semanal por e-mail — **P**
"Esta semana a Tetê brincou 82 minutos, praticou consciência fonológica e
avançou em contagem até 10." Custo baixíssimo, é o que faz o responsável
lembrar que o app existe e perceber valor. O dado já está no banco.

### 3.2 Modo "brincar junto" (co-play) — **M**
Atividades desenhadas para adulto e criança no mesmo dispositivo. O
concorrente usa isso como pilar de marca ("safety-first, co-play") e há
pesquisa sustentando que tela acompanhada tem efeito diferente de tela
sozinha. Exemplos: quem desenha e quem adivinha; leitura em voz alta com a
criança apontando; caça ao tesouro pela casa.

### 3.3 Adaptação de dificuldade — **M**
Hoje as fases são fixas. Ajustar a dificuldade pelo desempenho recente (mais
dicas quando erra, menos quando acerta) mantém a criança na zona de
desenvolvimento proximal e reduz abandono. Os dados de `GameProgress` já
permitem começar simples.

### 3.4 Adesivos e álbum — **P**
Recompensa **informacional**, não controladora: o adesivo diz "você dominou
as cores", não "volte amanhã ou perde". O modelo `Reward` já existe no banco,
faltam a lógica de desbloqueio e a tela do álbum. **Não implementar streak**
— ver a seção de anti-padrões abaixo.

### 3.5 Assinatura de verdade — **M**
Integração com Stripe (web) e com as lojas (iOS/Android). Regra inegociável:
**nenhum caminho de compra dentro do modo criança**; upsell só na área da
família, atrás do portão parental.

---

## Fase 4 — Alcance

### 4.1 Aplicativos nas lojas — **M**
Empacotar com Capacitor. Ganho real: instalação, ícone na tela inicial,
notificação para o responsável e a visibilidade da App Store/Play Store. Vale
avaliar o programa "Made for Kids" do Google Play e a categoria Kids da Apple
— ambos impõem exigências que o Zuzuhop já cumpre (sem anúncio, sem link
externo, sem compra acessível à criança).

### 4.2 Multilíngue — **M**
Português primeiro (é a vantagem local), depois inglês e espanhol. O inglês
abre também a possibilidade de posicionar o app como "aprender inglês
brincando", que é de onde o concorrente veio.

### 4.3 Acessibilidade auditada — **M**
Já existe base: foco visível, `prefers-reduced-motion`, rótulos ARIA,
narração. Falta auditoria com leitor de tela, contraste WCAG AA verificado em
toda paleta, modo daltônico (nos jogos de cor, forma + cor, nunca cor
sozinha) e opção de desligar tempo/pressa.

### 4.4 Modo escola / múltiplas crianças — **G**
Uma conta de educador com turmas e relatórios agregados abre o canal B2B,
que é receita recorrente maior e menos sazonal que o B2C.

---

## Segurança e conformidade — contínuo

Detalhe completo em `docs/seguranca.md`, seção 13. Em resumo:

1. Rate limit em Redis (hoje é em memória, só funciona com uma instância).
2. Retenção automática: expurgar `LoginAttempt` e `AuditLog` após 6 meses.
3. CSP sem `'unsafe-inline'`/`'unsafe-eval'`, com nonce.
4. Verificação reforçada do responsável, se o mercado dos EUA entrar no plano
   (a COPPA exige método verificável; a LGPD aceita o "esforço razoável" que
   já fazemos).
5. Pentest externo antes do lançamento público.
6. Códigos de recuperação para o 2FA administrativo (o gerador já existe em
   `src/lib/totp.ts`, falta persistir e usar).

---

## Anti-padrões — o que decidimos não fazer

Isto aqui é tão importante quanto a lista de features. São práticas comuns no
setor que rejeitamos por escrito, para que ninguém as reintroduza sem
discussão:

| Prática | Por quê não |
|---|---|
| **Escassez diária** ("acabaram seus 10 jogos de hoje") | É *temporal dark pattern* documentado ("play by appointment"). Convertemos por valor: catálogo, offline, trilhas, relatórios. |
| **Streak com punição** | Retenção movida a culpa. Em criança pequena, transfere ansiedade para o responsável. |
| **Moeda virtual, loot box, gacha** | Mecânica de azar para quem não tem noção de valor. |
| **Cobrar pelo controle parental** | Segurança infantil não é upsell. O limite de tempo é gratuito aqui — e isso é diferencial competitivo. |
| **Anúncio de qualquer tipo no modo criança** | Inegociável. |
| **Botão de compra alcançável pela criança** | Todo upsell fica atrás do portão parental. |
| **Pedir dado que não usamos** | Nada de nome completo, foto, geolocalização, contatos ou texto livre da criança. |
| **Notificação push para a criança** | Notificação vai para o responsável, nunca para quem está brincando. |

---

## Sugestão de sequência

Se for para escolher só cinco coisas para os próximos dois meses:

1. Recuperação de senha e verificação de e-mail (1.1) — risco real hoje.
2. PWA offline (1.3) — diferencial imediato, custo baixo.
3. Mais 8 jogos (2.2), começando por traçado de letras e karaokê.
4. Relatório semanal por e-mail (3.1) — maior retorno por linha de código.
5. Mascotes (2.1) — começar agora porque é o item mais demorado e tudo mais
   depende dele visualmente.
