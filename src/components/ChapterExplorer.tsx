import React, { useState } from "react";
import { chaptersData } from "../data/chapters";
import { Chapter } from "../types";
import { 
  TrendingUp, Users, ShieldCheck, Network, 
  Building2, Briefcase, Map, Globe, 
  DollarSign, Cpu, Eye, Handshake, 
  ChevronRight, BookOpen, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Icon mapping dictionary
const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Users,
  ShieldCheck,
  Network,
  Building2,
  Briefcase,
  Map,
  Globe,
  DollarSign,
  Cpu,
  Eye,
  Handshake,
};

export default function ChapterExplorer() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(chaptersData[0]);

  return (
    <div className="space-y-8" id="chapters-section">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          <BookOpen size={14} />
          Por Dentro do Guia
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-zinc-900 tracking-tight">
          Explorando os 12 Capítulos Estratégicos
        </h2>
        <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
          Cada página foi desenhada para transformar sua visão de negócios. Clique em qualquer capítulo para espiar seu conteúdo prático antes de baixar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chapters Grid List */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
          {chaptersData.map((chap) => {
            const IconComponent = iconMap[chap.iconName] || BookOpen;
            const isSelected = selectedChapter.id === chap.id;

            return (
              <button
                key={chap.id}
                onClick={() => setSelectedChapter(chap)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                  isSelected
                    ? "bg-white border-green-600 shadow-md text-zinc-900 ring-2 ring-green-600/20"
                    : "bg-white border-zinc-200 hover:border-green-500/50 hover:bg-zinc-50/50 text-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 shrink-0 ${
                    isSelected 
                      ? "bg-green-600 text-white font-bold" 
                      : "bg-green-50 text-green-700 group-hover:bg-green-100 group-hover:text-green-800"
                  }`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-700">
                      {chap.number}
                    </span>
                    <h4 className="font-display font-semibold text-sm leading-snug text-zinc-900 group-hover:text-black transition-colors">
                      {chap.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-1 group-hover:text-zinc-600 transition-colors">
                      {chap.shortDescription}
                    </p>
                  </div>
                </div>
                {/* Glow bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Chapter Preview Box */}
        <div className="lg:col-span-5 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChapter.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[480px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      {selectedChapter.number}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-zinc-900 tracking-tight mt-3">
                      {selectedChapter.title}
                    </h3>
                  </div>
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 shadow-sm">
                    {(() => {
                      const Icon = iconMap[selectedChapter.iconName] || BookOpen;
                      return <Icon size={28} />;
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-700 text-sm md:text-base leading-relaxed font-normal">
                    {selectedChapter.detailedDescription}
                  </p>
                  
                  <div className="border-t border-zinc-200 pt-5 space-y-3.5">
                    <h5 className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                      O que você vai aprender:
                    </h5>
                    <ul className="space-y-2.5">
                      {selectedChapter.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-zinc-600">
                           <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
                <span>Totalmente atualizado para 2026</span>
                <span className="font-mono text-green-700 font-semibold flex items-center gap-1">
                  Guia Prático <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
