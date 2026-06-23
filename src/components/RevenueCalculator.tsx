import { useState, useMemo } from "react";
import { DollarSign, Percent, TrendingUp, Briefcase, Calculator, Users } from "lucide-react";
import { motion } from "motion/react";

export default function RevenueCalculator() {
  const [cameras, setCameras] = useState<number>(100);
  const [moradoresPerCamera, setMoradoresPerCamera] = useState<number>(10);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(39.90);

  const totalResidents = useMemo(() => {
    return cameras * moradoresPerCamera;
  }, [cameras, moradoresPerCamera]);

  const mrrTotal = useMemo(() => {
    return totalResidents * selectedPlanPrice;
  }, [totalResidents, selectedPlanPrice]);

  const costTotal = useMemo(() => {
    return mrrTotal * 0.50; // 50% Atalaia
  }, [mrrTotal]);

  const netProfit = useMemo(() => {
    return mrrTotal * 0.50; // 50% Integrador
  }, [mrrTotal]);

  const profitMargin = 50;

  const annualRevenue = useMemo(() => {
    return netProfit * 12;
  }, [netProfit]);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden" id="revenue-calculator-container">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold mb-3 border border-green-200">
            <Calculator size={14} />
            Simulador de Faturamento Recorrente (50/50)
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-zinc-900 tracking-tight">
            Quanto sua empresa pode faturar?
          </h3>
          <p className="text-zinc-600 mt-1 text-sm md:text-base">
            O morador (cliente final) paga o plano mensal, e a receita é dividida igualmente (50% Integrador / 50% Atalaia).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cameras Slider */}
          <div className="space-y-2 bg-green-50/40 p-4 rounded-2xl border border-green-100">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                <Briefcase size={16} className="text-green-600" />
                Câmeras Compartilhadas:
              </label>
              <span className="text-lg font-display font-bold text-green-800 bg-green-100 px-3 py-0.5 rounded-lg border border-green-200">
                {cameras} un.
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={cameras}
              onChange={(e) => setCameras(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>10 câmeras</span>
              <span>500 câmeras</span>
              <span>1.000 câmeras</span>
            </div>
          </div>

          {/* Average Residents per Camera Slider */}
          <div className="space-y-2 bg-green-50/40 p-4 rounded-2xl border border-green-100">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                <Users size={16} className="text-green-600" />
                Média de Moradores por Câmera:
              </label>
              <span className="text-lg font-display font-bold text-green-800 bg-green-100 px-3 py-0.5 rounded-lg border border-green-200">
                {moradoresPerCamera} un.
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={moradoresPerCamera}
              onChange={(e) => setMoradoresPerCamera(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>1 morador</span>
              <span>15 moradores</span>
              <span>30 moradores</span>
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              * Número médio de moradores/vizinhos que participam do grupo de cada câmera.
            </p>
          </div>

          {/* Plan Choice Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-zinc-700 block">
              Plano de Assinatura do Morador (Cliente Final):
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedPlanPrice(39.90)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlanPrice === 39.90
                    ? "bg-green-50 border-green-600 ring-2 ring-green-600/20 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-xs uppercase font-extrabold tracking-wider text-green-700 mb-1">
                  Plano Mínimo
                </div>
                <div className="text-xl font-display font-extrabold text-zinc-900">
                  R$ 39,90<span className="text-xs font-normal text-zinc-500"> /mês</span>
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Ideal para projetos residenciais de entrada.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanPrice(79.90)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlanPrice === 79.90
                    ? "bg-green-50 border-green-600 ring-2 ring-green-600/20 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-xs uppercase font-extrabold tracking-wider text-green-700 mb-1">
                  Plano Padrão
                </div>
                <div className="text-xl font-display font-extrabold text-zinc-900">
                  R$ 79,90<span className="text-xs font-normal text-zinc-500"> /mês</span>
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Completo com recursos extras e monitoramento avançado.
                </div>
              </button>
            </div>
          </div>

          {/* Split details card */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-zinc-650">
              <span>Divisão do Valor (Taxa de 50% / 50%):</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center">
                <span className="text-zinc-500 font-medium block mb-0.5">Sua Parte (Integrador)</span>
                <strong className="text-sm text-green-700 font-bold">
                  R$ {(selectedPlanPrice * 0.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center">
                <span className="text-zinc-500 font-medium block mb-0.5">Parte do Atalaia (Licença)</span>
                <strong className="text-sm text-red-700 font-bold">
                  R$ {(selectedPlanPrice * 0.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 bg-black p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-6 shadow-md text-white">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Resultados Estimados</p>
            
            {/* Total active users */}
            <div>
              <span className="text-zinc-400 text-xs">Total de Moradores Ativos:</span>
              <div className="text-lg font-display font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Users size={18} className="text-green-400" />
                {totalResidents.toLocaleString("pt-BR")} usuários pagantes
              </div>
            </div>

            {/* Net Recurring Revenue */}
            <div>
              <span className="text-zinc-400 text-xs">Faturamento Recorrente Mensal Bruto (MRR):</span>
              <div className="text-2xl font-display font-extrabold text-white mt-0.5">
                R$ {mrrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Platform Cost total */}
            <div>
              <span className="text-zinc-400 text-xs">Custo de Licença Atalaia (50%):</span>
              <div className="text-sm font-medium text-red-400">
                - R$ {costTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Dividor */}
            <div className="border-t border-zinc-800 my-2" />

            {/* Net profit */}
            <div>
              <span className="text-zinc-300 text-xs font-semibold flex items-center gap-1">
                Seu Lucro Líquido Recorrente Mensal (50%):
                <span className="text-green-400 text-[10px] bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/20">
                  {profitMargin}% de margem fixa
                </span>
              </span>
              <div className="text-3xl md:text-4xl font-display font-extrabold text-green-400 mt-1">
                R$ {netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 flex items-center gap-3">
            <div className="bg-green-500/20 p-2.5 rounded-lg text-green-400 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-zinc-350 text-xs">Faturamento Líquido Anual Projetado:</span>
              <div className="text-lg md:text-xl font-display font-bold text-white">
                R$ {annualRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
