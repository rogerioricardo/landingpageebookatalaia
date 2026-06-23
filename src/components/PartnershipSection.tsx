import { Handshake, Shield, Smartphone, Globe, Target, ArrowRight, Download, CheckCircle2, Award } from "lucide-react";
import { motion } from "motion/react";

interface PartnershipSectionProps {
  onOpenDownload: () => void;
}

export default function PartnershipSection({ onOpenDownload }: PartnershipSectionProps) {
  return (
    <div className="py-16 md:py-24 border-t border-zinc-200 relative overflow-hidden" id="partnership-section">
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
            <Award size={14} />
            Parceria de Sucesso
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-zinc-900 tracking-tight">
            Tecnologia Atalaia & Oportunidade de Parceria
          </h2>
          <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
            Unimos a melhor tecnologia de streaming de segurança em nuvem com um modelo comercial focado no crescimento de integradores regionais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Atalaia Platform features */}
          <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                  <Smartphone size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-green-700 block">
                    CAPÍTULO 11
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-900">
                    Conheça a Plataforma Atalaia
                  </h3>
                </div>
              </div>

              <p className="text-zinc-655 text-sm md:text-base leading-relaxed">
                O Atalaia é um ecossistema completo desenvolvido especificamente para apoiar integradores de segurança eletrônica. Ele resolve toda a complexidade técnica e permite que você ofereça um serviço de padrão internacional para seus clientes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#f9fdfa] rounded-xl border border-zinc-200/80 space-y-2 shadow-sm">
                  <Globe size={18} className="text-green-700" />
                  <h4 className="text-zinc-900 font-bold text-sm">Streaming Otimizado</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">Imagens salvas em nuvem segura com baixíssima latência e consumo de banda inteligente.</p>
                </div>
                <div className="p-4 bg-[#f9fdfa] rounded-xl border border-zinc-200/80 space-y-2 shadow-sm">
                  <Smartphone size={18} className="text-green-700" />
                  <h4 className="text-zinc-900 font-bold text-sm">Aplicativo do Usuário</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">Interface ultra intuitiva com botão de pânico, alertas e acesso rápido para os moradores.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200">
              <button
                onClick={onOpenDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-zinc-50 text-zinc-750 hover:text-zinc-900 font-bold text-sm rounded-xl border border-zinc-300 shadow-sm transition-colors cursor-pointer"
              >
                Ler mais sobre o Atalaia no Ebook <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Partnership Invite */}
          <div className="lg:col-span-6 bg-black border border-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Handshake size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                    CAPÍTULO 12
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">
                    Convite para Parceria Exclusiva
                  </h3>
                </div>
              </div>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                Estamos selecionando integradores pioneiros em regiões estratégicas do Brasil para se tornarem parceiros licenciados do Atalaia. Garanta exclusividade na sua cidade antes dos concorrentes!
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  O que você ganha como parceiro:
                </h4>
                <ul className="space-y-2.5">
                  {[
                    "Proteção e exclusividade de região geográfica",
                    "Geração de leads qualificados enviados pelo Atalaia",
                    "Acesso a materiais de vendas validados (panfletos, banners, pitches)",
                    "Treinamento comercial completo e mentoria de recorrência",
                    "Suporte prioritário 24/7 com engenharia dedicada"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-300">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <button
                onClick={onOpenDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={18} /> Baixar Ebook & Solicitar Parceria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
