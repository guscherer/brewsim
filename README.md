# 🍺 BrewLife — Simulador de Vida de Cervejeiro

Um simulador completo e interativo de gestão de cervejaria artesanal, combinando crafting profundo, gestão empresarial e narrativa pessoal.

## 🎮 Funcionalidades Implementadas

### 🏠 Página Inicial
- Hero section com animação de copo de cerveja
- Visão geral das 6 fases do jogo
- Grid de mecânicas principais
- Design responsivo e moderno

### 👤 Criação de Personagem
- **4 Backgrounds únicos** com bônus diferentes:
  - Mestre Cervejeiro (Precisão +20%)
  - Herdeiro de Receita (Receita secreta inicial)
  - Ex-Engenheiro (Automação +30%)
  - Homebrewer (Criatividade +25%)
- **4 Personalidades** que afetam o gameplay
- **3 Pontos comerciais** com custos e prós/contras
- Sistema de decisão que afeta o início do jogo

### 📊 Painel de Controle (Dashboard)
- **Estatísticas em tempo real**: Caixa, Reputação, Receitas, Nível
- **Barras de progresso** visuais para todos os stats
- **Sistema de estações** (Primavera, Verão, Outono, Inverno) com impacto nas vendas
- **Mercado de insumos** com preços flutuantes
- **Atividades diárias** divididas em manhã, tarde e noite
- **Botão de avançar dia** com eventos aleatórios
- **Sistema de conquistas** com 8 achievements desbloqueáveis

### 🍺 Sistema de Brassagem (Mini-Game Completo)
- **Seleção de ingredientes**:
  - 6 tipos de malte (Pilsen, Munich, Vienna, Crystal, Chocolate, Roasted)
  - 5 tipos de lúpulo (Cascade, Citra, Saaz, Hallertau, Mosaic)
  - 4 tipos de levedura (American Ale, Lager, Belgian, Wild)
  - 5 adjuntos especiais (Café, Cacau, Baunilha, Maracujá, Laranja)
- **8 estilos de cerveja** pré-definidos
- **Mini-game de controle de temperatura** com 5 etapas:
  1. Mostura (65°C)
  2. Mash Out (76°C)
  3. Fervura (100°C)
  4. Whirlpool (80°C)
  5. Resfriamento (20°C)
- **Sistema de pontuação** baseado em precisão
- **Geração automática de receitas** com ABV, IBU e SRM
- **Visualização de cores** baseada no SRM

### 🍻 Taproom Interativo
- **Mini-game de atendimento** com clientes aleatórios
- **Sistema de satisfação** dos clientes
- **Gorjetas** baseadas na qualidade e reputação
- **Mini-game de limpeza** de tanques:
  - 8 pontos de sujeira para limpar
  - Impacto direto na higiene e reputação
  - Feedback visual em tempo real
- **Feedback dos clientes** com avaliações
- **Estatísticas do dia** (gorjetas, clientes, avaliação)

### 📖 Diário de Receitas
- **Galeria visual** de todas as cervejas criadas
- **Detalhes completos**: qualidade, ABV, IBU, SRM
- **Lista de ingredientes** utilizados
- **Indicador visual de cor** baseado no SRM
- **Histórico de lotes** com data de criação

### 👅 Sistema de Degustação
- **Mini-game de identificação de sabores**
- **12 notas de degustação** para identificar
- **Guia completo** de degustação (Visual, Aroma, Sabor, Sensação)
- **Sistema de pontuação** baseado na precisão
- **Seleção de cervejas** do próprio acervo

### 🏭 Sistema de Expansão
- **6 níveis de crescimento**:
  1. Micro-cervejaria (Garagem)
  2. Cervejaria com Taproom
  3. Distribuição Local
  4. Distribuição Regional
  5. Cervejaria Industrial
  6. Franquia / Exportação
- **Sistema de custos** progressivos
- **Capacidade de produção** em litros/mês
- **Decisões estratégicas**:
  - Automatização vs. Artesanal
  - Expansão de linha de produtos
  - Fornecedores locais vs. importados
  - Colaborações com outras cervejarias

### 🎭 Eventos & Conflitos
- **6 tipos de eventos dinâmicos**:
  - 🏆 Concursos de cerveja
  - ⚠️ Contaminação de lotes
  - 💰 Propostas de aquisição
  - 📱 Tendências de mercado
  - 🤝 Colaborações
  - 🏗️ Fiscalizações
- **Sistema de escolhas** com consequências
- **Histórico de decisões**
- **8 conquistas desbloqueáveis**:
  - Primeiro Lote
  - Mestre da Brassagem
  - Colecionador de Receitas
  - Império Cervejeiro
  - Estrela das Redes
  - Sobrevivente
  - Inovador
  - Expansão Total

## 🎯 Mecânicas de Jogo

### Sistema de Qualidade
- Notas de 0-100 baseadas em:
  - Precisão de temperatura
  - Qualidade dos ingredientes
  - Higiene do equipamento
  - Timing de adições

### Economia Dinâmica
- Preços de insumos flutuam
- Estações afetam consumo
- Reputação impacta vendas
- Gorjetas baseadas em satisfação

### Progressão
- Árvore de crescimento com 6 níveis
- Desbloqueio de novas mecânicas
- Expansão de capacidade produtiva
- Sistema de conquistas

### Narrativa
- Eventos aleatórios com escolhas
- Consequências das decisões
- Histórico de ações
- Relacionamentos com NPCs

## 🎨 Design & UX

- **Interface moderna** com glassmorphism
- **Animações suaves** e transições
- **Responsivo** para mobile e desktop
- **Tema escuro** com paleta amber/orange
- **Feedback visual** em todas as ações
- **Navegação por tabs** intuitiva

## 🚀 Tecnologias

- React 18 com TypeScript
- Tailwind CSS para estilização
- Vite para build otimizado
- Componentes modulares e reutilizáveis

## 🎮 Como Jogar

1. **Crie seu personagem** escolhendo background, personalidade e localização
2. **Brasse sua primeira cerveja** no mini-game de temperatura
3. **Atenda clientes** no taproom e ganhe gorjetas
4. **Mantenha a limpeza** para evitar contaminações
5. **Expanda sua cervejaria** investindo em novos níveis
6. **Enfrente eventos** e tome decisões estratégicas
7. **Desbloqueie conquistas** e construa seu legado

## 📈 Estatísticas do Projeto

- **8 abas interativas** de gameplay
- **6 fases** de progressão
- **20+ ingredientes** selecionáveis
- **8 estilos** de cerveja
- **6 eventos** dinâmicos
- **8 conquistas** desbloqueáveis
- **3 mini-games** completos
- **100% responsivo**

## 🍻 BrewLife — Do sonho à realidade cervejeira!

---

**Conceito original baseado no design document fornecido, transformado em experiência interativa completa.**
