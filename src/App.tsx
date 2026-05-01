import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Radio, Zap, Building2, CloudRain, Flame, Activity, Sparkles, Loader2, Download } from 'lucide-react';
import { generateImprovisation, GeneratedVerse, MusicStyle } from './services/geminiService';

interface VerseData {
  chord: string;
  lines: string[];
  icon: any;
  accent: string;
}

const STYLES: { id: MusicStyle; label: string }[] = [
  { id: 'Rock', label: 'ROCK' },
  { id: 'Pop', label: 'POP' },
  { id: 'MPB', label: 'MPB' },
  { id: 'Rap', label: 'RAP' }
];

const STYLE_EXAMPLES: Record<MusicStyle, VerseData[]> = {
  'Rock': [
    { chord: "Am", lines: ["Neon enferrujado sobre o asfalto molhado,", "a cidade respira com pulmões de concreto quebrado."], icon: CloudRain, accent: "cyan" },
    { chord: "C", lines: ["Sirene canta blues em esquina vazia,", "e cada passo ecoa uma antiga rebeldia."], icon: Radio, accent: "orange" },
    { chord: "G", lines: ["Prédios sangram luz em janelas cansadas,", "vidas em loop, histórias apagadas."], icon: Building2, accent: "cyan" },
    { chord: "F", lines: ["O céu é chumbo, pesado e lento,", "engole sonhos sem movimento."], icon: Zap, accent: "red" }
  ],
  'Pop': [
    { chord: "C", lines: ["Te encontrei na esquina de um sonho qualquer,", "cidade brilhando como se fosse florescer,"], icon: Sparkles, accent: "orange" },
    { chord: "G", lines: ["teu sorriso acende o céu em neon,", "e o mundo desacelera no coração."], icon: Flame, accent: "cyan" },
    { chord: "Am", lines: ["A cidade brilha em cores vibrantes,", "somos dois viajantes distantes."], icon: Activity, accent: "orange" },
    { chord: "F", lines: ["O pulso da música guia o momento,", "somos a voz de um novo sentimento."], icon: Music, accent: "red" }
  ],
  'MPB': [
    { chord: "Dm", lines: ["A rua dorme em silêncio molhado,", "o vento leva o que foi calado,"], icon: CloudRain, accent: "cyan" },
    { chord: "G7", lines: ["há uma saudade sentada no banco da praça,", "e o tempo escorre devagar pela massa."], icon: Building2, accent: "orange" },
    { chord: "Cmaj7", lines: ["A brisa traz o cheiro do mar distante,", "um eco de um tempo que foi marcante."], icon: Radio, accent: "cyan" },
    { chord: "Am7", lines: ["A vida é um verso que a gente inventa,", "na calmaria que a alma sustenta."], icon: Activity, accent: "red" }
  ],
  'Rap': [
    { chord: "Am", lines: ["As luzes piscam, concreto me engole sem dó,", "na quebrada o som corta o ar igual nó,"], icon: Zap, accent: "red" },
    { chord: "F", lines: ["cidade respira fumaça e pressa no olhar,", "eu sobrevivo rimando pra não afundar."], icon: Activity, accent: "orange" },
    { chord: "C", lines: ["O asfalto é o palco da minha verdade,", "sobrevivendo no caos dessa cidade."], icon: Building2, accent: "cyan" },
    { chord: "G", lines: ["A voz que ecoa do beco pro mundo,", "um grito que nasce lá do fundo."], icon: Radio, accent: "red" }
  ]
};

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('Rock');
  const [verses, setVerses] = useState<VerseData[]>(STYLE_EXAMPLES['Rock']);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Update example verses when style changes IF we haven't generated anything yet
  useEffect(() => {
    if (!hasGenerated) {
      setVerses(STYLE_EXAMPLES[selectedStyle]);
      setActiveVerseIndex(null);
    }
  }, [selectedStyle, hasGenerated]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateImprovisation(selectedStyle);
      const icons = [Music, Activity, Zap, Radio, CloudRain, Flame, Building2, Sparkles, Music, Activity, Zap, Radio];
      const accents = ["orange", "cyan", "red", "orange", "cyan", "red", "orange", "cyan", "red", "orange", "cyan", "red"];
      
      const mappedVerses: VerseData[] = generated.map((gv, i) => ({
        chord: gv.chord,
        lines: [gv.line1, gv.line2],
        icon: icons[i % icons.length],
        accent: accents[i % accents.length]
      }));
      
      setVerses(mappedVerses);
      setActiveVerseIndex(null);
      setHasGenerated(true);
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao gerar a música. Verifique sua conexão e chave de API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const divider = "------------------------------------------";
    const dateStr = new Date().toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' às');

    let content = `AMUSITONA - Letra Improvisada\n`;
    content += `${divider}\n`;
    content += `Data: ${dateStr}\n`;
    content += `Engine: Dynamic Neural (Gemini AI)\n`;
    content += `Total de Partes: ${verses.length}\n`;
    content += `${divider}\n\n`;

    verses.forEach((v, i) => {
      content += `PARTE ${String(i + 1).padStart(2, '0')} [Acorde: ${v.chord}]\n`;
      v.lines.forEach(line => {
        content += `${line}\n`;
      });
      content += `\n`;
    });

    content += `${divider}\n`;
    content += `Gerado via Amusitona (αμουσιτονα)\n`;
    content += `Sessão de Improvisação Poética e Musical\n`;

    // Adiciona o BOM do UTF-8 para garantir que acentos apareçam corretamente em qualquer editor
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amusitona_letra_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeVerse = activeVerseIndex !== null ? verses[activeVerseIndex] : null;

  return (
    <div className="fixed inset-0 bg-immersive-bg text-[#d1d1d6] font-sans flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#ff4d0015] to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00f3ff10] to-transparent"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff05 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="scanline" />

      {/* Main Application Frame */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col h-full gap-8">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end border-b border-white/10 pb-4"
        >
          <div>
            <h1 className="text-xs tracking-[0.4em] uppercase text-white/40 font-bold mb-1">αμουσιτονα // AMUSITONA</h1>
            <p className="text-3xl font-light tracking-tight text-white uppercase">RUÍDO <span className="text-accent-orange opacity-80 italic">CÓSMICO</span></p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Style Selector */}
            <div className="hidden sm:flex gap-1 bg-white/5 p-1 border border-white/10">
              {STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    setHasGenerated(false); // Reset to show example when changing style
                  }}
                  className={`px-3 py-1 font-mono text-[9px] uppercase tracking-tighter transition-all ${
                    selectedStyle === style.id 
                      ? 'bg-accent-orange text-white' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all"
              title="Salvar letra no dispositivo"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">SALVAR</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-accent-orange/20 border border-accent-orange text-accent-orange font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-accent-orange hover:text-white transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {isGenerating ? "Processando..." : (
                <span className="flex items-center gap-1">
                  IMPROVISAR <span className="text-white/60 font-bold">{selectedStyle.toUpperCase()}</span>
                </span>
              )}
            </motion.button>
            <div className="text-right hidden md:block">
              <div className="text-[10px] uppercase tracking-widest text-accent-cyan mb-1">AI Link: Active</div>
              <div className="flex gap-2 justify-end">
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-accent-orange"
                />
                <div className="w-2 h-2 bg-white/20"></div>
                <div className="w-2 h-2 bg-white/20"></div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Lyrics Display Area (Central Viewport) */}
        <main className="flex-1 bg-immersive-panel border border-white/5 shadow-2xl relative flex items-center justify-center overflow-hidden group">
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none concrete-texture"></div>
          
          <AnimatePresence mode="wait">
            {activeVerse ? (
              <motion.div
                key={activeVerseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative text-center px-12 z-20"
              >
                <div className="text-4xl md:text-5xl font-serif italic text-white leading-tight verse-glow">
                  {activeVerse.lines[0]}
                  {activeVerse.lines[1] && (
                    <span className="text-2xl text-white/50 block mt-4 font-sans not-italic tracking-normal">
                      {activeVerse.lines[1]}
                    </span>
                  )}
                </div>
                
                {/* Decorative elements */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "128px" }}
                  className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 bg-accent-orange/30"
                />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "128px" }}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 w-1 bg-accent-cyan/30"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="text-center font-mono text-xs tracking-[0.5em] uppercase flex flex-col items-center gap-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-12 h-12 animate-spin text-accent-orange mb-2" />
                    Compondo versos em estilo {selectedStyle}...
                  </>
                ) : (
                  <>
                    <Music className="w-12 h-12 mb-2 text-white/20" />
                    Waiting for input signal...
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Interactive Chord Pads */}
        <div className={`grid gap-4 transition-all duration-500 ${verses.length > 8 ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 h-auto" : "grid-cols-4 lg:h-32"}`}>
          {verses.map((v, i) => (
            <button
              key={i}
              id={`chord-${v.chord.replace(/\s+/g, '-')}-${i}`}
              onClick={() => setActiveVerseIndex(i)}
              className={`group relative flex flex-col items-center justify-center p-3 transition-all overflow-hidden border ${
                activeVerseIndex === i 
                  ? 'bg-immersive-pad-active border-accent-orange shadow-[0_0_25px_rgba(255,77,0,0.1)]' 
                  : 'bg-immersive-pad border-white/10 hover:border-accent-cyan/50'
              } ${verses.length > 8 ? 'aspect-square' : ''}`}
            >
              <div className={`absolute top-1 left-1 text-[7px] font-mono ${
                activeVerseIndex === i ? 'text-accent-orange' : 'text-white/20'
              }`}>
                PAD_{String(i + 1).padStart(2, '0')}
              </div>
              
              <span className={`font-bold transition-all ${
                verses.length > 8 ? 'text-lg' : 'text-2xl'
              } ${
                activeVerseIndex === i ? 'text-white scale-110' : 'text-white/30 group-hover:text-white'
              }`}>
                {v.chord.split(' ')[0]}
              </span>
              
              <span className={`text-[7px] mt-1 uppercase tracking-tighter transition-opacity text-center line-clamp-1 ${
                activeVerseIndex === i ? 'text-accent-orange opacity-80' : 'text-white/10 opacity-0 group-hover:opacity-100'
              }`}>
                V{i + 1}
              </span>

              {activeVerseIndex === i && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-0 w-full h-1 bg-accent-orange"
                />
              )}
            </button>
          ))}
        </div>

        {/* Footer Meta */}
        <footer className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/20">
          <div className="flex gap-6 uppercase">
            <span>BPM: 74</span>
            <span>KEY: DYNAMIC</span>
            <span className="hidden sm:inline">CHORDS: {verses.length}</span>
          </div>
          <div className="uppercase">Output: Gemini_Neural_v1</div>
        </footer>
      </div>
    </div>
  );
}


