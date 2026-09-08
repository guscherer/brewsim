import { useState, useEffect, useCallback, useRef } from "react";

// ==================== TYPES ====================
interface Character {
  name: string;
  breweryName: string;
  background: string;
  personality: string;
}

interface Ingredient {
  id: string;
  name: string;
  type: "malt" | "hop" | "yeast" | "adjunct";
  effect: string;
  color: string;
  icon: string;
  cost: number;
}

interface Recipe {
  id: string;
  name: string;
  style: string;
  malts: string[];
  hops: string[];
  yeast: string;
  adjuncts: string[];
  abv: number;
  ibu: number;
  srm: number;
  quality: number;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "positive" | "negative" | "neutral";
  choices: { text: string; effect: string }[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  max: number;
}

// ==================== DATA ====================
const BACKGROUNDS = [
  { id: "master", name: "Mestre Cervejeiro", icon: "🎓", bonus: "Precisão +20%", desc: "Formado com honras, domina a ciência da cerveja" },
  { id: "heir", name: "Herdeiro de Receita", icon: "📜", bonus: "Receita secreta inicial", desc: "Avô deixou uma receita única da família" },
  { id: "engineer", name: "Ex-Engenheiro", icon: "⚙️", bonus: "Automação +30%", desc: "Largou a carreira corporativa pela paixão" },
  { id: "homebrewer", name: "Homebrewer", icon: "🍺", bonus: "Criatividade +25%", desc: "Anos no porão experimentando receitas" },
];

const PERSONALITIES = [
  { id: "perfectionist", name: "Perfeccionista", icon: "🎯", desc: "Qualidade acima de tudo" },
  { id: "innovator", name: "Inovador", icon: "💡", desc: "Sempre testando algo novo" },
  { id: "traditionalist", name: "Tradicionalista", icon: "🏛️", desc: "Receitas clássicas, sem frescura" },
  { id: "entrepreneur", name: "Empreendedor", icon: "📈", desc: "Negócio é tão importante quanto a cerveja" },
];

const LOCATIONS = [
  { id: "warehouse", name: "Galpão Industrial", icon: "🏭", cost: 50000, desc: "Barato, precisa de reforma total", pros: ["Baixo custo inicial", "Espaço grande"], cons: ["Reforma necessária", "Longe do centro"] },
  { id: "downtown", name: "Loja no Centro", icon: "🏙️", cost: 150000, desc: "Caro, mas com fluxo garantido", pros: ["Alto fluxo", "Visibilidade"], cons: ["Custo alto", "Espaço limitado"] },
  { id: "rural", name: "Zona Rural", icon: "🌾", cost: 30000, desc: "Barato, mas logística difícil", pros: ["Muito barato", "Ambiente autêntico"], cons: ["Logística difícil", "Pouca visibilidade"] },
];

const INGREDIENTS: Ingredient[] = [
  { id: "pilsen", name: "Pilsen", type: "malt", effect: "Base leve e dourada", color: "#F5DEB3", icon: "🌾", cost: 5 },
  { id: "munich", name: "Munich", type: "malt", effect: "Cor âmbar, sabor maltado", color: "#DAA520", icon: "🌾", cost: 7 },
  { id: "vienna", name: "Vienna", type: "malt", effect: "Dourado escuro, notas de biscoito", color: "#CD853F", icon: "🌾", cost: 8 },
  { id: "crystal", name: "Crystal 60", type: "malt", effect: "Doçura caramelo, cor âmbar", color: "#8B4513", icon: "🌾", cost: 9 },
  { id: "chocolate", name: "Chocolate", type: "malt", effect: "Notas de cacau, cor escura", color: "#3C1414", icon: "🌾", cost: 12 },
  { id: "roasted", name: "Roasted Barley", type: "malt", effect: "Tostado intenso, quase preto", color: "#1a0a00", icon: "🌾", cost: 10 },
  { id: "cascade", name: "Cascade", type: "hop", effect: "Cítrico floral, clássico americano", color: "#4CAF50", icon: "🌿", cost: 15 },
  { id: "citra", name: "Citra", type: "hop", effect: "Tropical intenso, maracujá e manga", color: "#8BC34A", icon: "🌿", cost: 25 },
  { id: "saaz", name: "Saaz", type: "hop", effect: "Especiado nobre, herbal suave", color: "#689F38", icon: "🌿", cost: 18 },
  { id: "hallertau", name: "Hallertau", type: "hop", effect: "Floral delicado, tradicional alemão", color: "#558B2F", icon: "🌿", cost: 16 },
  { id: "mosaic", name: "Mosaic", type: "hop", effect: "Complexo: frutas, terra, resina", color: "#7CB342", icon: "🌿", cost: 22 },
  { id: "ale-yeast", name: "US-05 American Ale", type: "yeast", effect: "Limpa, versátil, fermentação rápida", color: "#FFE0B2", icon: "🧫", cost: 8 },
  { id: "lager-yeast", name: "W-34/70 Lager", type: "yeast", effect: "Limpa e crocante, baixa temperatura", color: "#FFF3E0", icon: "🧫", cost: 10 },
  { id: "belgian-yeast", name: "Belgian Abbey", type: "yeast", effect: "Frutado e especiado, complexo", color: "#FFCC80", icon: "🧫", cost: 15 },
  { id: "wild-yeast", name: "Brettanomyces", type: "yeast", effect: "Funk, azedo, terroso — selvagem", color: "#FFB74D", icon: "🧫", cost: 30 },
  { id: "coffee", name: "Café Especial", type: "adjunct", effect: "Notas de café torrado", color: "#3E2723", icon: "☕", cost: 20 },
  { id: "cacao", name: "Cacau em grãos", type: "adjunct", effect: "Chocolate amargo intenso", color: "#4E342E", icon: "🍫", cost: 18 },
  { id: "vanilla", name: "Fava de Baunilha", type: "adjunct", effect: "Doçura aromática suave", color: "#FFF9C4", icon: "🌸", cost: 25 },
  { id: "passion", name: "Maracujá", type: "adjunct", effect: "Tropical azedo e aromático", color: "#FFD54F", icon: "🥭", cost: 12 },
  { id: "orange", name: "Casca de Laranja", type: "adjunct", effect: "Cítrico fresco e brilhante", color: "#FF9800", icon: "🍊", cost: 8 },
];

const GAME_EVENTS: GameEvent[] = [
  {
    id: "competition",
    title: "🏆 Concurso Regional de Cervejas",
    description: "O festival anual está chegando! Submeta sua melhor receita para concorrer ao prêmio de melhor cerveja artesanal da região.",
    icon: "🏆",
    type: "positive",
    choices: [
      { text: "Submeter a IPA experimental", effect: "+15 Reputação, +500 XP" },
      { text: "Submeter a Stout clássica", effect: "+10 Reputação, +300 XP" },
      { text: "Não participar", effect: "Nenhum efeito" },
    ],
  },
  {
    id: "contamination",
    title: "⚠️ Contaminação Detectada!",
    description: "Um dos fermentadores mostra sinais de contaminação por lactobacillus. O lote inteiro pode estar comprometido.",
    icon: "⚠️",
    type: "negative",
    choices: [
      { text: "Descartar o lote e sanitizar tudo", effect: "-R$2000, +5 Higiene" },
      { text: "Tentar salvar transformando em Sour", effect: "50% chance: Sour premiada ou lote perdido" },
      { text: "Engarrafar e torcer", effect: "-20 Reputação se descoberto" },
    ],
  },
  {
    id: "acquisition",
    title: "💰 Proposta de Aquisição",
    description: "Uma grande cervejaria multinacional quer comprar 51% da sua empresa por R$500.000. Eles prometem manter a 'essência artesanal'.",
    icon: "💰",
    type: "neutral",
    choices: [
      { text: "Aceitar a proposta", effect: "+R$500.000, -30 Reputação artesanal" },
      { text: "Recusar educadamente", effect: "+20 Reputação, orgulho intacto" },
      { text: "Contra-proposta: 20% por R$300k", effect: "Negociação incerta" },
    ],
  },
  {
    id: "trend",
    title: "📱 Nova Tendência de Mercado",
    description: "Cervejas 'Brut IPA' estão viralizando nas redes sociais. Todo mundo quer experimentar. Mas você acredita que é moda passageira.",
    icon: "📱",
    type: "neutral",
    choices: [
      { text: "Criar uma Brut IPA imediatamente", effect: "+Vendas rápidas, possível modismo" },
      { text: "Ignorar e focar no seu estilo", effect: "+Autenticidade, -vendas temporárias" },
      { text: "Criar sua própria tendência", effect: "Alto risco, alta recompensa" },
    ],
  },
  {
    id: "collab",
    title: "🤝 Convite para Colaboração",
    description: "A cervejaria rival 'Lúpulo Selvagem' propõe uma receita colaborativa. Pode ser uma grande oportunidade ou uma armadilha de marketing.",
    icon: "🤝",
    type: "positive",
    choices: [
      { text: "Aceitar com entusiasmo", effect: "+25 Reputação, nova receita desbloqueada" },
      { text: "Aceitar com ressalvas", effect: "+10 Reputação, controle criativo" },
      { text: "Recusar — rivalidade é rivalidade", effect: "+5 Orgulho, -10 Networking" },
    ],
  },
  {
    id: "inspection",
    title: "🏗️ Inspeção Sanitária Surpresa!",
    description: "A vigilância sanitária apareceu sem aviso. Seu histórico de higiene será testado agora.",
    icon: "🏗️",
    type: "negative",
    choices: [
      { text: "Mostrar tudo com confiança", effect: "Depende do seu nível de higiene" },
      { text: "Oferecer uma cerveja gelada ao inspetor", effect: "Charme +10, mas pode ser suborno" },
      { text: "Panic mode: limpar tudo em 5 min", effect: "60% chance de passar" },
    ],
  },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-brew", title: "Primeiro Lote", description: "Complete sua primeira brassagem", icon: "🍺", unlocked: false, progress: 0, max: 1 },
  { id: "master-brewer", title: "Mestre da Brassagem", description: "Alcance 95+ de qualidade", icon: "⭐", unlocked: false, progress: 0, max: 95 },
  { id: "recipe-collector", title: "Colecionador de Receitas", description: "Crie 10 receitas diferentes", icon: "📖", unlocked: false, progress: 0, max: 10 },
  { id: "money-maker", title: "Império Cervejeiro", description: "Acumule R$100.000", icon: "💰", unlocked: false, progress: 0, max: 100000 },
  { id: "social-star", title: "Estrela das Redes", description: "Alcance 100 de reputação", icon: "📱", unlocked: false, progress: 0, max: 100 },
  { id: "survivor", title: "Sobrevivente", description: "Supere 5 eventos negativos", icon: "🛡️", unlocked: false, progress: 0, max: 5 },
  { id: "innovator", title: "Inovador", description: "Use 5 adjuntos diferentes", icon: "💡", unlocked: false, progress: 0, max: 5 },
  { id: "expansion", title: "Expansão Total", description: "Chegue ao nível industrial", icon: "🏭", unlocked: false, progress: 0, max: 6 },
];

const BREW_STYLES = [
  { name: "Pilsner", color: "#F5DEB3", abv: [4, 5.5], ibu: [25, 40] },
  { name: "IPA", color: "#FFA000", abv: [5.5, 7.5], ibu: [40, 70] },
  { name: "Stout", color: "#1a0a00", abv: [4.5, 7], ibu: [25, 50] },
  { name: "Wheat Beer", color: "#FFE082", abv: [4, 5.5], ibu: [10, 25] },
  { name: "Porter", color: "#3E2723", abv: [4, 6], ibu: [25, 45] },
  { name: "Belgian Ale", color: "#FF8F00", abv: [6, 9], ibu: [15, 30] },
  { name: "Sour", color: "#E65100", abv: [3, 6], ibu: [5, 20] },
  { name: "Lager", color: "#FFCA28", abv: [4, 5.5], ibu: [15, 30] },
];

const EXPANSION_LEVELS = [
  { name: "Micro-cervejaria (Garagem)", icon: "🏠", cost: 0, capacity: 100 },
  { name: "Cervejaria com Taproom", icon: "🍻", cost: 50000, capacity: 500 },
  { name: "Distribuição Local", icon: "🚚", cost: 150000, capacity: 2000 },
  { name: "Distribuição Regional", icon: "🗺️", cost: 500000, capacity: 10000 },
  { name: "Cervejaria Industrial", icon: "🏭", cost: 2000000, capacity: 50000 },
  { name: "Franquia / Exportação", icon: "🌍", cost: 10000000, capacity: 200000 },
];

// ==================== COMPONENTS ====================

function BeerGlassAnimation() {
  return (
    <div className="relative inline-block">
      <div className="beer-glass-container">
        <div className="beer-glass">
          <div className="beer-liquid"></div>
          <div className="beer-foam">
            <div className="foam-bubble b1"></div>
            <div className="foam-bubble b2"></div>
            <div className="foam-bubble b3"></div>
            <div className="foam-bubble b4"></div>
            <div className="foam-bubble b5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemperatureGauge({ temperature, target, onAdjust }: { temperature: number; target: number; onAdjust: (t: number) => void }) {
  const diff = Math.abs(temperature - target);
  const getColor = () => {
    if (diff <= 1) return "text-green-400";
    if (diff <= 3) return "text-yellow-400";
    if (diff <= 5) return "text-orange-400";
    return "text-red-400";
  };

  const getPosition = () => {
    const min = 30;
    const max = 80;
    return ((temperature - min) / (max - min)) * 100;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">30°C</span>
        <span className={`font-bold ${getColor()}`}>{temperature.toFixed(1)}°C</span>
        <span className="text-gray-400">80°C</span>
      </div>
      <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
        {/* Target zone */}
        <div
          className="absolute top-0 h-full bg-green-500/30 border-x-2 border-green-400"
          style={{
            left: `${((target - 2 - 30) / 50) * 100}%`,
            width: `${(4 / 50) * 100}%`,
          }}
        ></div>
        {/* Current position */}
        <div
          className={`absolute top-1 w-4 h-6 rounded-full ${diff <= 1 ? "bg-green-400" : diff <= 3 ? "bg-yellow-400" : diff <= 5 ? "bg-orange-400" : "bg-red-400"} transition-all duration-300 shadow-lg`}
          style={{ left: `${getPosition()}%`, transform: "translateX(-50%)" }}
        ></div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        <button
          onClick={() => onAdjust(temperature - 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold transition-all active:scale-95"
        >
          ❄️ -1°C
        </button>
        <button
          onClick={() => onAdjust(temperature + 1)}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-all active:scale-95"
        >
          🔥 +1°C
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = "bg-amber-500", label }: { value: number; max: number; color?: string; label?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {label && <div className="text-xs text-gray-400 mb-1">{label}</div>}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700/50 hover:border-${color}-500/50 transition-all`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [character, setCharacter] = useState<Character | null>(null);
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [money, setMoney] = useState(100000);
  const [reputation, setReputation] = useState(50);
  const [day, setDay] = useState(1);
  const [season, setSeason] = useState("Primavera");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [expansionLevel, setExpansionLevel] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Brewing mini-game state
  const [brewingActive, setBrewingActive] = useState(false);
  const [brewTemp, setBrewTemp] = useState(50);
  const [brewTarget, setBrewTarget] = useState(65);
  const [brewStage, setBrewStage] = useState(0);
  const [brewScore, setBrewScore] = useState(0);
  const [brewTimeLeft, setBrewTimeLeft] = useState(30);
  const [selectedMalts, setSelectedMalts] = useState<string[]>([]);
  const [selectedHops, setSelectedHops] = useState<string[]>([]);
  const [selectedYeast, setSelectedYeast] = useState("");
  const [selectedAdjuncts, setSelectedAdjuncts] = useState<string[]>([]);
  const [brewStyle, setBrewStyle] = useState("");
  const [brewName, setBrewName] = useState("");

  // Tasting game
  const [tastingActive, setTastingActive] = useState(false);
  const [tastingNotes, setTastingNotes] = useState<string[]>([]);
  const [tastingScore, setTastingScore] = useState(0);

  const brewIntervalRef = useRef<number | null>(null);

  const seasons = ["Primavera", "Verão", "Outono", "Inverno"];

  // Character creation
  const createCharacter = () => {
    if (selectedBackground && selectedPersonality && selectedLocation) {
      setCharacter({
        name: "Jogador",
        breweryName: "Cervejaria do Jogador",
        background: selectedBackground,
        personality: selectedPersonality,
      });
      setActiveTab("dashboard");
    }
  };

  // Brewing stages
  const brewStages = [
    { name: "Mostura", target: 65, desc: "Converter amido em açúcar" },
    { name: "Mash Out", target: 76, desc: "Parar a conversão enzimática" },
    { name: "Fervura", target: 100, desc: "Extração de alfa-ácidos do lúpulo" },
    { name: "Whirlpool", target: 80, desc: "Separação do trub" },
    { name: "Resfriamento", target: 20, desc: "Preparar para fermentação" },
  ];

  // Start brewing mini-game
  const startBrewing = () => {
    if (selectedMalts.length === 0 || !selectedYeast) return;
    setBrewingActive(true);
    setBrewStage(0);
    setBrewScore(0);
    setBrewTimeLeft(30);
    setBrewTemp(50);
    setBrewTarget(brewStages[0].target);
  };

  // Handle temperature adjustment
  const adjustTemp = (delta: number) => {
    setBrewTemp((prev) => Math.max(10, Math.min(100, prev + delta)));
  };

  // Brewing timer
  useEffect(() => {
    if (brewingActive && brewTimeLeft > 0) {
      brewIntervalRef.current = window.setInterval(() => {
        setBrewTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next stage or finish
            if (brewStage < brewStages.length - 1) {
              const nextStage = brewStage + 1;
              setBrewStage(nextStage);
              setBrewTarget(brewStages[nextStage].target);
              // Score based on accuracy
              const diff = Math.abs(brewTemp - brewTarget);
              const stageScore = Math.max(0, 20 - diff * 3);
              setBrewScore((s) => s + stageScore);
              return 30;
            } else {
              // Final scoring
              const diff = Math.abs(brewTemp - brewTarget);
              const stageScore = Math.max(0, 20 - diff * 3);
              const finalScore = brewScore + stageScore;
              setBrewScore(finalScore);
              finishBrew(finalScore);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (brewIntervalRef.current) clearInterval(brewIntervalRef.current);
      };
    }
  }, [brewingActive, brewTimeLeft, brewStage]);

  // Finish brewing
  const finishBrew = (score: number) => {
    setBrewingActive(false);
    if (brewIntervalRef.current) clearInterval(brewIntervalRef.current);

    const quality = Math.min(100, score + (selectedMalts.length * 3) + (selectedHops.length * 2) + (selectedAdjuncts.length * 5));
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: brewName || `Lote #${recipes.length + 1}`,
      style: brewStyle || "Custom",
      malts: selectedMalts,
      hops: selectedHops,
      yeast: selectedYeast,
      adjuncts: selectedAdjuncts,
      abv: parseFloat((4 + Math.random() * 5).toFixed(1)),
      ibu: Math.round(20 + Math.random() * 50),
      srm: Math.round(2 + Math.random() * 35),
      quality: Math.round(quality),
    };
    setRecipes((prev) => [...prev, newRecipe]);
    setMoney((prev) => prev + Math.round(quality * 10));
    setReputation((prev) => Math.min(100, prev + Math.round(quality / 10)));

    // Update achievements
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === "first-brew") return { ...a, progress: 1, unlocked: true };
        if (a.id === "master-brewer") return { ...a, progress: Math.max(a.progress, quality) };
        if (a.id === "recipe-collector") return { ...a, progress: recipes.length + 1 };
        return a;
      })
    );
  };

  // Trigger random event
  const triggerEvent = () => {
    const event = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
    setCurrentEvent(event);
  };

  // Handle event choice
  const handleEventChoice = (choiceIndex: number) => {
    if (!currentEvent) return;
    const choice = currentEvent.choices[choiceIndex];
    setEventLog((prev) => [...prev, `${currentEvent.title}: ${choice.text}`]);

    // Apply effects
    if (currentEvent.type === "positive") {
      setReputation((prev) => Math.min(100, prev + 5));
      setMoney((prev) => prev + 2000);
    } else if (currentEvent.type === "negative") {
      setMoney((prev) => Math.max(0, prev - 1000));
      setReputation((prev) => Math.max(0, prev - 3));
    }

    setCurrentEvent(null);
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === "survivor" && currentEvent.type === "negative") return { ...a, progress: a.progress + 1 };
        return a;
      })
    );
  };

  // Advance day
  const advanceDay = () => {
    setDay((prev) => {
      const newDay = prev + 1;
      if (newDay % 30 === 0) {
        const currentIdx = seasons.indexOf(season);
        setSeason(seasons[(currentIdx + 1) % 4]);
      }
      return newDay;
    });
    setMoney((prev) => prev + Math.round(reputation * 5));

    // Random event chance
    if (Math.random() < 0.3) {
      triggerEvent();
    }
  };

  // Start tasting mini-game
  const startTasting = () => {
    setTastingActive(true);
    setTastingNotes([]);
    setTastingScore(0);
  };

  const tastingFlavors = ["Cítrico", "Amargo", "Doce", "Tropical", "Caramelo", "Café", "Floral", "Frutado", "Especiado", "Defumado", "Terroso", "Resinoso"];

  const addTastingNote = (note: string) => {
    if (tastingNotes.length < 5) {
      setTastingNotes((prev) => [...prev, note]);
      setTastingScore((prev) => prev + 10);
    }
  };

  const finishTasting = () => {
    setTastingActive(false);
    setReputation((prev) => Math.min(100, prev + tastingScore / 10));
  };

  // Expand brewery
  const expandBrewery = () => {
    if (expansionLevel < EXPANSION_LEVELS.length - 1) {
      const nextLevel = EXPANSION_LEVELS[expansionLevel + 1];
      if (money >= nextLevel.cost) {
        setMoney((prev) => prev - nextLevel.cost);
        setExpansionLevel((prev) => prev + 1);
        setAchievements((prev) =>
          prev.map((a) => {
            if (a.id === "expansion") return { ...a, progress: expansionLevel + 2 };
            return a;
          })
        );
      }
    }
  };

  // ==================== RENDER ====================
  // Taproom customers
  const [taproomActive, setTaproomActive] = useState(false);
  const [customers, setCustomers] = useState<{ name: string; mood: string; order: string; satisfaction: number; tip: number }[]>([]);
  const [taproomScore, setTaproomScore] = useState(0);
  const [cleanliness, setCleanliness] = useState(80);
  const [cleaningActive, setCleaningActive] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [cleaningSpots, setCleaningSpots] = useState<{ x: number; y: number; cleaned: boolean }[]>([]);

  const CUSTOMER_NAMES = ["João", "Maria", "Pedro", "Ana", "Carlos", "Julia", "Rafael", "Beatriz", "Lucas", "Fernanda", "Thiago", "Camila"];
  const CUSTOMER_MOODS = ["😊 Animado", "😐 Normal", "🤔 Curioso", "🎉 Celebrando", "😴 Cansado"];
  const CUSTOMER_COMPLAINTS = [
    "A cerveja está um pouco quente...",
    "Adorei o ambiente!",
    "Vocês têm algo mais leve?",
    "Essa IPA está incrível!",
    "O atendimento poderia ser mais rápido.",
    "Vou trazer meus amigos aqui!",
    "A espuma está perfeita!",
    "Tem comida também?",
  ];

  const startTaproom = () => {
    setTaproomActive(true);
    setTaproomScore(0);
    setCustomers([]);
    // Generate random customers
    const newCustomers = Array.from({ length: 4 }, () => ({
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      mood: CUSTOMER_MOODS[Math.floor(Math.random() * CUSTOMER_MOODS.length)],
      order: recipes.length > 0 ? recipes[Math.floor(Math.random() * recipes.length)].name : "Pilsen da casa",
      satisfaction: 50 + Math.floor(Math.random() * 30),
      tip: Math.floor(Math.random() * 20) + 5,
    }));
    setCustomers(newCustomers);
  };

  const serveCustomer = (index: number) => {
    const customer = customers[index];
    const qualityBonus = recipes.length > 0 ? Math.floor(recipes[recipes.length - 1].quality / 10) : 5;
    const cleanlinessBonus = Math.floor(cleanliness / 20);
    const totalSatisfaction = Math.min(100, customer.satisfaction + qualityBonus + cleanlinessBonus);
    const tip = Math.floor((totalSatisfaction / 100) * customer.tip * 2);

    setCustomers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, satisfaction: totalSatisfaction } : c))
    );
    setTaproomScore((prev) => prev + totalSatisfaction);
    setMoney((prev) => prev + tip + 15);
    setReputation((prev) => Math.min(100, prev + 1));
  };

  const startCleaning = () => {
    setCleaningActive(true);
    setCleaningProgress(0);
    // Generate random dirt spots
    const spots = Array.from({ length: 8 }, () => ({
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10,
      cleaned: false,
    }));
    setCleaningSpots(spots);
  };

  const cleanSpot = (index: number) => {
    setCleaningSpots((prev) =>
      prev.map((spot, i) => (i === index ? { ...spot, cleaned: true } : spot))
    );
    const cleanedCount = cleaningSpots.filter((s, i) => (i === index ? true : s.cleaned)).length;
    setCleaningProgress((cleanedCount / cleaningSpots.length) * 100);
    if (cleanedCount === cleaningSpots.length) {
      setTimeout(() => {
        setCleaningActive(false);
        setCleanliness(100);
        setMoney((prev) => prev + 50);
      }, 500);
    }
  };

  const tabs = [
    { id: "home", label: "Início", icon: "🏠" },
    { id: "create", label: "Criar", icon: "👤" },
    { id: "dashboard", label: "Painel", icon: "📊" },
    { id: "brewing", label: "Brassagem", icon: "🍺" },
    { id: "taproom", label: "Taproom", icon: "🍻" },
    { id: "recipes", label: "Receitas", icon: "📖" },
    { id: "tasting", label: "Degustação", icon: "👅" },
    { id: "expansion", label: "Expansão", icon: "🏭" },
    { id: "events", label: "Eventos", icon: "🎭" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍺</span>
              <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                BrewLife
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            {character && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-amber-400">💰 R${money.toLocaleString()}</span>
                <span className="text-green-400">⭐ {reputation}</span>
                <span className="text-blue-400">📅 Dia {day}</span>
              </div>
            )}
          </div>
          {/* Mobile tabs */}
          <div className="md:hidden flex overflow-x-auto gap-1 pb-2 -mx-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* ==================== HOME TAB ==================== */}
        {activeTab === "home" && (
          <div className="space-y-16">
            {/* Hero */}
            <section className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-gray-900/80 to-gray-900"></div>
              <div className="absolute inset-0 opacity-30">
                <img
                  src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1920&q=80"
                  alt="Brewery"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="relative z-10 space-y-8 p-8">
                <div className="animate-float">
                  <BeerGlassAnimation />
                </div>
                <h1 className="text-5xl md:text-7xl font-black">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    BrewLife
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                  O simulador definitivo de vida de cervejeiro. Crie, brassagem, expanda e viva a experiência completa de uma cervejaria artesanal.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/30"
                  >
                    🎮 Começar a Jogar
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl font-bold text-lg transition-all"
                  >
                    📊 Ver Demo
                  </button>
                </div>
                <div className="flex justify-center gap-8 text-sm text-gray-400 mt-8">
                  <div className="flex items-center gap-2"><span className="text-amber-400">🔬</span> Crafting Real</div>
                  <div className="flex items-center gap-2"><span className="text-green-400">📈</span> Gestão Completa</div>
                  <div className="flex items-center gap-2"><span className="text-blue-400">🎭</span> Narrativa Profunda</div>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Mecânicas de Jogo
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: "🌾", title: "Sistema de Brassagem", desc: "Controle temperatura, tempo e ingredientes em mini-games imersivos", color: "amber" },
                  { icon: "📊", title: "Gestão Completa", desc: "Finanças, equipe, marketing e distribuição em tempo real", color: "green" },
                  { icon: "🎭", title: "Eventos Dinâmicos", desc: "Concursos, crises, propostas e tendências que mudam tudo", color: "purple" },
                  { icon: "👥", title: "Relacionamentos", desc: "Equipe com personalidade, vida pessoal e consequências emocionais", color: "blue" },
                  { icon: "🏭", title: "Expansão Progressiva", desc: "De garagem a franquia internacional com decisões estratégicas", color: "orange" },
                  { icon: "🏆", title: "Conquistas & Legado", desc: "Desbloqueie prêmios e construa o legado da sua cervejaria", color: "yellow" },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all hover:transform hover:scale-[1.02] group"
                  >
                    <div className="text-4xl mb-4 group-hover:animate-bounce">{f.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                    <p className="text-gray-400">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Phases */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Fases do Jogo
                </span>
              </h2>
              <div className="space-y-4">
                {[
                  { phase: "1", title: "Criação & Abertura", desc: "Escolha seu background, ponto comercial e monte sua estrutura inicial", icon: "🎬" },
                  { phase: "2", title: "Brassagem & Receitas", desc: "Sistema de crafting profundo com controle de temperatura e ingredientes", icon: "🔬" },
                  { phase: "3", title: "Operação Diária", desc: "Rotina com manhã, tarde e noite — produção, taproom e vida pessoal", icon: "📋" },
                  { phase: "4", title: "Progressão & Expansão", desc: "Árvore de crescimento de micro a franquia com decisões estratégicas", icon: "📈" },
                  { phase: "5", title: "Eventos & Narrativa", desc: "Concursos, crises, aquisições e tendências que desafiam o jogador", icon: "🎭" },
                  { phase: "6", title: "Personagens & Legado", desc: "Relacionamentos, equipe, vida pessoal e o legado da sua marca", icon: "👥" },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-gray-800/30 rounded-xl p-5 border border-gray-700/30 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-bold text-lg">
                      {p.phase}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span>{p.icon}</span> {p.title}
                      </h3>
                      <p className="text-gray-400 mt-1">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== CREATE TAB ==================== */}
        {activeTab === "create" && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Crie seu Personagem
                </span>
              </h2>
              <p className="text-gray-400">Defina quem você é no mundo da cerveja artesanal</p>
            </div>

            {/* Background Selection */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">🎓 Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      selectedBackground === bg.id
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{bg.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg">{bg.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{bg.desc}</p>
                        <p className="text-sm text-amber-400 mt-2 font-medium">🎁 {bg.bonus}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Personality */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">🧠 Personalidade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERSONALITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonality(p.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      selectedPersonality === p.id
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{p.icon}</span>
                      <div>
                        <h4 className="font-bold">{p.name}</h4>
                        <p className="text-sm text-gray-400">{p.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">📍 Ponto Comercial</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      selectedLocation === loc.id
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                    }`}
                  >
                    <span className="text-3xl">{loc.icon}</span>
                    <h4 className="font-bold mt-2">{loc.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">{loc.desc}</p>
                    <p className="text-amber-400 font-bold mt-2">R$ {loc.cost.toLocaleString()}</p>
                    <div className="mt-3 space-y-1">
                      {loc.pros.map((pro, i) => (
                        <p key={i} className="text-xs text-green-400">✅ {pro}</p>
                      ))}
                      {loc.cons.map((con, i) => (
                        <p key={i} className="text-xs text-red-400">❌ {con}</p>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Create Button */}
            <div className="text-center">
              <button
                onClick={createCharacter}
                disabled={!selectedBackground || !selectedPersonality || !selectedLocation}
                className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedBackground && selectedPersonality && selectedLocation
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/30 transform hover:scale-105"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                🍺 Abrir as Portas da Cervejaria!
              </button>
              {(!selectedBackground || !selectedPersonality || !selectedLocation) && (
                <p className="text-sm text-gray-500 mt-2">Selecione todas as opções para começar</p>
              )}
            </div>
          </div>
        )}

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold">Painel de Controle</h2>
                <p className="text-gray-400">
                  {seasons.find((_, i) => seasons[i] === season) ? "🌸" : "☀️"} {season} — Dia {day}
                </p>
              </div>
              <button
                onClick={advanceDay}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all"
              >
                ⏭️ Avançar Dia
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="💰" label="Caixa" value={`R$${money.toLocaleString()}`} color="amber" />
              <StatCard icon="⭐" label="Reputação" value={`${reputation}/100`} color="green" />
              <StatCard icon="📖" label="Receitas" value={recipes.length} color="blue" />
              <StatCard icon="🏭" label="Nível" value={EXPANSION_LEVELS[expansionLevel].name.split(" ")[0]} color="purple" />
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">📊 Status da Cervejaria</h3>
                <ProgressBar value={reputation} max={100} color="bg-green-500" label={`Reputação: ${reputation}/100`} />
                <ProgressBar value={money} max={1000000} color="bg-amber-500" label={`Capital: R$${money.toLocaleString()}`} />
                <ProgressBar value={day} max={365} color="bg-blue-500" label={`Tempo: Dia ${day}/365`} />
                <ProgressBar value={recipes.length} max={20} color="bg-purple-500" label={`Receitas: ${recipes.length}/20`} />
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg">🎯 Conquistas</h3>
                {achievements.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className={`text-2xl ${a.unlocked ? "" : "grayscale opacity-50"}`}>{a.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className={a.unlocked ? "text-amber-400" : "text-gray-400"}>{a.title}</span>
                        <span className="text-gray-500">{a.progress}/{a.max}</span>
                      </div>
                      <ProgressBar value={a.progress} max={a.max} color={a.unlocked ? "bg-amber-500" : "bg-gray-600"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Prices */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4">📈 Mercado de Insumos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Malte Pilsen", price: 5 + Math.floor(Math.random() * 3), trend: "up" as const, icon: "🌾" },
                  { name: "Lúpulo Cascade", price: 15 + Math.floor(Math.random() * 8), trend: "down" as const, icon: "🌿" },
                  { name: "Levedura Ale", price: 8 + Math.floor(Math.random() * 4), trend: "stable" as const, icon: "🧫" },
                  { name: "Garrafas (cx)", price: 25 + Math.floor(Math.random() * 10), trend: "up" as const, icon: "🍶" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-700/30 rounded-xl text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs text-gray-400">{item.name}</div>
                    <div className="text-lg font-bold text-amber-400">R${item.price}</div>
                    <div className={`text-xs ${item.trend === "up" ? "text-red-400" : item.trend === "down" ? "text-green-400" : "text-gray-400"}`}>
                      {item.trend === "up" ? "📈 Subindo" : item.trend === "down" ? "📉 Caindo" : "➡️ Estável"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    const cost = 500 + Math.floor(Math.random() * 1000);
                    if (money >= cost) {
                      setMoney(prev => prev - cost);
                      setReputation(prev => Math.min(100, prev + 2));
                      setEventLog(prev => [...prev, `📦 Comprou insumos por R$${cost}`]);
                    }
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-all"
                >
                  🛒 Comprar Estoque (R$500-1500)
                </button>
              </div>
            </div>

            {/* Daily Activities */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4">📋 Atividades do Dia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-xl border border-amber-500/20">
                  <div className="text-2xl mb-2">🌅</div>
                  <h4 className="font-bold text-amber-400">Manhã</h4>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Verificar fermentadores</li>
                    <li>• Planejar produção</li>
                    <li>• Receber matéria-prima</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl border border-yellow-500/20">
                  <div className="text-2xl mb-2">☀️</div>
                  <h4 className="font-bold text-yellow-400">Tarde</h4>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Atender no taproom</li>
                    <li>• Reuniões com distribuidores</li>
                    <li>• Marketing e redes sociais</li>
                  </ul>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20">
                  <div className="text-2xl mb-2">🌙</div>
                  <h4 className="font-bold text-blue-400">Noite</h4>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Eventos e festivais</li>
                    <li>• Vida pessoal e família</li>
                    <li>• Planejamento financeiro</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Season Info */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4">🌍 Estação Atual: {season}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {seasons.map((s) => (
                  <div
                    key={s}
                    className={`p-3 rounded-lg text-center ${
                      s === season ? "bg-amber-500/20 border border-amber-500/30" : "bg-gray-700/30"
                    }`}
                  >
                    <div className="text-2xl">
                      {s === "Primavera" ? "🌸" : s === "Verão" ? "☀️" : s === "Outono" ? "🍂" : "❄️"}
                    </div>
                    <div className="text-sm mt-1">{s}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {s === "Primavera" && "IPAs, Witbiers" }
                      {s === "Verão" && "Pilsners, Sours" }
                      {s === "Outono" && "Oktoberfest, Amber" }
                      {s === "Inverno" && "Stouts, Porters" }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== BREWING TAB ==================== */}
        {activeTab === "brewing" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  🍺 Brassagem
                </span>
              </h2>
              <p className="text-gray-400">Selecione ingredientes e controle a temperatura para criar sua cerveja</p>
            </div>

            {!brewingActive ? (
              <div className="space-y-8">
                {/* Recipe Name & Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Cerveja</label>
                    <input
                      type="text"
                      value={brewName}
                      onChange={(e) => setBrewName(e.target.value)}
                      placeholder="Ex: Golden Horizon IPA"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estilo</label>
                    <select
                      value={brewStyle}
                      onChange={(e) => setBrewStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                    >
                      <option value="">Selecione o estilo</option>
                      {BREW_STYLES.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Malts */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">🌾 Maltes <span className="text-sm text-gray-400">(selecione 1-4)</span></h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {INGREDIENTS.filter((i) => i.type === "malt").map((malt) => (
                      <button
                        key={malt.id}
                        onClick={() => {
                          if (selectedMalts.includes(malt.id)) {
                            setSelectedMalts(selectedMalts.filter((m) => m !== malt.id));
                          } else if (selectedMalts.length < 4) {
                            setSelectedMalts([...selectedMalts, malt.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedMalts.includes(malt.id)
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: malt.color }}></div>
                        <div className="text-xs font-medium">{malt.name}</div>
                        <div className="text-xs text-gray-500 mt-1">R${malt.cost}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Hops */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">🌿 Lúpulos <span className="text-sm text-gray-400">(selecione 1-3)</span></h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {INGREDIENTS.filter((i) => i.type === "hop").map((hop) => (
                      <button
                        key={hop.id}
                        onClick={() => {
                          if (selectedHops.includes(hop.id)) {
                            setSelectedHops(selectedHops.filter((h) => h !== hop.id));
                          } else if (selectedHops.length < 3) {
                            setSelectedHops([...selectedHops, hop.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedHops.includes(hop.id)
                            ? "border-green-500 bg-green-500/10"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                        }`}
                      >
                        <div className="text-2xl mb-1">{hop.icon}</div>
                        <div className="text-xs font-medium">{hop.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{hop.effect}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Yeast */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">🧫 Levedura <span className="text-sm text-gray-400">(obrigatório)</span></h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INGREDIENTS.filter((i) => i.type === "yeast").map((yeast) => (
                      <button
                        key={yeast.id}
                        onClick={() => setSelectedYeast(yeast.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedYeast === yeast.id
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                        }`}
                      >
                        <div className="text-xl mb-1">{yeast.icon}</div>
                        <div className="text-sm font-medium">{yeast.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{yeast.effect}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Adjuncts */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">✨ Adjuntos <span className="text-sm text-gray-400">(opcional, 0-3)</span></h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {INGREDIENTS.filter((i) => i.type === "adjunct").map((adj) => (
                      <button
                        key={adj.id}
                        onClick={() => {
                          if (selectedAdjuncts.includes(adj.id)) {
                            setSelectedAdjuncts(selectedAdjuncts.filter((a) => a !== adj.id));
                          } else if (selectedAdjuncts.length < 3) {
                            setSelectedAdjuncts([...selectedAdjuncts, adj.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedAdjuncts.includes(adj.id)
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                        }`}
                      >
                        <div className="text-2xl mb-1">{adj.icon}</div>
                        <div className="text-xs font-medium">{adj.name}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Start Brewing Button */}
                <div className="text-center">
                  <button
                    onClick={startBrewing}
                    disabled={selectedMalts.length === 0 || !selectedYeast}
                    className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${
                      selectedMalts.length > 0 && selectedYeast
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/30 transform hover:scale-105"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    🔥 Iniciar Brassagem!
                  </button>
                  {selectedMalts.length === 0 && <p className="text-sm text-gray-500 mt-2">Selecione pelo menos 1 malte</p>}
                  {!selectedYeast && <p className="text-sm text-gray-500 mt-2">Selecione uma levedura</p>}
                </div>
              </div>
            ) : (
              /* Brewing Mini-Game */
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-8 border border-amber-500/30 space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-amber-400">
                      {brewStages[brewStage].name}
                    </h3>
                    <p className="text-gray-400 mt-1">{brewStages[brewStage].desc}</p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold text-amber-400">{brewTimeLeft}s</div>
                      <div className="text-xs text-gray-500">Tempo restante</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold text-green-400">{brewScore}</div>
                      <div className="text-xs text-gray-500">Pontos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold text-blue-400">{brewStage + 1}/{brewStages.length}</div>
                      <div className="text-xs text-gray-500">Etapa</div>
                    </div>
                  </div>

                  {/* Temperature Gauge */}
                  <div className="space-y-2">
                    <div className="text-center text-sm text-gray-400">
                      Temperatura alvo: <span className="text-green-400 font-bold">{brewTarget}°C</span>
                    </div>
                    <TemperatureGauge temperature={brewTemp} target={brewTarget} onAdjust={adjustTemp} />
                  </div>

                  {/* Stages Progress */}
                  <div className="flex gap-2">
                    {brewStages.map((stage, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < brewStage ? "bg-green-500" : i === brewStage ? "bg-amber-500 animate-pulse" : "bg-gray-700"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Brew Result */}
            {!brewingActive && recipes.length > 0 && (
              <div className="bg-gradient-to-r from-green-900/30 to-amber-900/30 rounded-2xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">✅ Último Lote Concluído!</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{recipes[recipes.length - 1].quality}/100</div>
                    <div className="text-xs text-gray-400">Qualidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{recipes[recipes.length - 1].abv}%</div>
                    <div className="text-xs text-gray-400">ABV</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{recipes[recipes.length - 1].ibu}</div>
                    <div className="text-xs text-gray-400">IBU</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{recipes[recipes.length - 1].srm}</div>
                    <div className="text-xs text-gray-400">SRM (Cor)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAPROOM TAB ==================== */}
        {activeTab === "taproom" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  🍻 Taproom
                </span>
              </h2>
              <p className="text-gray-400">Atenda clientes, ganhe gorjetas e construa sua reputação local</p>
            </div>

            {/* Cleanliness & Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="🧹" label="Limpeza" value={`${cleanliness}%`} color="green" />
              <StatCard icon="💰" label="Gorjetas Hoje" value={`R$${taproomScore}`} color="amber" />
              <StatCard icon="👥" label="Clientes" value={customers.length} color="blue" />
              <StatCard icon="⭐" label="Avaliação" value={`${Math.min(5, Math.round(reputation / 20))}/5`} color="purple" />
            </div>

            {/* Cleaning Mini-Game */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🧹 Manutenção & Limpeza</h3>
                <ProgressBar value={cleanliness} max={100} color={cleanliness > 60 ? "bg-green-500" : cleanliness > 30 ? "bg-yellow-500" : "bg-red-500"} label={`Higiene: ${cleanliness}%`} />
              </div>

              {!cleaningActive ? (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    A limpeza é essencial! Tanques sujos podem contaminar lotes e reduzir a reputação.
                  </p>
                  <button
                    onClick={startCleaning}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-xl font-bold transition-all"
                  >
                    🧽 Iniciar Limpeza
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-sm text-gray-400">Clique em todos os pontos de sujeira para limpar!</p>
                  <div className="relative w-full h-64 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Tank background */}
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🛢️</div>
                    {/* Dirt spots */}
                    {cleaningSpots.map((spot, i) => (
                      <button
                        key={i}
                        onClick={() => cleanSpot(i)}
                        className={`absolute w-8 h-8 rounded-full transition-all transform ${
                          spot.cleaned
                            ? "bg-green-500/30 scale-0"
                            : "bg-amber-800 hover:bg-amber-600 cursor-pointer animate-pulse scale-100"
                        }`}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        title="Clique para limpar!"
                      >
                        {!spot.cleaned && <span className="text-xs">💩</span>}
                      </button>
                    ))}
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${cleaningProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    {cleaningSpots.filter((s) => s.cleaned).length}/{cleaningSpots.length} pontos limpos
                  </div>
                </div>
              )}
            </div>

            {/* Taproom Service */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🍺 Atendimento</h3>
                {!taproomActive && (
                  <button
                    onClick={startTaproom}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl font-bold transition-all"
                  >
                    🚪 Abrir o Taproom
                  </button>
                )}
              </div>

              {taproomActive ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customers.map((customer, i) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/50 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold">{customer.name}</div>
                            <div className="text-sm text-gray-400">{customer.mood}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Pedido:</div>
                            <div className="text-sm text-amber-400">{customer.order}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Satisfação: <span className={customer.satisfaction > 70 ? "text-green-400" : customer.satisfaction > 40 ? "text-yellow-400" : "text-red-400"}>{customer.satisfaction}%</span>
                          </div>
                          <button
                            onClick={() => serveCustomer(i)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold transition-all"
                          >
                            🍺 Servir
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 italic">
                          "{CUSTOMER_COMPLAINTS[Math.floor(Math.random() * CUSTOMER_COMPLAINTS.length)]}"
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4 border-t border-gray-700/50">
                    <div className="text-2xl font-bold text-amber-400">{taproomScore} pts</div>
                    <div className="text-sm text-gray-400">Pontuação do dia</div>
                    <button
                      onClick={() => { setTaproomActive(false); setMoney(prev => prev + taproomScore); }}
                      className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all"
                    >
                      🌙 Fechar o Taproom
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🍻</div>
                  <p className="text-gray-400">Abra o taproom para atender clientes e ganhar dinheiro!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {recipes.length === 0 ? "⚠️ Crie receitas primeiro para ter o que servir" : `✅ ${recipes.length} receitas disponíveis para servir`}
                  </p>
                </div>
              )}
            </div>

            {/* Customer Feedback */}
            {customers.length > 0 && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">💬 Feedback dos Clientes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customers.filter(c => c.satisfaction > 0).map((c, i) => (
                    <div key={i} className={`p-3 rounded-lg ${c.satisfaction > 70 ? "bg-green-900/20 border border-green-500/20" : c.satisfaction > 40 ? "bg-yellow-900/20 border border-yellow-500/20" : "bg-red-900/20 border border-red-500/20"}`}>
                      <div className="flex items-center gap-2">
                        <span>{c.satisfaction > 70 ? "⭐" : c.satisfaction > 40 ? "😐" : "😞"}</span>
                        <span className="font-medium text-sm">{c.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{c.satisfaction}%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.satisfaction > 80 ? "Melhor cervejaria da cidade!" :
                         c.satisfaction > 60 ? "Muito bom, voltarei!" :
                         c.satisfaction > 40 ? "Nada mal, mas pode melhorar." :
                         "Esperava mais..."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== RECIPES TAB ==================== */}
        {activeTab === "recipes" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  📖 Diário de Receitas
                </span>
              </h2>
              <p className="text-gray-400">Seu acervo de criações cervejeiras</p>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-gray-400">Nenhuma receita ainda</h3>
                <p className="text-gray-500 mt-2">Vá até a aba Brassagem para criar sua primeira cerveja!</p>
                <button
                  onClick={() => setActiveTab("brewing")}
                  className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition-all"
                >
                  🍺 Ir para Brassagem
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe, i) => (
                  <div key={recipe.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{recipe.name}</h3>
                        <p className="text-sm text-amber-400">{recipe.style}</p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-600"
                        style={{ backgroundColor: `hsl(${30 - recipe.srm}, 80%, ${60 - recipe.srm}%)` }}
                        title={`SRM: ${recipe.srm}`}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-400">{recipe.quality}</div>
                        <div className="text-xs text-gray-500">Qualidade</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{recipe.abv}%</div>
                        <div className="text-xs text-gray-500">ABV</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{recipe.ibu}</div>
                        <div className="text-xs text-gray-500">IBU</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex flex-wrap gap-1">
                        {recipe.malts.map((m) => (
                          <span key={m} className="px-2 py-0.5 bg-amber-900/30 text-amber-300 text-xs rounded-full">
                            🌾 {INGREDIENTS.find((i) => i.id === m)?.name}
                          </span>
                        ))}
                        {recipe.hops.map((h) => (
                          <span key={h} className="px-2 py-0.5 bg-green-900/30 text-green-300 text-xs rounded-full">
                            🌿 {INGREDIENTS.find((i) => i.id === h)?.name}
                          </span>
                        ))}
                        {recipe.adjuncts.map((a) => (
                          <span key={a} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded-full">
                            ✨ {INGREDIENTS.find((i) => i.id === a)?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">Lote #{i + 1} • Criado no dia {Math.floor(day / recipes.length * (i + 1))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TASTING TAB ==================== */}
        {activeTab === "tasting" && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  👅 Degustação
                </span>
              </h2>
              <p className="text-gray-400">Identifique os sabores e aprimore seu paladar</p>
            </div>

            {!tastingActive ? (
              <div className="space-y-6">
                {recipes.length > 0 ? (
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="font-bold text-lg mb-4">🍺 Selecione uma cerveja para degustar:</h3>
                    <div className="space-y-3">
                      {recipes.map((r) => (
                        <button
                          key={r.id}
                          onClick={startTasting}
                          className="w-full p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-left transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold">{r.name}</div>
                            <div className="text-sm text-gray-400">{r.style} • {r.abv}% ABV</div>
                          </div>
                          <div className="text-amber-400 font-bold">{r.quality}/100</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-800/30 rounded-2xl">
                    <div className="text-5xl mb-4">🍺</div>
                    <p className="text-gray-400">Crie receitas primeiro para poder degustar!</p>
                  </div>
                )}

                {/* Tasting Guide */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="font-bold text-lg mb-4">📋 Guia de Degustação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { step: "1", title: "Visual", desc: "Observe cor, claridade e retenção de espuma", icon: "👁️" },
                      { step: "2", title: "Aroma", desc: "Identifique notas de malte, lúpulo e fermentação", icon: "👃" },
                      { step: "3", title: "Sabor", desc: "Avalie doçura, amargor e acidez na língua", icon: "👅" },
                      { step: "4", title: "Sensação", desc: "Corpo, carbonatação e final (aftertaste)", icon: "🤲" },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                          <div className="font-bold text-sm">{s.title}</div>
                          <div className="text-xs text-gray-400">{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-8 border border-amber-500/30 text-center">
                  <div className="text-6xl mb-4">🍺</div>
                  <h3 className="text-xl font-bold text-amber-400">Degustando: {recipes[recipes.length - 1]?.name}</h3>
                  <p className="text-gray-400 mt-2">Identifique os sabores que você percebe nesta cerveja</p>
                </div>

                {/* Flavor Selection */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="font-bold mb-4">Quais sabores você identifica? (máx. 5)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tastingFlavors.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => addTastingNote(flavor)}
                        disabled={tastingNotes.includes(flavor) || tastingNotes.length >= 5}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          tastingNotes.includes(flavor)
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-500 disabled:opacity-50"
                        }`}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Notes */}
                {tastingNotes.length > 0 && (
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                    <h4 className="font-bold mb-3">Suas notas de degustação:</h4>
                    <div className="flex flex-wrap gap-2">
                      {tastingNotes.map((note) => (
                        <span key={note} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                          {note}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-amber-400">{tastingScore} pts</div>
                      <div className="text-sm text-gray-400">Pontuação de degustação</div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={finishTasting}
                    disabled={tastingNotes.length === 0}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                      tastingNotes.length > 0
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    ✅ Finalizar Degustação
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== EXPANSION TAB ==================== */}
        {activeTab === "expansion" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  🏭 Expansão
                </span>
              </h2>
              <p className="text-gray-400">Evolua sua cervejaria de garagem a império global</p>
            </div>

            {/* Current Level */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/30 text-center">
              <div className="text-5xl mb-2">{EXPANSION_LEVELS[expansionLevel].icon}</div>
              <h3 className="text-2xl font-bold text-amber-400">{EXPANSION_LEVELS[expansionLevel].name}</h3>
              <p className="text-gray-400 mt-1">Capacidade: {EXPANSION_LEVELS[expansionLevel].capacity.toLocaleString()} litros/mês</p>
            </div>

            {/* Progression Tree */}
            <div className="space-y-4">
              {EXPANSION_LEVELS.map((level, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    i === expansionLevel
                      ? "border-amber-500 bg-amber-500/10"
                      : i < expansionLevel
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-gray-700 bg-gray-800/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    i <= expansionLevel ? "bg-amber-500/20" : "bg-gray-700"
                  }`}>
                    {i < expansionLevel ? "✅" : level.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{level.name}</h4>
                    <p className="text-sm text-gray-400">Capacidade: {level.capacity.toLocaleString()}L/mês</p>
                  </div>
                  <div className="text-right">
                    {i > expansionLevel && (
                      <div className="text-amber-400 font-bold">R$ {level.cost.toLocaleString()}</div>
                    )}
                    {i === expansionLevel + 1 && (
                      <button
                        onClick={expandBrewery}
                        disabled={money < level.cost}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          money >= level.cost
                            ? "bg-amber-600 hover:bg-amber-500"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {money >= level.cost ? "🚀 Expandir!" : "💸 Sem fundos"}
                      </button>
                    )}
                    {i <= expansionLevel && i !== expansionLevel && (
                      <span className="text-green-400 text-sm">✅ Concluído</span>
                    )}
                    {i === expansionLevel && (
                      <span className="text-amber-400 text-sm font-bold">⭐ Atual</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Decisions */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4">⚖️ Decisões Estratégicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Automatização vs. Artesanal", desc: "Investir em tecnologia ou manter o método tradicional?", icon: "⚙️" },
                  { title: "Linha de Produtos", desc: "Expandir para kombucha, destilados ou cerveja sem álcool?", icon: "🧪" },
                  { title: "Fornecedores", desc: "Lúpulo local (barato) ou importado (qualidade)?", icon: "🌾" },
                  { title: "Colaborações", desc: "Parcerias com outras cervejarias para receitas especiais", icon: "🤝" },
                ].map((d, i) => (
                  <div key={i} className="p-4 bg-gray-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{d.icon}</span>
                      <h4 className="font-bold text-sm">{d.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== EVENTS TAB ==================== */}
        {activeTab === "events" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  🎭 Eventos & Conflitos
                </span>
              </h2>
              <p className="text-gray-400">Decisões que moldam o destino da sua cervejaria</p>
            </div>

            {/* Event Modal */}
            {currentEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-amber-500/30 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">{currentEvent.icon}</div>
                    <h3 className="text-xl font-bold">{currentEvent.title}</h3>
                    <p className="text-gray-400 mt-2">{currentEvent.description}</p>
                  </div>
                  <div className="space-y-3">
                    {currentEvent.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleEventChoice(i)}
                        className="w-full p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-amber-500/50 rounded-xl text-left transition-all"
                      >
                        <div className="font-medium">{choice.text}</div>
                        <div className="text-xs text-gray-500 mt-1">{choice.effect}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trigger Event Button */}
            <div className="text-center">
              <button
                onClick={triggerEvent}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                🎲 Gerar Evento Aleatório
              </button>
            </div>

            {/* All Events Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GAME_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    event.type === "positive"
                      ? "border-green-500/30 bg-green-500/5"
                      : event.type === "negative"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-blue-500/30 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{event.icon}</span>
                    <div>
                      <h4 className="font-bold">{event.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          event.type === "positive" ? "bg-green-500/20 text-green-400" :
                          event.type === "negative" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {event.type === "positive" ? "Positivo" : event.type === "negative" ? "Negativo" : "Neutro"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Event Log */}
            {eventLog.length > 0 && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">📜 Histórico de Decisões</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {eventLog.map((log, i) => (
                    <div key={i} className="p-3 bg-gray-700/30 rounded-lg text-sm text-gray-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4">🏆 Todas as Conquistas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border ${
                      a.unlocked ? "border-amber-500/50 bg-amber-500/10" : "border-gray-700 bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl ${a.unlocked ? "" : "grayscale opacity-50"}`}>{a.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold ${a.unlocked ? "text-amber-400" : "text-gray-400"}`}>{a.title}</div>
                        <div className="text-xs text-gray-500">{a.description}</div>
                        <ProgressBar value={a.progress} max={a.max} color={a.unlocked ? "bg-amber-500" : "bg-gray-600"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🍺</span>
            <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              BrewLife
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            O simulador de vida de cervejeiro mais completo do mundo.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Conceito de jogo • Craft + Gestão + Narrativa
          </p>
        </div>
      </footer>
    </div>
  );
}
