import { useState, useEffect, useRef, useCallback } from "react";

// ==================== TYPES ====================
type Room = "entrance" | "receiving" | "milling" | "brewing" | "fermentation" | "maturation" | "packaging" | "taproom" | "office" | "storage";
type GameMode = "world" | "brewing" | "fermenting" | "taproom" | "office" | "packaging" | "cleaning" | "tasting" | "event";

interface Position { x: number; y: number; }
interface InteractableObject {
  id: string;
  room: Room;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  icon: string;
  action: GameMode;
  color: string;
}

interface Notification { id: number; text: string; type: "success" | "warning" | "info"; }
interface Beer { id: string; name: string; style: string; quality: number; abv: number; color: string; stage: "brewing" | "fermenting" | "maturing" | "ready"; progress: number; }
interface Customer { id: number; name: string; mood: string; order: string; patience: number; served: boolean; tip: number; }

// ==================== GAME DATA ====================
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;
const PLAYER_SPEED = 4;
const INTERACT_DISTANCE = 60;

const ROOMS: Record<Room, { x: number; y: number; w: number; h: number; name: string; floor: string; wallColor: string }> = {
  entrance: { x: 1100, y: 1500, w: 200, h: 200, name: "Entrada", floor: "tile-concrete", wallColor: "#8b4513" },
  receiving: { x: 100, y: 100, w: 400, h: 350, name: "Recebimento", floor: "tile-concrete", wallColor: "#654321" },
  milling: { x: 100, y: 500, w: 400, h: 350, name: "Moagem", floor: "tile-wood", wallColor: "#5c3a1e" },
  brewing: { x: 600, y: 100, w: 600, h: 500, name: "Sala de Brassagem", floor: "tile-metal", wallColor: "#4b5563" },
  fermentation: { x: 1300, y: 100, w: 500, h: 500, name: "Fermentação", floor: "tile-metal", wallColor: "#374151" },
  maturation: { x: 1300, y: 700, w: 500, h: 400, name: "Maturação", floor: "tile-metal", wallColor: "#1f2937" },
  packaging: { x: 600, y: 700, w: 600, h: 400, name: "Envase", floor: "tile-concrete", wallColor: "#4b5563" },
  taproom: { x: 100, y: 1200, w: 900, h: 500, name: "Taproom", floor: "tile-wood", wallColor: "#8b4513" },
  office: { x: 1900, y: 100, w: 400, h: 350, name: "Escritório", floor: "tile-wood", wallColor: "#654321" },
  storage: { x: 1900, y: 550, w: 400, h: 550, name: "Estoque", floor: "tile-concrete", wallColor: "#4b5563" },
};

const OBJECTS: InteractableObject[] = [
  { id: "malt-delivery", room: "receiving", x: 180, y: 180, width: 80, height: 60, name: "Entrega de Malte", icon: "🌾", action: "world", color: "#d97706" },
  { id: "hop-delivery", room: "receiving", x: 300, y: 180, width: 80, height: 60, name: "Entrega de Lúpulo", icon: "🌿", action: "world", color: "#16a34a" },
  { id: "mill", room: "milling", x: 220, y: 620, width: 120, height: 120, name: "Moinho", icon: "⚙️", action: "world", color: "#6b7280" },
  { id: "mash-tun", room: "brewing", x: 700, y: 200, width: 140, height: 140, name: "Panela de Mostura", icon: "🍲", action: "brewing", color: "#b45309" },
  { id: "brew-kettle", room: "brewing", x: 920, y: 200, width: 140, height: 140, name: "Panela de Fervura", icon: "🔥", action: "brewing", color: "#dc2626" },
  { id: "whirlpool", room: "brewing", x: 810, y: 400, width: 120, height: 120, name: "Whirlpool", icon: "🌀", action: "brewing", color: "#0891b2" },
  { id: "fermenter-1", room: "fermentation", x: 1400, y: 200, width: 100, height: 140, name: "Fermentador 1", icon: "🛢️", action: "fermenting", color: "#9ca3af" },
  { id: "fermenter-2", room: "fermentation", x: 1550, y: 200, width: 100, height: 140, name: "Fermentador 2", icon: "🛢️", action: "fermenting", color: "#9ca3af" },
  { id: "fermenter-3", room: "fermentation", x: 1400, y: 380, width: 100, height: 140, name: "Fermentador 3", icon: "🛢️", action: "fermenting", color: "#9ca3af" },
  { id: "fermenter-4", room: "fermentation", x: 1550, y: 380, width: 100, height: 140, name: "Fermentador 4", icon: "🛢️", action: "fermenting", color: "#9ca3af" },
  { id: "mat-tank-1", room: "maturation", x: 1400, y: 800, width: 120, height: 150, name: "Tanque de Maturação", icon: "❄️", action: "world", color: "#60a5fa" },
  { id: "mat-tank-2", room: "maturation", x: 1580, y: 800, width: 120, height: 150, name: "Tanque de Maturação 2", icon: "❄️", action: "world", color: "#60a5fa" },
  { id: "bottling", room: "packaging", x: 700, y: 800, width: 180, height: 100, name: "Engarrafadora", icon: "🍶", action: "packaging", color: "#7c3aed" },
  { id: "canning", room: "packaging", x: 950, y: 800, width: 150, height: 100, name: "Enlatadeira", icon: "🥫", action: "packaging", color: "#dc2626" },
  { id: "tap-counter", room: "taproom", x: 400, y: 1300, width: 300, height: 80, name: "Balcão do Taproom", icon: "🍺", action: "taproom", color: "#92400e" },
  { id: "table-1", room: "taproom", x: 200, y: 1450, width: 80, height: 80, name: "Mesa 1", icon: "🪑", action: "taproom", color: "#78350f" },
  { id: "table-2", room: "taproom", x: 350, y: 1450, width: 80, height: 80, name: "Mesa 2", icon: "🪑", action: "taproom", color: "#78350f" },
  { id: "table-3", room: "taproom", x: 600, y: 1450, width: 80, height: 80, name: "Mesa 3", icon: "🪑", action: "taproom", color: "#78350f" },
  { id: "table-4", room: "taproom", x: 750, y: 1450, width: 80, height: 80, name: "Mesa 4", icon: "🪑", action: "taproom", color: "#78350f" },
  { id: "computer", room: "office", x: 2050, y: 200, width: 100, height: 80, name: "Computador", icon: "💻", action: "office", color: "#1e40af" },
  { id: "phone", room: "office", x: 2200, y: 200, width: 60, height: 60, name: "Telefone", icon: "📞", action: "office", color: "#111827" },
  { id: "shelf-1", room: "storage", x: 1980, y: 650, width: 100, height: 200, name: "Prateleira 1", icon: "📦", action: "world", color: "#78350f" },
  { id: "shelf-2", room: "storage", x: 2150, y: 650, width: 100, height: 200, name: "Prateleira 2", icon: "📦", action: "world", color: "#78350f" },
  { id: "cleaning-station", room: "brewing", x: 1050, y: 420, width: 100, height: 100, name: "Estação de Limpeza", icon: "🧽", action: "cleaning", color: "#06b6d4" },
];

