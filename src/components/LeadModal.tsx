import React, { useState, useEffect } from "react";
import { X, Mail, User, Phone, Briefcase, ChevronRight, CheckCircle2, MessageSquare, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Lead } from "../types";
import { saveLeadToSupabase } from "../lib/supabase";
import { triggerLeadWhatsAppNotification } from "../lib/whaticket";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCapture?: (lead: Lead) => void;
}

export default function LeadModal({ isOpen, onClose, onLeadCapture }: LeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [clientCount, setClientCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "preparing" | "success">("form");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPhone("");
      setCompanyName("");
      setClientCount("");
      setStep("form");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !companyName || !clientCount) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);

    // Simulate file preparation delay
    setTimeout(() => {
      setStep("preparing");
      
      setTimeout(async () => {
        const newLead: Lead = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          phone,
          companyName,
          clientCountEstimate: clientCount,
          createdAt: new Date().toISOString()
        };

        // Store to localStorage for demo persistence
        const existingLeads = JSON.parse(localStorage.getItem("collaborative_security_leads") || "[]");
        localStorage.setItem("collaborative_security_leads", JSON.stringify([...existingLeads, newLead]));

        // Sync to Supabase
        try {
          await saveLeadToSupabase(newLead);
        } catch (supabaseErr) {
          console.error("Falha ao salvar no Supabase, mantido em localStorage:", supabaseErr);
        }

        // Send automatic WhatsApp notification if enabled
        try {
          await triggerLeadWhatsAppNotification(newLead);
        } catch (waErr) {
          console.error("Erro ao disparar mensagem automática do WhatsApp:", waErr);
        }

        if (onLeadCapture) {
          onLeadCapture(newLead);
        }

        setStep("success");
        setIsSubmitting(false);
      }, 1800);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg p-6 md:p-8 relative overflow-hidden shadow-2xl z-10"
          >
            {/* Top Close Button */}
            {!isSubmitting && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            )}

            {step === "form" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-zinc-900 tracking-tight">
                    Garanta seu Ebook Grátis
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Preencha os campos abaixo e enviaremos o material agora mesmo diretamente no seu WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 z-10">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 focus:border-green-500 text-black placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                      E-mail Corporativo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 z-10">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Ex: joao@empresa.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-zinc-200 focus:border-green-500 text-black placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* WhatsApp/Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                      WhatsApp / Telefone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 z-10">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: (11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-zinc-200 focus:border-green-500 text-black placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                      Nome da Sua Integradora
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 z-10">
                        <Briefcase size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Alfa Segurança Eletrônica"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 focus:border-green-500 text-black placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Client Count Estimate selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                      Quantos clientes ativos você possui hoje?
                    </label>
                    <select
                      required
                      value={clientCount}
                      onChange={(e) => setClientCount(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-green-500 text-black rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-zinc-500">Selecione uma opção</option>
                      <option value="0-20" className="text-black">Menos de 20 clientes</option>
                      <option value="21-100" className="text-black">De 21 a 100 clientes</option>
                      <option value="101-500" className="text-black">De 101 a 500 clientes</option>
                      <option value="500+" className="text-black">Mais de 500 clientes</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-black font-extrabold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin text-black" />
                        Processando dados...
                      </>
                    ) : (
                      <>
                        Receber Guia no WhatsApp <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === "preparing" && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-green-600">
                    <MessageSquare size={22} className="animate-bounce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-display font-bold text-zinc-900">Enviando seu material...</h4>
                  <p className="text-zinc-600 text-sm max-w-xs">
                    Estamos preparando o envio do seu Guia Estratégico para o WhatsApp da <span className="text-green-700 font-semibold">{companyName}</span>.
                  </p>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
                  <CheckCircle2 size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-zinc-900">
                    Tudo pronto, {name.split(" ")[0]}!
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    Seu <strong className="text-green-700 font-semibold">Guia Estratégico</strong> foi enviado com sucesso para o seu WhatsApp e e-mail.
                  </p>
                </div>

                <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100 space-y-4">
                  <div className="flex items-center justify-center gap-3 text-green-700">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center animate-pulse">
                      <MessageSquare size={20} />
                    </div>
                    <span className="font-bold text-sm">Confira seu WhatsApp!</span>
                  </div>
                  
                  <p className="text-xs text-zinc-600">
                    Acabamos de disparar o contato inicial. <strong>Basta digitar "Quero meu Ebook" no seu WhatsApp</strong> para receber o acesso imediato ao seu ebook.
                  </p>
                </div>

                {/* Exclusive Partnership Invitation CTA inside success modal! */}
                <div className="border-t border-zinc-200 pt-5 text-left space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-700">
                      Oportunidade de Ouro
                    </span>
                    <h4 className="font-display font-bold text-zinc-900 text-base">
                      Seja um Integrador Parceiro do Atalaia
                    </h4>
                    <p className="text-zinc-600 text-xs leading-relaxed">
                      Que tal colocar em prática os conceitos do Guia ainda hoje e ter acesso ao sistema de monitoramento colaborativo de maior crescimento? Fale conosco e verifique a disponibilidade de região!
                    </p>
                  </div>
                  
                  <a
                    href="https://wa.me/5511999999999?text=Ol%C3%A1%2C+recebi+o+Guia+Estrat%C3%A9gico+e+gostaria+de+saber+mais+sobre+a+parceria+Atalaia%21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold py-2.5 px-4 rounded-xl text-center text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Falar com Consultor no WhatsApp <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
