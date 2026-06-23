import { useState, useEffect } from "react";
import { Lead } from "../types";
import { Users, Trash2, Calendar, FileDown, ShieldCheck, X, Briefcase, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeadsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh: number;
}

export default function LeadsPanel({ isOpen, onClose, triggerRefresh }: LeadsPanelProps) {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = () => {
    const storedLeads = JSON.parse(localStorage.getItem("collaborative_security_leads") || "[]");
    setLeads(storedLeads);
  };

  useEffect(() => {
    fetchLeads();
  }, [isOpen, triggerRefresh]);

  const handleDelete = (id: string) => {
    const filtered = leads.filter(l => l.id !== id);
    localStorage.setItem("collaborative_security_leads", JSON.stringify(filtered));
    setLeads(filtered);
  };

  const clearAll = () => {
    if (confirm("Deseja realmente limpar todos os leads coletados nesta demonstração?")) {
      localStorage.removeItem("collaborative_security_leads");
      setLeads([]);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    
    const headers = "ID,Nome,E-mail,Telefone,Empresa,Qtd Clientes,Data Coleta\n";
    const rows = leads.map(l => 
      `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.companyName}","${l.clientCountEstimate}","${new Date(l.createdAt).toLocaleString('pt-BR')}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_ebook_seguranca.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white border border-zinc-200 rounded-3xl w-full max-w-4xl h-[85vh] p-6 relative overflow-hidden shadow-2xl z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-zinc-900 flex items-center gap-2">
                    Painel de Leads Coletados
                    <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-200">
                      {leads.length} total
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Estes leads são capturados em tempo real quando o formulário de download do ebook é enviado.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick stats and actions */}
            {leads.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="text-xs text-zinc-650">
                  Visualizando banco de dados de leads local (<code className="text-green-700 font-semibold font-mono">localStorage</code>)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <FileDown size={14} /> Exportar CSV
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-750 border border-red-200 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={14} /> Limpar Tudo
                  </button>
                </div>
              </div>
            )}

            {/* Table / List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                  <div className="p-4 bg-zinc-50 text-zinc-400 rounded-full border border-zinc-200">
                    <ShieldCheck size={40} className="stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-zinc-900 font-bold text-base">Nenhum lead coletado ainda</h4>
                    <p className="text-zinc-500 text-xs max-w-sm">
                      Envie o formulário de simulação de download do ebook para ver os dados aparecendo aqui instantaneamente!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Integrador / Contato</th>
                        <th className="py-3 px-4">Empresa / Tamanho</th>
                        <th className="py-3 px-4">Contato Direto</th>
                        <th className="py-3 px-4">Data de Coleta</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-zinc-50 text-zinc-700 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-900">{lead.name}</div>
                            <div className="text-zinc-500 font-mono text-[10px]">{lead.id}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-800 flex items-center gap-1">
                              <Briefcase size={12} className="text-green-700 shrink-0" />
                              {lead.companyName}
                            </div>
                            <div className="text-green-700 font-semibold text-[10px] bg-green-50 inline-block px-1.5 py-0.5 rounded-md mt-0.5 border border-green-200">
                              {lead.clientCountEstimate} clientes
                            </div>
                          </td>
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Mail size={12} className="text-zinc-400 shrink-0" />
                              <a href={`mailto:${lead.email}`} className="hover:underline hover:text-green-700 text-zinc-600">
                                {lead.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone size={12} className="text-zinc-400 shrink-0" />
                              <a href={`tel:${lead.phone}`} className="hover:underline hover:text-green-700 text-zinc-600">
                                {lead.phone}
                              </a>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-zinc-400 shrink-0" />
                              {new Date(lead.createdAt).toLocaleString("pt-BR")}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="text-zinc-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Lead"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 pt-4 mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Sistemas de Leads Atalaia v1.0.0</span>
              <span>Totalmente armazenado no cliente</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
