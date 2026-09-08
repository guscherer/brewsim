import { useState, useEffect, useRef } from 'react';

// ==================== COMPONENTS ====================

function BeerBubbles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-400/20 animate-bubble"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${8 + Math.random() * 16}px`,
            height: `${8 + Math.random() * 16}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#inicio', label: 'Início' },
    { href: '#fases', label: 'Fases' },
    { href: '#crafting', label: 'Crafting' },
    { href: '#gameplay', label: 'Gameplay' },
    { href: '#diferenciais', label: 'Diferenciais' },
    { href: '#referencias', label: 'Inspirações' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card shadow-lg shadow-amber-900/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#inicio" className="flex items-center gap-2">
            <span className="text-3xl">🍺</span>
            <span className="text-xl font-bold gradient-text">BrewLife</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <a key={link.href} href={link.href} className="text-amber-100/80 hover:text-amber-400 transition-colors text-sm font-medium">
                {link.label}
              </a>
            ))}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-amber-400 text-2xl">
            ☰
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden glass-card border-t border-amber-900/30">
          {links.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-amber-100/80 hover:text-amber-400 hover:bg-amber-900/20 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/50 via-[#1a0f00] to-[#1a0f00]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #d9a406 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      <BeerBubbles />
      
      {/* Floating beer elements */}
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-40">🌾</div>
      <div className="absolute top-40 right-20 text-5xl animate-float-delay opacity-40">🍺</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-float-delay-2 opacity-40">⚗️</div>
      <div className="absolute bottom-20 right-10 text-5xl animate-float opacity-40">🏭</div>
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="text-8xl md:text-9xl mb-6 animate-float">🍺</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4">
            <span className="gradient-text">BrewLife</span>
          </h1>
          <p className="text-xl md:text-2xl text-amber-200/90 font-light mb-2">
            Simulador de Vida de Cervejeiro
          </p>
          <p className="text-base md:text-lg text-amber-100/60 max-w-2xl mx-auto mb-10">
            Gestão, crafting e narrativa pessoal. Viva a experiência completa de criar, 
            administrar e expandir sua própria cervejaria dos sonhos.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-300">
          <a href="#fases" className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold rounded-full transition-all duration-300 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 hover:scale-105">
            Explorar o Jogo
          </a>
          <a href="#crafting" className="px-8 py-4 border-2 border-amber-600/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-bold rounded-full transition-all duration-300 hover:scale-105">
            Ver Mecânicas
          </a>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-500">
          {[
            { icon: '🎬', label: '6 Fases' },
            { icon: '🔬', label: 'Crafting Real' },
            { icon: '📈', label: 'Gestão Completa' },
            { icon: '🎭', label: 'Narrativa Viva' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-4 hover:border-amber-500/50 transition-all">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm text-amber-200/80">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-amber-500/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-pour" />
        </div>
      </div>
    </section>
  );
}

function PhaseCard({ phase, title, icon, description, details, color }: {
  phase: string;
  title: string;
  icon: string;
  description: string;
  details: string[];
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glass-card rounded-2xl p-6 md:p-8 transition-all duration-700 hover:border-amber-500/40 cursor-pointer ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div className={`text-4xl md:text-5xl ${color}`}>{icon}</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">{phase}</div>
          <h3 className="text-xl md:text-2xl font-bold text-amber-100 mb-2">{title}</h3>
          <p className="text-amber-200/70 text-sm md:text-base">{description}</p>
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[600px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-amber-900/30 pt-4">
          <ul className="space-y-2">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-200/80">
                <span className="text-amber-500 mt-0.5">▸</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-amber-500/60 text-right">
        {expanded ? '▲ Clique para recolher' : '▼ Clique para expandir'}
      </div>
    </div>
  );
}

function PhasesSection() {
  const phases = [
    {
      phase: 'FASE 1',
      title: 'Criação do Personagem e Abertura',
      icon: '🎬',
      description: 'Escolha seu background, monte sua cervejaria e enfrente os primeiros desafios burocráticos.',
      color: 'text-amber-400',
      details: [
        'Escolha de background: mestre cervejeiro, herdeiro de receita familiar, ex-engenheiro ou homebrewer apaixonado',
        'Cada background dá bônus únicos — herdeiro começa com receita rara, engenheiro com bônus em automação',
        'Escolha do ponto comercial: galpão industrial (barato, precisa reforma), loja no centro (caro, com fluxo) ou zona rural (barato, logística difícil)',
        'Decisão financeira: empréstimo bancário vs. economias — define a pressão inicial',
        'Compra de equipamentos: panelas de brassagem, fermentadores, barris, sistema de resfriamento',
        'Mini-game burocrático: obter licenças e alvarás — ensina mecânicas legais',
        'Contratar primeiros funcionários ou operar sozinho no início'
      ]
    },
    {
      phase: 'FASE 2',
      title: 'Brassagem e Receitas',
      icon: '🔬',
      description: 'O coração do jogo — crafting profundo de cerveja com mecânicas realistas.',
      color: 'text-yellow-400',
      details: [
        'Seleção de malte: Pilsen, Munich, Vienna, Crystal, Chocolate — cada um afeta cor, corpo e dulçor',
        'Lúpulo com timing de adição: amargor vs. aroma — Cascade, Citra, Saaz, Hallertau...',
        'Levedura: Ale vs. Lager vs. selvagem — temperatura de fermentação é crucial',
        'Adjuntos especiais: frutas, café, especiarias, madeiras — desbloqueia receitas únicas',
        'Mini-game de brassagem: controle de temperatura em faixas específicas de mostura',
        'Fermentação em tempo real acelerado — risco de contaminação se não cuidar da higiene',
        'Sistema de qualidade: lotes recebem notas 0-100 baseadas em precisão e ingredientes',
        'Diário de receitas: documente e itere como um cervejeiro real'
      ]
    },
    {
      phase: 'FASE 3',
      title: 'Operação no Dia a Dia',
      icon: '📋',
      description: 'Game loop completo com rotina diária dividida em manhãs, tardes e noites.',
      color: 'text-orange-400',
      details: [
        '🌅 Manhã: verificar fermentadores, planejar produção, lidar com entregas de matéria-prima',
        'Imprevistos matinais: equipamento quebrado, funcionário faltou, fornecedor atrasou',
        '☀️ Tarde: atender no taproom, reuniões com distribuidores, marketing e redes sociais',
        'Manutenção e limpeza — sim, limpar tanque é gameplay!',
        '🌙 Noite: eventos sociais, festivais, concursos, happy hour com a equipe',
        'Vida pessoal: família, amigos, saúde mental do personagem',
        'Planejamento financeiro noturno: fluxo de caixa, impostos, folha de pagamento'
      ]
    },
    {
      phase: 'FASE 4',
      title: 'Progressão e Expansão',
      icon: '📈',
      description: 'Árvore de crescimento da micro-cervejaria até grupo cervejeiro internacional.',
      color: 'text-green-400',
      details: [
        'Micro-cervejaria (garagem) → Cervejaria com taproom → Distribuição local',
        'Distribuição regional → Cervejaria industrial / exportação → Franquia / grupo cervejeiro',
        'Decisão estratégica: automatização (caro, escala) vs. artesanal (margem menor, prestígio)',
        'Expandir linha: kombucha, destilados, cerveja sem álcool',
        'Comprar lúpulo local ou importar — impacto na qualidade e custo',
        'Criar cervejas sazonais e colaborativas com outras cervejarias'
      ]
    },
    {
      phase: 'FASE 5',
      title: 'Eventos, Conflitos e Narrativa',
      icon: '🎭',
      description: 'Eventos dinâmicos que desafiam sua cervejaria e testam suas decisões.',
      color: 'text-purple-400',
      details: [
        '🏆 Concursos: World Beer Cup, festivais locais — submeta suas receitas',
        '📰 Crise de reputação: lote contaminado viralizou nas redes sociais',
        '🏗️ Fiscalização: inspeção sanitária surpresa',
        '💰 Proposta de aquisição: grande cervejaria quer te comprar',
        '🌾 Safra ruim: preço do lúpulo disparou no mercado',
        '🤝 Colaboração: cervejaria rival propõe receita conjunta',
        '📱 Tendências de mercado: IPA com lactose, sour com frutas tropicais...',
        'Sistema de reputação tripartido: comunidade local, imprensa especializada, redes sociais'
      ]
    },
    {
      phase: 'FASE 6',
      title: 'Personagens e Relacionamentos',
      icon: '👥',
      description: 'NPCs com arcos próprios, vida pessoal e sistema de legado.',
      color: 'text-pink-400',
      details: [
        'Equipe: cervejeiro assistente, técnico de manutenção, vendedor, bartender',
        'Cada NPC tem personalidade, habilidades e arcos narrativos próprios',
        'Funcionário insatisfeito pode sabotar um lote ou pedir demissão em época crítica',
        'Relacionamento amoroso que afeta decisões e moral do personagem',
        'Amigos e família que questionam suas escolhas empreendedoras',
        'Saúde do personagem: burnout, estresse, equilíbrio vida-trabalho',
        'Sistema de legado: o que você quer que sua cervejaria represente?'
      ]
    }
  ];

  return (
    <section id="fases" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">As 6 Fases do Jogo</h2>
          <p className="text-amber-200/70 max-w-2xl mx-auto">
            De uma garagem abandonada a um império cervejeiro. Cada fase traz novos desafios, 
            mecânicas e decisões que moldam sua jornada.
          </p>
        </div>
        
        <div className="grid gap-6">
          {phases.map((phase, i) => (
            <PhaseCard key={i} {...phase} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftingSection() {
  const ingredients = [
    { name: 'Malte', icon: '🌾', types: ['Pilsen', 'Munich', 'Vienna', 'Crystal', 'Chocolate'], effect: 'Cor, corpo e dulçor' },
    { name: 'Lúpulo', icon: '🌿', types: ['Cascade', 'Citra', 'Saaz', 'Hallertau', 'Mosaic'], effect: 'Amargor e aroma' },
    { name: 'Levedura', icon: '🧫', types: ['Ale', 'Lager', 'Selvagem', 'Belga', 'Kveik'], effect: 'Fermentação e perfil' },
    { name: 'Adjuntos', icon: '🍊', types: ['Frutas', 'Café', 'Especiarias', 'Madeiras', 'Mel'], effect: 'Receitas especiais' },
  ];

  const [selectedIngredient, setSelectedIngredient] = useState(0);

  return (
    <section id="crafting" className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">Sistema de Crafting</h2>
          <p className="text-amber-200/70 max-w-2xl mx-auto">
            Crie cervejas únicas combinando ingredientes, controlando temperaturas e dominando 
            cada etapa do processo cervejeiro.
          </p>
        </div>

        {/* Ingredient selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {ingredients.map((ing, i) => (
            <button
              key={i}
              onClick={() => setSelectedIngredient(i)}
              className={`glass-card rounded-xl p-4 md:p-6 text-center transition-all duration-300 ${
                selectedIngredient === i 
                  ? 'border-amber-400 shadow-lg shadow-amber-600/20 scale-105' 
                  : 'hover:border-amber-600/50'
              }`}
            >
              <div className="text-3xl md:text-4xl mb-2">{ing.icon}</div>
              <div className="font-bold text-amber-100">{ing.name}</div>
              <div className="text-xs text-amber-400/70 mt-1">{ing.effect}</div>
            </button>
          ))}
        </div>

        {/* Selected ingredient detail */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{ingredients[selectedIngredient].icon}</span>
            <h3 className="text-2xl font-bold text-amber-100">{ingredients[selectedIngredient].name}</h3>
          </div>
          <p className="text-amber-200/70 mb-4">
            Efeito principal: <span className="text-amber-400 font-medium">{ingredients[selectedIngredient].effect}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {ingredients[selectedIngredient].types.map((type, i) => (
              <span key={i} className="px-4 py-2 bg-amber-900/30 border border-amber-700/30 rounded-full text-sm text-amber-200">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Brewing process */}
        <h3 className="text-2xl font-bold text-amber-100 text-center mb-8">Processo de Brassagem</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Brassagem', desc: 'Mini-game de controle de temperatura. Mostura em faixas específicas para extrair açúcares do malte.', icon: '🌡️' },
            { step: '02', title: 'Fermentação', desc: 'Tempo real acelerado. Monitore temperatura e densidade. Risco de contaminação se não cuidar da higiene.', icon: '⏳' },
            { step: '03', title: 'Maturação', desc: 'Garrafa, barril ou lata. Carbonatação natural ou forçada. Cada escolha afeta o produto final.', icon: '🍾' },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-6 text-center hover:border-amber-500/40 transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-xs text-amber-500 font-bold mb-1">ETAPA {item.step}</div>
              <h4 className="text-lg font-bold text-amber-100 mb-2">{item.title}</h4>
              <p className="text-sm text-amber-200/70">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Quality meter */}
        <div className="mt-12 glass-card rounded-2xl p-6 md:p-8">
          <h4 className="text-xl font-bold text-amber-100 mb-4">📊 Sistema de Qualidade</h4>
          <p className="text-amber-200/70 mb-6">Cada lote recebe uma nota de 0-100 baseada em precisão, ingredientes e condições.</p>
          <div className="space-y-4">
            {[
              { label: 'Precisão de Temperatura', value: 85, color: 'bg-green-500' },
              { label: 'Qualidade dos Ingredientes', value: 72, color: 'bg-amber-500' },
              { label: 'Higiene do Equipamento', value: 90, color: 'bg-blue-500' },
              { label: 'Timing de Adições', value: 68, color: 'bg-purple-500' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-200/80">{stat.label}</span>
                  <span className="text-amber-400">{stat.value}/100</span>
                </div>
                <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${stat.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <div className="inline-block px-6 py-2 bg-amber-600/20 border border-amber-500/30 rounded-full">
              <span className="text-amber-300 font-bold">Nota Final do Lote: 79/100</span>
              <span className="text-amber-400 ml-2">⭐⭐⭐⭐</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GameplaySection() {
  const timeSlots = [
    {
      period: '🌅 Manhã',
      color: 'from-amber-600/20 to-orange-600/20',
      borderColor: 'border-amber-500/30',
      tasks: [
        'Verificar fermentadores (temperatura, densidade)',
        'Planejar a produção do dia',
        'Lidar com entregas de matéria-prima',
        'Resolver imprevistos: equipamento quebrado, funcionário faltou'
      ]
    },
    {
      period: '☀️ Tarde',
      color: 'from-yellow-600/20 to-amber-600/20',
      borderColor: 'border-yellow-500/30',
      tasks: [
        'Atender no taproom: servir clientes, ouvir feedback',
        'Reuniões com distribuidores, bares e restaurantes',
        'Marketing: redes sociais, eventos, parcerias',
        'Manutenção e limpeza (limpar tanque é gameplay!)'
      ]
    },
    {
      period: '🌙 Noite',
      color: 'from-indigo-600/20 to-purple-600/20',
      borderColor: 'border-indigo-500/30',
      tasks: [
        'Eventos sociais: festival, concurso, happy hour',
        'Vida pessoal: família, amigos, saúde mental',
        'Planejamento financeiro: fluxo de caixa, impostos',
        'Descanso e recuperação do personagem'
      ]
    }
  ];

  return (
    <section id="gameplay" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">Game Loop Diário</h2>
          <p className="text-amber-200/70 max-w-2xl mx-auto">
            Cada dia é dividido em três períodos com atividades únicas. Equilibre produção, 
            gestão e vida pessoal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {timeSlots.map((slot, i) => (
            <div key={i} className={`glass-card rounded-2xl p-6 border ${slot.borderColor} bg-gradient-to-b ${slot.color}`}>
              <h3 className="text-xl font-bold text-amber-100 mb-4">{slot.period}</h3>
              <ul className="space-y-3">
                {slot.tasks.map((task, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-amber-200/80">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Growth tree */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">🌳 Árvore de Crescimento</h3>
          <div className="flex flex-col items-center gap-2">
            {[
              { level: 'Micro-cervejaria (garagem)', emoji: '🏠' },
              { level: 'Cervejaria com taproom', emoji: '🍻' },
              { level: 'Distribuição local', emoji: '🚚' },
              { level: 'Distribuição regional', emoji: '🗺️' },
              { level: 'Cervejaria industrial / exportação', emoji: '🏭' },
              { level: 'Franquia / grupo cervejeiro', emoji: '🌍' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 w-full max-w-md">
                <div className="w-10 h-10 flex items-center justify-center bg-amber-900/30 rounded-full text-xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 glass-card rounded-lg px-4 py-2 text-sm text-amber-200/80">
                  {item.level}
                </div>
                {i < 5 && (
                  <div className="absolute ml-5 mt-12 text-amber-600/50">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiferenciaisSection() {
  const features = [
    {
      icon: '🎮',
      title: 'Modo Realista vs. Casual',
      desc: 'O hardcore simula química cervejeira real; o casual simplifica para todos os públicos.'
    },
    {
      icon: '💰',
      title: 'Economia Viva',
      desc: 'Preços de insumos flutuam, estações afetam consumo, tendências mudam dinamicamente.'
    },
    {
      icon: '🎨',
      title: 'Editor de Rótulos',
      desc: 'O jogador desenha seus próprios rótulos para cada cerveja criada.'
    },
    {
      icon: '🌐',
      title: 'Multiplayer Assíncrono',
      desc: 'Visite cervejarias de outros jogadores, troque receitas e faça colaborações.'
    },
    {
      icon: '📖',
      title: 'Modo História',
      desc: 'Campanha narrativa sobre salvar a cervejaria da família vs. modo sandbox livre.'
    },
    {
      icon: '🌤️',
      title: 'Sazonalidade Real',
      desc: 'Verão pede cervejas leves, inverno pede stouts e porters. O clima afeta vendas.'
    },
    {
      icon: '💀',
      title: 'Sistema de Falência',
      desc: 'Decisões ruins podem levar ao fim — e o recomeço é parte da narrativa.'
    },
    {
      icon: '🏆',
      title: 'Conquistas e Prêmios',
      desc: 'Concursos internacionais, avaliações de críticos e reconhecimento da comunidade.'
    }
  ];

  return (
    <section id="diferenciais" className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">Diferenciais do Jogo</h2>
          <p className="text-amber-200/70 max-w-2xl mx-auto">
            O que torna BrewLife único no gênero de simulação e gestão.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="glass-card rounded-xl p-5 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h4 className="font-bold text-amber-100 mb-2">{feature.title}</h4>
              <p className="text-sm text-amber-200/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferencesSection() {
  const references = [
    { name: 'Brewmaster', desc: 'Foco em crafting de cerveja', icon: '🍺', link: 'crafting profundo' },
    { name: 'Game Dev Tycoon', desc: 'Gestão + progressão', icon: '💻', link: 'árvore de crescimento' },
    { name: 'Stardew Valley', desc: 'Rotina + vida pessoal', icon: '🌾', link: 'game loop diário' },
    { name: 'Beer Factory', desc: 'Tycoon cervejeiro', icon: '🏭', link: 'gestão de produção' },
  ];

  return (
    <section id="referencias" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">Inspirações</h2>
          <p className="text-amber-200/70 max-w-2xl mx-auto">
            BrewLife combina o melhor de jogos consagrados com mecânicas únicas de crafting cervejeiro 
            e narrativa pessoal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {references.map((ref, i) => (
            <div key={i} className="glass-card rounded-xl p-6 text-center hover:border-amber-500/40 transition-all">
              <div className="text-4xl mb-3">{ref.icon}</div>
              <h4 className="font-bold text-amber-100 mb-1">{ref.name}</h4>
              <p className="text-sm text-amber-400/80 mb-2">{ref.desc}</p>
              <span className="text-xs text-amber-500/60 italic">inspiração para: {ref.link}</span>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 text-center animate-pulse-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">O Diferencial BrewLife</h3>
          <p className="text-amber-200/80 max-w-3xl mx-auto leading-relaxed">
            Unir a profundidade do crafting cervejeiro com a vida pessoal e as decisões emocionais 
            de um life sim — criando algo entre <span className="text-amber-400">Moonlighter</span> e{' '}
            <span className="text-amber-400">Craft the World</span> com tema cervejeiro. 
            Gestão, crafting e narrativa em perfeita harmonia.
          </p>
        </div>
      </div>
    </section>
  );
}

function EventsShowcase() {
  const events = [
    { icon: '🏆', title: 'Concursos', desc: 'World Beer Cup, festivais locais' },
    { icon: '📰', title: 'Crise de Reputação', desc: 'Lote contaminado viralizou' },
    { icon: '🏗️', title: 'Fiscalização', desc: 'Inspeção sanitária surpresa' },
    { icon: '💰', title: 'Aquisição', desc: 'Grande cervejaria quer te comprar' },
    { icon: '🌾', title: 'Safra Ruim', desc: 'Preço do lúpulo disparou' },
    { icon: '🤝', title: 'Colaboração', desc: 'Cervejaria rival propõe parceria' },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 via-transparent to-amber-950/30" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black gradient-text mb-4">Eventos Dinâmicos</h2>
          <p className="text-amber-200/70">Cada dia pode trazer novos desafios e oportunidades.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center hover:border-amber-500/40 transition-all hover:scale-[1.03]">
              <div className="text-3xl mb-2">{event.icon}</div>
              <h4 className="font-bold text-amber-100 text-sm mb-1">{event.title}</h4>
              <p className="text-xs text-amber-200/60">{event.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-amber-900/30">
      <div className="max-w-6xl mx-auto text-center">
        <div className="text-4xl mb-4">🍺</div>
        <h3 className="text-2xl font-bold gradient-text mb-2">BrewLife</h3>
        <p className="text-amber-200/60 text-sm mb-6">
          Simulador de Vida de Cervejeiro — Gestão, Crafting e Narrativa
        </p>
        <div className="flex justify-center gap-6 mb-6">
          <span className="text-amber-400/60 hover:text-amber-400 cursor-pointer transition-colors">🎮 Gameplay</span>
          <span className="text-amber-400/60 hover:text-amber-400 cursor-pointer transition-colors">📰 Novidades</span>
          <span className="text-amber-400/60 hover:text-amber-400 cursor-pointer transition-colors">💬 Comunidade</span>
          <span className="text-amber-400/60 hover:text-amber-400 cursor-pointer transition-colors">📧 Contato</span>
        </div>
        <p className="text-amber-200/40 text-xs">
          © 2026 BrewLife — Conceito de jogo. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================

export default function App() {
  return (
    <div className="min-h-screen bg-[#1a0f00] text-amber-50">
      <Navbar />
      <HeroSection />
      <PhasesSection />
      <CraftingSection />
      <GameplaySection />
      <EventsShowcase />
      <DiferenciaisSection />
      <ReferencesSection />
      <Footer />
    </div>
  );
}