const BEER_STYLES = [
  { name: "Pilsner", color: "#fbbf24", abv: [4, 5.5] },
  { name: "IPA", color: "#d97706", abv: [5.5, 7.5] },
  { name: "Stout", color: "#1c1917", abv: [4.5, 7] },
  { name: "Wheat Beer", color: "#fde68a", abv: [4, 5.5] },
  { name: "Porter", color: "#451a03", abv: [4, 6] },
  { name: "Belgian Ale", color: "#ea580c", abv: [6, 9] },
  { name: "Sour", color: "#c2410c", abv: [3, 6] },
  { name: "Lager", color: "#fcd34d", abv: [4, 5.5] },
];

const CUSTOMER_NAMES = ["João", "Maria", "Pedro", "Ana", "Carlos", "Julia", "Rafael", "Beatriz", "Lucas", "Fernanda"];
const CUSTOMER_MOODS = ["😊", "😐", "🤔", "🎉", "😴"];

// ==================== COMPONENTS ====================

function Player({ position, direction, isMoving, level }: { position: Position; direction: string; isMoving: boolean; level: number }) {
  const getRotation = () => {
    switch (direction) {
      case "up": return "rotate(180deg)";
      case "down": return "rotate(0deg)";
      case "left": return "rotate(90deg)";
      case "right": return "rotate(-90deg)";
      default: return "rotate(0deg)";
    }
  };

  return (
    <div
      className={`absolute z-30 transition-transform duration-75 ${isMoving ? "animate-walk" : ""}`}
      style={{
        left: position.x - 20,
        top: position.y - 30,
        transform: getRotation(),
      }}
    >
      {/* Player shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/30 rounded-full blur-sm" />
      
      {/* Body */}
      <div className="relative">
        {/* Hat */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-amber-800 rounded-t-full border-b-2 border-amber-900" />
        
        {/* Head */}
        <div className="w-10 h-10 bg-amber-200 rounded-full border-2 border-amber-900 relative mx-auto">
          {/* Eyes */}
          <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-gray-900 rounded-full" />
          <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-gray-900 rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-gray-900 rounded-b-full" />
          {/* Beard */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-amber-800 rounded-b-full" />
        </div>
        
        {/* Body/Shirt */}
        <div className="w-12 h-14 bg-amber-600 rounded-lg mx-auto -mt-1 border-2 border-amber-800 relative">
          {/* Apron */}
          <div className="absolute inset-x-1 top-2 bottom-1 bg-amber-100 rounded border border-amber-300">
            <div className="text-center text-xs mt-2">🍺</div>
          </div>
        </div>
        
        {/* Legs */}
        <div className="flex justify-center gap-1 -mt-0.5">
          <div className={`w-4 h-5 bg-blue-900 rounded-b ${isMoving ? "animate-pulse" : ""}`} />
          <div className={`w-4 h-5 bg-blue-900 rounded-b ${isMoving ? "animate-pulse" : ""}`} style={{ animationDelay: "0.2s" }} />
        </div>
        
        {/* Level badge */}
        {level > 1 && (
          <div className="absolute -top-4 -right-2 w-5 h-5 bg-yellow-500 rounded-full border border-yellow-700 flex items-center justify-center text-[8px] font-bold text-yellow-900">
            {level}
          </div>
        )}
      </div>
    </div>
  );
}

function Room({ room, expansionLevel }: { room: typeof ROOMS[Room]; expansionLevel: number }) {
  return (
    <div
      className={`absolute ${room.floor} border-4 rounded-sm overflow-hidden`}
      style={{
        left: room.x,
        top: room.y,
        width: room.w,
        height: room.h,
        borderColor: room.wallColor,
      }}
    >
      {/* Room name label */}
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-amber-300 font-bold z-10">
        {room.name}
      </div>
      
      {/* Room decorations based on type */}
      {room.name === "Taproom" && (
        <>
          <div className="absolute bottom-4 left-4 right-4 h-1 bg-amber-900/50" />
          <div className="absolute top-8 right-4 text-2xl opacity-50">🎵</div>
          <div className="absolute top-8 left-1/2 text-2xl opacity-50">💡</div>
        </>
      )}
      
      {room.name === "Sala de Brassagem" && (
        <>
          {/* Steam effects */}
          <div className="absolute top-10 left-1/4 w-4 h-8 bg-white/20 rounded-full animate-steam" />
          <div className="absolute top-10 left-2/4 w-4 h-8 bg-white/20 rounded-full animate-steam" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-10 left-3/4 w-4 h-8 bg-white/20 rounded-full animate-steam" style={{ animationDelay: "1s" }} />
        </>
      )}
      
      {room.name === "Fermentação" && (
        <>
          {/* Bubbles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300/40 rounded-full animate-bubble"
              style={{
                left: `${20 + Math.random() * 60}%`,
                bottom: `${10 + Math.random() * 30}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

function Interactable({ obj, playerPos, onInteract }: { obj: InteractableObject; playerPos: Position; onInteract: (obj: InteractableObject) => void }) {
  const dx = playerPos.x - (obj.x + obj.width / 2);
  const dy = playerPos.y - (obj.y + obj.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const isNear = distance < INTERACT_DISTANCE;

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 ${isNear ? "scale-110 z-20" : "z-10"}`}
      style={{
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
      }}
      onClick={() => isNear && onInteract(obj)}
    >
      {/* Object visual */}
      <div
        className="w-full h-full rounded-lg flex items-center justify-center relative border-2 transition-all"
        style={{
          backgroundColor: obj.color + "40",
          borderColor: isNear ? "#fbbf24" : obj.color,
          boxShadow: isNear ? "0 0 20px rgba(251, 191, 36, 0.5)" : "none",
        }}
      >
        <span className="text-3xl">{obj.icon}</span>
        
        {/* Interaction prompt */}
        {isNear && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in">
            <div className="bg-black/90 px-3 py-1.5 rounded-lg border border-amber-500 text-xs text-amber-300 font-bold flex items-center gap-1">
              <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px]">E</span>
              {obj.name}
            </div>
            <div className="w-2 h-2 bg-black/90 border-r border-b border-amber-500 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45" />
          </div>
        )}
        
        {/* Glow ring when near */}
        {isNear && (
          <div className="absolute inset-0 rounded-lg border-2 border-amber-400 animate-pulse-ring" />
        )}
      </div>
    </div>
  );
}

function HUD({ money, reputation, day, season, beers, level }: { money: number; reputation: number; day: number; season: string; beers: Beer[]; level: number }) {
  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex items-start justify-between pointer-events-none">
      {/* Left stats */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-amber-500/30 flex items-center gap-3">
          <span className="text-amber-400 font-bold">💰 R${money.toLocaleString()}</span>
          <span className="text-green-400 font-bold">⭐ {reputation}</span>
          <span className="text-blue-400 font-bold">📅 Dia {day}</span>
          <span className="text-purple-400 font-bold">🏭 Nv.{level}</span>
        </div>
        <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs text-amber-300">
          🍺 Cervejas em produção: {beers.filter(b => b.stage !== "ready").length} | Prontas: {beers.filter(b => b.stage === "ready").length}
        </div>
      </div>
      
      {/* Right - season & controls */}
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-500/30 text-sm text-amber-300">
          {season === "Primavera" ? "🌸" : season === "Verão" ? "☀️" : season === "Outono" ? "🍂" : "❄️"} {season}
        </div>
        <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs text-gray-400">
          WASD/Setas: Mover | E: Interagir
        </div>
      </div>
    </div>
  );
}

function Minimap({ playerPos, rooms }: { playerPos: Position; rooms: typeof ROOMS }) {
  const scale = 0.08;
  return (
    <div className="absolute bottom-4 right-4 z-50 bg-black/80 backdrop-blur rounded-lg border border-amber-500/30 p-2">
      <div className="relative" style={{ width: WORLD_WIDTH * scale, height: WORLD_HEIGHT * scale }}>
        {Object.values(rooms).map((room, i) => (
          <div
            key={i}
            className="absolute bg-amber-900/50 border border-amber-700/50"
            style={{
              left: room.x * scale,
              top: room.y * scale,
              width: room.w * scale,
              height: room.h * scale,
            }}
          />
        ))}
        {/* Player dot */}
        <div
          className="absolute w-2 h-2 bg-amber-400 rounded-full animate-pulse"
          style={{
            left: playerPos.x * scale - 4,
            top: playerPos.y * scale - 4,
          }}
        />
      </div>
    </div>
  );
}

function Notifications({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="absolute top-20 right-4 z-50 space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`animate-notification px-4 py-2 rounded-lg border text-sm font-medium ${
            n.type === "success" ? "bg-green-900/90 border-green-500/50 text-green-300" :
            n.type === "warning" ? "bg-amber-900/90 border-amber-500/50 text-amber-300" :
            "bg-blue-900/90 border-blue-500/50 text-blue-300"
          }`}
        >
          {n.text}
        </div>
      ))}
    </div>
  );
}

// ==================== INTERACTION MODALS ====================

function BrewingModal({ onClose, onBrew, money }: { onClose: () => void; onBrew: (beer: Beer) => void; money: number }) {
  const [stage, setStage] = useState(0);
  const [temp, setTemp] = useState(25);
  const [targetTemp, setTargetTemp] = useState(65);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [beerName, setBeerName] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalBeer, setFinalBeer] = useState<Beer | null>(null);

  const stages = [
    { name: "Mostura", target: 65, desc: "Converter amido em açúcar" },
    { name: "Mash Out", target: 76, desc: "Parar conversão enzimática" },
    { name: "Fervura", target: 100, desc: "Adicionar lúpulo" },
    { name: "Whirlpool", target: 80, desc: "Separar trub" },
    { name: "Resfriamento", target: 20, desc: "Preparar para fermentação" },
  ];

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const diff = Math.abs(temp - targetTemp);
          const stageScore = Math.max(0, 20 - diff * 2);
          setScore((s) => s + stageScore);
          
          if (stage < stages.length - 1) {
            setStage((s) => s + 1);
            setTargetTemp(stages[stage + 1].target);
            return 20;
          } else {
            // Finish
            const finalScore = score + stageScore;
            const quality = Math.min(100, Math.round(finalScore + Math.random() * 20));
            const style = BEER_STYLES[Math.floor(Math.random() * BEER_STYLES.length)];
            const beer: Beer = {
              id: Date.now().toString(),
              name: beerName || `Lote #${Date.now().toString().slice(-4)}`,
              style: selectedStyle || style.name,
              quality,
              abv: parseFloat((style.abv[0] + Math.random() * (style.abv[1] - style.abv[0])).toFixed(1)),
              color: style.color,
              stage: "fermenting",
              progress: 0,
            };
            setFinalBeer(beer);
            setFinished(true);
            clearInterval(interval);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished, stage, temp, targetTemp]);

  if (finished && finalBeer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-amber-500/30 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="text-6xl">🍺</div>
            <h2 className="text-2xl font-bold text-amber-400">Brassagem Concluída!</h2>
            <div className="bg-black/40 rounded-xl p-4 space-y-2">
              <div className="text-xl font-bold">{finalBeer.name}</div>
              <div className="text-sm text-amber-300">{finalBeer.style}</div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{finalBeer.quality}/100</div>
                  <div className="text-xs text-gray-400">Qualidade</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{finalBeer.abv}%</div>
                  <div className="text-xs text-gray-400">ABV</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full mx-auto border-2 border-gray-600" style={{ backgroundColor: finalBeer.color }} />
                  <div className="text-xs text-gray-400 mt-1">Cor</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400">Sua cerveja agora está fermentando!</p>
            <div className="flex gap-3">
              <button onClick={() => { onBrew(finalBeer); onClose(); }} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all">
                ✅ Colher resultado
              </button>
              <button onClick={onClose} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-amber-500/30 animate-slide-up">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🍲</div>
            <h2 className="text-2xl font-bold text-amber-400">Sala de Brassagem</h2>
            <p className="text-gray-400 text-sm mt-2">Crie uma nova cerveja controlando a temperatura em cada etapa</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Nome da Cerveja</label>
              <input
                type="text"
                value={beerName}
                onChange={(e) => setBeerName(e.target.value)}
                placeholder="Ex: Golden Horizon"
                className="w-full mt-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Estilo</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-amber-500 focus:outline-none text-white"
              >
                <option value="">Aleatório</option>
                {BEER_STYLES.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 bg-black/30 p-3 rounded-lg">
              💡 Dica: Mantenha a temperatura próxima do alvo para maximizar a qualidade!
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { if (money >= 500) { setStarted(true); } }}
                disabled={money < 500}
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${money >= 500 ? "bg-amber-600 hover:bg-amber-500" : "bg-gray-700 text-gray-500"}`}
              >
                🔥 Iniciar (R$500)
              </button>
              <button onClick={onClose} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = stages[stage];
  const diff = Math.abs(temp - targetTemp);
  const accuracy = diff <= 2 ? "Perfeito!" : diff <= 5 ? "Bom" : diff <= 10 ? "Regular" : "Ruim";
  const accuracyColor = diff <= 2 ? "text-green-400" : diff <= 5 ? "text-yellow-400" : diff <= 10 ? "text-orange-400" : "text-red-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-lg w-full border border-amber-500/30 animate-slide-up">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-amber-400">{currentStage.name}</h3>
          <p className="text-sm text-gray-400">{currentStage.desc}</p>
        </div>

        {/* Stage progress */}
        <div className="flex gap-1 mb-4">
          {stages.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i < stage ? "bg-green-500" : i === stage ? "bg-amber-500 animate-pulse" : "bg-gray-700"}`} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-2xl font-mono font-bold text-amber-400">{timeLeft}s</div>
            <div className="text-xs text-gray-500">Tempo</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-2xl font-mono font-bold text-green-400">{score}</div>
            <div className="text-xs text-gray-500">Pontos</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className={`text-2xl font-mono font-bold ${accuracyColor}`}>{accuracy}</div>
            <div className="text-xs text-gray-500">Precisão</div>
          </div>
        </div>

        {/* Temperature visual */}
        <div className="bg-black/40 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Alvo: <span className="text-green-400 font-bold">{targetTemp}°C</span></span>
            <span className="text-sm text-gray-400">Atual: <span className="text-amber-400 font-bold">{temp}°C</span></span>
          </div>
          
          {/* Temperature bar */}
          <div className="relative h-8 bg-gradient-to-r from-blue-600 via-green-500 via-yellow-500 to-red-600 rounded-full overflow-hidden">
            {/* Target zone */}
            <div
              className="absolute top-0 h-full bg-white/30 border-x-2 border-white"
              style={{
                left: `${(targetTemp - 10) / 110 * 100}%`,
                width: `${20 / 110 * 100}%`,
              }}
            />
            {/* Current indicator */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg shadow-white/50 transition-all duration-200"
              style={{ left: `${(temp - 10) / 110 * 100}%` }}
            />
          </div>
          
          {/* Visual thermometer */}
          <div className="flex items-center justify-center mt-3 gap-2">
            <div className="text-3xl">🌡️</div>
            <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${diff <= 2 ? "bg-green-500" : diff <= 5 ? "bg-yellow-500" : diff <= 10 ? "bg-orange-500" : "bg-red-500"}`}
                style={{ width: `${Math.max(0, 100 - diff * 5)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setTemp((t) => Math.max(10, t - 3))}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all active:scale-95"
          >
            ❄️ -3°C
          </button>
          <button
            onClick={() => setTemp((t) => Math.max(10, t - 1))}
            className="flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-600 rounded-xl font-bold transition-all active:scale-95"
          >
            🧊 -1°C
          </button>
          <button
            onClick={() => setTemp((t) => Math.min(110, t + 1))}
            className="flex-1 px-4 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold transition-all active:scale-95"
          >
            🔥 +1°C
          </button>
          <button
            onClick={() => setTemp((t) => Math.min(110, t + 3))}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all active:scale-95"
          >
            🔥🔥 +3°C
          </button>
        </div>

        {/* Visual effects */}
        <div className="mt-4 h-20 bg-black/30 rounded-xl relative overflow-hidden">
          {temp > 90 && (
            <>
              <div className="absolute bottom-0 left-1/4 w-3 h-6 bg-white/20 rounded-full animate-steam" />
              <div className="absolute bottom-0 left-1/2 w-3 h-6 bg-white/20 rounded-full animate-steam" style={{ animationDelay: "0.3s" }} />
              <div className="absolute bottom-0 left-3/4 w-3 h-6 bg-white/20 rounded-full animate-steam" style={{ animationDelay: "0.6s" }} />
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-xl" style={{ backgroundColor: temp > 50 ? "#b45309" : "#78350f", transition: "background-color 0.5s" }}>
            {temp > 70 && <div className="absolute inset-0 animate-boil bg-gradient-to-t from-orange-600/50 to-transparent" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaproomModal({ onClose, beers, onServe, money, reputation }: { onClose: () => void; beers: Beer[]; onServe: () => void; money: number; reputation: number }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [served, setServed] = useState(0);
  const [tips, setTips] = useState(0);

  useEffect(() => {
    const newCustomers: Customer[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      mood: CUSTOMER_MOODS[Math.floor(Math.random() * CUSTOMER_MOODS.length)],
      order: beers.length > 0 ? beers[Math.floor(Math.random() * beers.length)].name : "Pilsen da casa",
      patience: 100,
      served: false,
      tip: 10 + Math.floor(Math.random() * 30),
    }));
    setCustomers(newCustomers);
  }, []);

  const serveCustomer = (id: number) => {
    if (beers.length === 0) return;
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, served: true } : c));
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setTips((prev) => prev + customer.tip);
      setServed((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-amber-950 to-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-amber-500/30 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">🍻 Taproom</h2>
            <p className="text-sm text-gray-400">Atenda os clientes e ganhe gorjetas!</p>
          </div>
          <div className="text-right">
            <div className="text-amber-400 font-bold">💰 R${tips}</div>
            <div className="text-sm text-gray-400">{served} servidos</div>
          </div>
        </div>

        {/* Taproom visual */}
        <div className="bg-amber-900/20 rounded-xl p-4 mb-6 border border-amber-800/30">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl">🍺</div>
            <div className="text-4xl">🍺</div>
            <div className="text-4xl">🍺</div>
            <div className="text-4xl">🍺</div>
          </div>
          <div className="h-2 bg-amber-800 rounded-full mb-2" />
          <div className="text-center text-xs text-amber-300">— Balcão —</div>
        </div>

        {/* Customers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`p-4 rounded-xl border-2 transition-all animate-client-enter ${
                customer.served
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-gray-800/50 border-gray-700/50 hover:border-amber-500/30"
              }`}
              style={{ animationDelay: `${customer.id * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{customer.mood}</span>
                    <span className="font-bold">{customer.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Pedido: <span className="text-amber-400">{customer.order}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Gorjeta</div>
                  <div className="text-amber-400 font-bold">R${customer.tip}</div>
                </div>
              </div>
              {!customer.served ? (
                <button
                  onClick={() => serveCustomer(customer.id)}
                  disabled={beers.length === 0}
                  className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    beers.length > 0
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-gray-700 text-gray-500"
                  }`}
                >
                  🍺 Servir
                </button>
              ) : (
                <div className="mt-3 text-center text-green-400 text-sm font-bold">✅ Servido!</div>
              )}
            </div>
          ))}
        </div>

        {beers.length === 0 && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center text-sm text-red-300">
            ⚠️ Você não tem cervejas prontas! Vá até a brassagem primeiro.
          </div>
        )}

        <button onClick={onClose} className="w-full mt-6 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
          🚪 Fechar Taproom
        </button>
      </div>
    </div>
  );
}

function FermentationModal({ onClose, beers }: { onClose: () => void; beers: Beer[] }) {
  const fermenting = beers.filter((b) => b.stage === "fermenting" || b.stage === "maturing");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-lg w-full border border-amber-500/30 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🛢️</div>
          <h2 className="text-2xl font-bold text-amber-400">Sala de Fermentação</h2>
          <p className="text-sm text-gray-400">Monitore a fermentação das suas cervejas</p>
        </div>

        {/* Visual tanks */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((tank) => {
            const beer = fermenting[tank - 1];
            return (
              <div key={tank} className="relative">
                {/* Tank visual */}
                <div className="bg-gray-700 rounded-t-full rounded-b-lg h-40 border-2 border-gray-500 relative overflow-hidden">
                  {beer && (
                    <>
                      {/* Liquid */}
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                        style={{
                          height: `${beer.progress}%`,
                          backgroundColor: beer.color,
                          opacity: 0.8,
                        }}
                      />
                      {/* Bubbles */}
                      {beer.stage === "fermenting" && (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1.5 h-1.5 bg-white/40 rounded-full animate-bubble"
                              style={{
                                left: `${20 + Math.random() * 60}%`,
                                bottom: `${beer.progress * 0.8}%`,
                                animationDelay: `${Math.random() * 2}s`,
                              }}
                            />
                          ))}
                        </>
                      )}
                      {/* Label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 px-2 py-1 rounded text-xs text-center">
                          <div className="font-bold text-amber-300">{beer.name}</div>
                          <div className="text-gray-400">{beer.progress}%</div>
                        </div>
                      </div>
                    </>
                  )}
                  {!beer && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                      Vazio
                    </div>
                  )}
                </div>
                {/* Tank legs */}
                <div className="flex justify-between px-4">
                  <div className="w-2 h-4 bg-gray-600" />
                  <div className="w-2 h-4 bg-gray-600" />
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">Tanque {tank}</div>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
          Fechar
        </button>
      </div>
    </div>
  );
}

function OfficeModal({ onClose, money, setMoney, reputation, setReputation, day, setDay, setSeason, addNotification }: {
  onClose: () => void;
  money: number;
  setMoney: (fn: (prev: number) => number) => void;
  reputation: number;
  setReputation: (fn: (prev: number) => number) => void;
  day: number;
  setDay: (fn: (prev: number) => number) => void;
  setSeason: (s: string) => void;
  addNotification: (text: string, type: "success" | "warning" | "info") => void;
}) {
  const seasons = ["Primavera", "Verão", "Outono", "Inverno"];
  const [activeSection, setActiveSection] = useState<"finance" | "marketing" | "time">("finance");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-lg w-full border border-amber-500/30 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">💻</div>
          <h2 className="text-2xl font-bold text-amber-400">Escritório</h2>
          <p className="text-sm text-gray-400">Gerencie sua cervejaria</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-4">
          {(["finance", "marketing", "time"] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeSection === section ? "bg-amber-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
            >
              {section === "finance" ? "💰 Finanças" : section === "marketing" ? "📢 Marketing" : "⏰ Tempo"}
            </button>
          ))}
        </div>

        <div className="bg-black/30 rounded-xl p-4 space-y-3">
          {activeSection === "finance" && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Caixa atual:</span>
                <span className="text-amber-400 font-bold text-lg">R${money.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reputação:</span>
                <span className="text-green-400 font-bold">{reputation}/100</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={() => {
                    setMoney((prev) => prev + 5000);
                    addNotification("💰 +R$5.000 de investimento!", "success");
                  }}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-all"
                >
                  💼 Receber pagamento de distribuidor (+R$5.000)
                </button>
              </div>
              <button
                onClick={() => {
                  setMoney((prev) => Math.max(0, prev - 2000));
                  addNotification("💸 -R$2.000 em despesas operacionais", "warning");
                }}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold transition-all"
              >
                📋 Pagar despesas (-R$2.000)
              </button>
            </>
          )}

          {activeSection === "marketing" && (
            <>
              <button
                onClick={() => {
                  if (money >= 1000) {
                    setMoney((prev) => prev - 1000);
                    setReputation((prev) => Math.min(100, prev + 5));
                    addNotification("📱 Marketing nas redes sociais! +5 reputação", "success");
                  }
                }}
                disabled={money < 1000}
                className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${money >= 1000 ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 text-gray-500"}`}
              >
                📱 Marketing nas Redes (R$1.000, +5 rep)
              </button>
              <button
                onClick={() => {
                  if (money >= 3000) {
                    setMoney((prev) => prev - 3000);
                    setReputation((prev) => Math.min(100, prev + 15));
                    addNotification("🎉 Evento promocional realizado! +15 rep", "success");
                  }
                }}
                disabled={money < 3000}
                className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${money >= 3000 ? "bg-purple-600 hover:bg-purple-500" : "bg-gray-700 text-gray-500"}`}
              >
                🎉 Organizar Evento (R$3.000, +15 rep)
              </button>
              <button
                onClick={() => {
                  if (money >= 5000) {
                    setMoney((prev) => prev - 5000);
                    setReputation((prev) => Math.min(100, prev + 25));
                    addNotification("🏆 Inscrição em concurso! +25 rep", "success");
                  }
                }}
                disabled={money < 5000}
                className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${money >= 5000 ? "bg-amber-600 hover:bg-amber-500" : "bg-gray-700 text-gray-500"}`}
              >
                🏆 Inscrever em Concurso (R$5.000, +25 rep)
              </button>
            </>
          )}

          {activeSection === "time" && (
            <>
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-amber-400">Dia {day}</div>
                <div className="text-gray-400">Estação: {seasons.includes(seasons[0]) ? "Primavera" : ""}</div>
              </div>
              <button
                onClick={() => {
                  setDay((prev) => {
                    const newDay = prev + 1;
                    if (newDay % 30 === 0) {
                      const currentIdx = seasons.indexOf("Primavera"); // simplified
                      const newSeason = seasons[(currentIdx + 1) % 4];
                      setSeason(newSeason);
                    }
                    return newDay;
                  });
                  addNotification("⏰ Um dia se passou!", "info");
                }}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all"
              >
                ⏭️ Avançar 1 dia
              </button>
              <button
                onClick={() => {
                  setDay((prev) => prev + 7);
                  addNotification("⏰ Uma semana se passou!", "info");
                }}
                className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold transition-all"
              >
                ⏭️ Avançar 7 dias
              </button>
            </>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
          Fechar
        </button>
      </div>
    </div>
  );
}

function CleaningModal({ onClose, onClean, cleanliness, setCleanliness }: {
  onClose: () => void;
  onClean: () => void;
  cleanliness: number;
  setCleanliness: (n: number) => void;
}) {
  const [spots, setSpots] = useState<{ id: number; x: number; y: number; cleaned: boolean }[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) {
      const newSpots = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        cleaned: false,
      }));
      setSpots(newSpots);
    }
  }, [started]);

  const cleanSpot = (id: number) => {
    setSpots((prev) => prev.map((s) => s.id === id ? { ...s, cleaned: true } : s));
    const cleanedCount = spots.filter((s) => s.id === id ? true : s.cleaned).length;
    if (cleanedCount === spots.length) {
      setCleanliness(100);
      onClean();
    }
  };

  const cleanedCount = spots.filter((s) => s.cleaned).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-cyan-950 to-gray-900 rounded-2xl p-6 max-w-lg w-full border border-cyan-500/30 animate-slide-up">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🧽</div>
          <h2 className="text-2xl font-bold text-cyan-400">Limpeza dos Tanques</h2>
          <p className="text-sm text-gray-400">Clique em todos os pontos de sujeira!</p>
        </div>

        {!started ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Higiene atual</div>
              <div className="text-3xl font-bold text-cyan-400">{cleanliness}%</div>
            </div>
            <button
              onClick={() => setStarted(true)}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all"
            >
              🧹 Iniciar Limpeza
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full h-64 bg-gray-900 rounded-xl border-2 border-cyan-500/30 overflow-hidden mb-4">
              {/* Tank background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl opacity-10">🛢️</div>
              </div>
              {/* Dirt spots */}
              {spots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => !spot.cleaned && cleanSpot(spot.id)}
                  className={`absolute w-8 h-8 rounded-full transition-all ${
                    spot.cleaned
                      ? "bg-green-500/30 scale-0"
                      : "bg-amber-800 hover:bg-amber-600 cursor-pointer animate-pulse scale-100"
                  }`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  {!spot.cleaned && <span className="text-sm">💩</span>}
                </button>
              ))}
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Progresso: {cleanedCount}/{spots.length}</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(cleanedCount / spots.length) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}

        <button onClick={onClose} className="w-full mt-4 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
          Fechar
        </button>
      </div>
    </div>
  );
}

