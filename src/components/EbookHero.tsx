import { BookOpen, ShieldCheck, Download, Users, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface EbookHeroProps {
  onOpenDownload: () => void;
  onOpenLeads?: () => void;
  leadCount?: number;
}

export default function EbookHero({ onOpenDownload, onOpenLeads, leadCount = 0 }: EbookHeroProps) {
  return (
    <div className="relative pt-12 pb-20 md:py-24 overflow-hidden" id="hero-section">
      {/* Background blur decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left copy text block */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm animate-fade-in">
              <ShieldCheck size={14} className="text-green-700" />
              <span>Ebook Completo & Gratuito</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-zinc-900 tracking-tight leading-none">
                Guia Estratégico da <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-green-600 to-emerald-700">
                  Segurança Colaborativa
                </span>
              </h1>
              
              <h2 className="text-lg md:text-xl font-display font-semibold text-zinc-700 leading-relaxed max-w-2xl">
                Como Integradores de Segurança Eletrônica podem criar uma nova fonte de receita recorrente mensal (MRR) utilizando tecnologia colaborativa de ponta.
              </h2>
            </div>

            <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-xl">
              Chega de depender de instalações de hardware de margem baixa e cobranças únicas de serviço. Descubra o método passo a passo em 12 capítulos para conectar vizinhanças, condomínios e cidades e lucrar recorrentemente.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenDownload}
                className="bg-black hover:bg-zinc-900 text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download size={18} />
                Quero Baixar Meu Guia Grátis
              </button>

              <a
                href="#chapters-section"
                className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 font-semibold py-4 px-6 rounded-2xl text-center text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <BookOpen size={18} />
                Conhecer os 12 Capítulos
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-zinc-200 max-w-lg">
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-zinc-900 flex items-center gap-1">
                  100%
                </div>
                <div className="text-xs text-zinc-500">Conteúdo Prático</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-zinc-900">
                  12
                </div>
                <div className="text-xs text-zinc-500">Capítulos Completos</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-green-700">
                  R$ 0
                </div>
                <div className="text-xs text-zinc-500">Sempre Gratuito</div>
              </div>
            </div>



          </div>

          {/* Right visual ebook mockup block */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center py-6">
            <div className="relative select-none">
              
              {/* Backside abstract glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000" />
              
              {/* Decorative Tech Rings */}
              <div className="absolute -top-12 -left-12 w-32 h-32 border border-green-500/10 rounded-full animate-spin-slow pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 border border-emerald-500/10 rounded-full animate-pulse pointer-events-none" />

              {/* Real CSS 3D Book Cover Container */}
              <div className="relative group cursor-pointer" style={{ perspective: "1200px" }} onClick={onOpenDownload}>
                <div 
                  className="relative w-64 md:w-72 h-[380px] md:h-[430px] rounded-r-2xl shadow-2xl transition-all duration-500 ease-out transform-style-3d hover:rotate-y-12"
                  style={{
                    transformOrigin: "left center",
                    boxShadow: "20px 25px 50px -12px rgba(0, 0, 0, 0.7)"
                  }}
                >
                  {/* Spine Simulation effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-zinc-950 to-zinc-900 rounded-l-sm z-30" />
                  <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-zinc-800 z-30" />

                  {/* Inside card - The Ebook Front Cover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-green-950 border-t border-r border-b border-zinc-900 rounded-r-2xl p-6 flex flex-col justify-between overflow-hidden z-20">
                    
                    {/* Glowing design elements inside the cover */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    <div className="absolute top-1/3 left-1/4 w-32 h-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-xl rotate-45" />

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gradient-to-tr from-green-600 to-emerald-500 rounded flex items-center justify-center shadow-md">
                          <ShieldCheck size={12} className="text-black font-bold" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                          Guia de Sucesso
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        ATALAIA
                      </span>
                    </div>

                    {/* Book Core Title */}
                    <div className="space-y-3 pt-6 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-green-400 font-bold block">
                        Ebook Completo
                      </span>
                      <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white leading-tight tracking-tight">
                        Guia Estratégico <br />
                        <span className="text-slate-300 text-xl font-medium block mt-1">da</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 block mt-1">
                          Segurança <br />
                          Colaborativa
                        </span>
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-normal pt-2 border-t border-zinc-900">
                        Como integradores de segurança podem estruturar receitas mensais recorrentes (MRR) vendendo colaboração.
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-800 pt-4 flex items-center justify-between mt-auto">
                      <div className="text-[9px] text-zinc-500 font-mono">
                        <div>Versão 2026</div>
                        <div className="text-zinc-600">Alta Performance</div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700/40 transition-colors">
                        <Download size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                          Download
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Depth effect pages side block */}
                  <div className="absolute right-0 top-0.5 bottom-0.5 w-[5px] bg-slate-100 rounded-r-md z-10 shadow-inner transform translate-x-[4px]" 
                       style={{
                         background: "repeating-linear-gradient(to right, #e2e8f0, #e2e8f0 1px, #ffffff 1px, #ffffff 2px)"
                       }}
                  />
                  <div className="absolute right-0 top-1 bottom-1 w-[2px] bg-slate-300 rounded-r-md z-10 transform translate-x-[6px]" />
                </div>
              </div>

              {/* Click to download badge */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-zinc-200 text-zinc-900 text-xs py-1.5 px-4 rounded-full font-semibold shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-none group-hover:text-green-700 transition-colors animate-bounce">
                <Download size={14} className="text-green-600 animate-pulse" />
                Clique para Baixar
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