function PackagingModal({ onClose, beers }: { onClose: () => void; beers: Beer[] }) {
  const readyBeers = beers.filter((b) => b.stage === "ready" || b.stage === "maturing");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-950 to-gray-900 rounded-2xl p-6 max-w-lg w-full border border-purple-500/30 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🍶</div>
          <h2 className="text-2xl font-bold text-purple-400">Sala de Envase</h2>
          <p className="text-sm text-gray-400">Engarrafe e enlatar suas cervejas</p>
        </div>

        {/* Conveyor belt visual */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 relative overflow-hidden">
          <div className="h-4 bg-gray-700 rounded-full mb-4 relative">
            <div className="absolute inset-0 flex animate-conveyor">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-6 h-4 bg-gray-600 border-r border-gray-500" />
              ))}
            </div>
          </div>
          
          {/* Bottles */}
          <div className="flex justify-center gap-2 flex-wrap">
            {readyBeers.slice(0, 8).map((beer, i) => (
              <div key={i} className="relative animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-6 h-16 rounded-b-lg relative" style={{ backgroundColor: beer.color }}>
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gray-400 rounded-t" />
                  <div className="absolute top-4 left-0 right-0 h-4 bg-white/80 text-[6px] text-center font-bold">
                    {beer.name.slice(0, 4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 mb-4">
          <div className="text-sm text-gray-400 mb-2">Cervejas prontas para envase:</div>
          {readyBeers.length > 0 ? (
            <div className="space-y-2">
              {readyBeers.map((beer) => (
                <div key={beer.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: beer.color }} />
                    <span className="text-sm">{beer.name}</span>
                  </div>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold transition-all">
                    🍶 Engarrafar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">
              Nenhuma cerveja pronta para envase
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all">
          Fechar
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1200, y: 1600 });
  const [direction, setDirection] = useState("down");
  const [isMoving, setIsMoving] = useState(false);
  const [camera, setCamera] = useState<Position>({ x: 0, y: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<GameMode | null>(null);
  const [money, setMoney] = useState(100000);
  const [reputation, setReputation] = useState(50);
  const [day, setDay] = useState(1);
  const [season, setSeason] = useState("Primavera");
  const [beers, setBeers] = useState<Beer[]>([]);
  const [expansionLevel, setExpansionLevel] = useState(1);
  const [cleanliness, setCleanliness] = useState(80);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);

  const keysRef = useRef(keys);
  keysRef.current = keys;

  const addNotification = useCallback((text: string, type: "success" | "warning" | "info") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => new Set(prev).add(key));
      
      if (key === "e" && !activeModal) {
        // Find nearest interactable
        const nearest = OBJECTS.find((obj) => {
          const dx = playerPos.x - (obj.x + obj.width / 2);
          const dy = playerPos.y - (obj.y + obj.height / 2);
          return Math.sqrt(dx * dx + dy * dy) < INTERACT_DISTANCE;
        });
        if (nearest) {
          setActiveModal(nearest.action);
        }
      }
      
      if (key === "escape") {
        setActiveModal(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playerPos, activeModal]);

  // Movement
  useEffect(() => {
    if (!gameStarted || activeModal) return;
    const interval = setInterval(() => {
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.has("w") || keys.has("arrowup")) { dy -= PLAYER_SPEED; setDirection("up"); }
      if (keys.has("s") || keys.has("arrowdown")) { dy += PLAYER_SPEED; setDirection("down"); }
      if (keys.has("a") || keys.has("arrowleft")) { dx -= PLAYER_SPEED; setDirection("left"); }
      if (keys.has("d") || keys.has("arrowright")) { dx += PLAYER_SPEED; setDirection("right"); }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);
        setPlayerPos((prev) => ({
          x: Math.max(20, Math.min(WORLD_WIDTH - 20, prev.x + dx)),
          y: Math.max(20, Math.min(WORLD_HEIGHT - 20, prev.y + dy)),
        }));
      } else {
        setIsMoving(false);
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameStarted, activeModal]);

  // Camera follow
  useEffect(() => {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    setCamera({
      x: Math.max(0, Math.min(WORLD_WIDTH - viewWidth, playerPos.x - viewWidth / 2)),
      y: Math.max(0, Math.min(WORLD_HEIGHT - viewHeight, playerPos.y - viewHeight / 2)),
    });
  }, [playerPos]);

  // Fermentation progress
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      setBeers((prev) =>
        prev.map((beer) => {
          if (beer.stage === "fermenting" && beer.progress < 100) {
            const newProgress = Math.min(100, beer.progress + 1);
            return { ...beer, progress: newProgress, stage: newProgress >= 100 ? "maturing" : "fermenting" };
          }
          if (beer.stage === "maturing" && beer.progress < 100) {
            const newProgress = Math.min(100, beer.progress + 0.5);
            return { ...beer, progress: newProgress, stage: newProgress >= 100 ? "ready" : "maturing" };
          }
          return beer;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleInteract = (obj: InteractableObject) => {
    setActiveModal(obj.action);
  };

  const handleBrewComplete = (beer: Beer) => {
    setBeers((prev) => [...prev, beer]);
    setMoney((prev) => prev - 500);
    addNotification(`🍺 Nova cerveja: ${beer.name}!`, "success");
    setPlayerLevel((prev) => Math.min(10, prev + 1));
  };

  // Start screen
  if (!gameStarted) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-amber-950 via-gray-900 to-black flex items-center justify-center overflow-hidden relative">
        {/* Background effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-bubble"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: 0,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center p-8 max-w-2xl">
          <div className="text-8xl mb-6 animate-float">🍺</div>
          <h1 className="text-6xl md:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              BrewLife
            </span>
          </h1>
          <p className="text-xl text-amber-200/80 mb-2">Simulador de Vida de Cervejeiro</p>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Explore sua cervejaria, brassagem cervejas, atenda clientes e construa seu império artesanal.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: "🚶", label: "Explore" },
              { icon: "🍲", label: "Brassagem" },
              { icon: "🍻", label: "Taproom" },
              { icon: "📈", label: "Expansão" },
            ].map((item, i) => (
              <div key={i} className="bg-black/40 backdrop-blur rounded-xl p-3 border border-amber-500/20">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-amber-300">{item.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-500/30 animate-pulse-glow"
          >
            🎮 Iniciar Jogo
          </button>

          <div className="mt-8 text-xs text-gray-500 space-y-1">
            <p>🎮 WASD ou Setas para mover</p>
            <p>⌨️ E para interagir com objetos</p>
            <p>🖱️ Clique nos objetos próximos para interagir</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative">
      {/* Game World */}
      <div
        className="absolute game-world"
        style={{
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          transform: `translate(${-camera.x}px, ${-camera.y}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 tile-grass" />

        {/* Paths between rooms */}
        <div className="absolute bg-gray-600" style={{ left: 500, top: 450, width: 100, height: 50 }} />
        <div className="absolute bg-gray-600" style={{ left: 1200, top: 450, width: 100, height: 50 }} />
        <div className="absolute bg-gray-600" style={{ left: 1200, top: 600, width: 100, height: 100 }} />
        <div className="absolute bg-gray-600" style={{ left: 500, top: 1100, width: 600, height: 100 }} />
        <div className="absolute bg-gray-600" style={{ left: 1100, top: 1100, width: 200, height: 400 }} />

        {/* Rooms */}
        {Object.entries(ROOMS).map(([key, room]) => (
          <Room key={key} room={room} expansionLevel={expansionLevel} />
        ))}

        {/* Interactable objects */}
        {OBJECTS.map((obj) => (
          <Interactable
            key={obj.id}
            obj={obj}
            playerPos={playerPos}
            onInteract={handleInteract}
          />
        ))}

        {/* Player */}
        <Player position={playerPos} direction={direction} isMoving={isMoving} level={playerLevel} />

        {/* Decorations */}
        <div className="absolute text-4xl" style={{ left: 50, y: 1700, top: 1700 }}>🌳</div>
        <div className="absolute text-4xl" style={{ left: 2300, top: 1200 }}>🌳</div>
        <div className="absolute text-4xl" style={{ left: 100, top: 1100 }}>🌲</div>
        <div className="absolute text-4xl" style={{ left: 2300, top: 200 }}>🌲</div>
        <div className="absolute text-3xl" style={{ left: 1150, top: 1450 }}>🚪</div>
      </div>

      {/* HUD */}
      <HUD
        money={money}
        reputation={reputation}
        day={day}
        season={season}
        beers={beers}
        level={playerLevel}
      />

      {/* Minimap */}
      <Minimap playerPos={playerPos} rooms={ROOMS} />

      {/* Notifications */}
      <Notifications notifications={notifications} />

      {/* Modals */}
      {activeModal === "brewing" && (
        <BrewingModal
          onClose={() => setActiveModal(null)}
          onBrew={handleBrewComplete}
          money={money}
        />
      )}

      {activeModal === "fermenting" && (
        <FermentationModal
          onClose={() => setActiveModal(null)}
          beers={beers}
        />
      )}

      {activeModal === "taproom" && (
        <TaproomModal
          onClose={() => setActiveModal(null)}
          beers={beers.filter((b) => b.stage === "ready")}
          onServe={() => {}}
          money={money}
          reputation={reputation}
        />
      )}

      {activeModal === "office" && (
        <OfficeModal
          onClose={() => setActiveModal(null)}
          money={money}
          setMoney={setMoney}
          reputation={reputation}
          setReputation={setReputation}
          day={day}
          setDay={setDay}
          setSeason={setSeason}
          addNotification={addNotification}
        />
      )}

      {activeModal === "cleaning" && (
        <CleaningModal
          onClose={() => setActiveModal(null)}
          onClean={() => addNotification("✨ Limpeza concluída!", "success")}
          cleanliness={cleanliness}
          setCleanliness={setCleanliness}
        />
      )}

      {activeModal === "packaging" && (
        <PackagingModal
          onClose={() => setActiveModal(null)}
          beers={beers}
        />
      )}
    </div>
  );
}
