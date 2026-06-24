import React, { useState, useEffect } from "react";
import { X, Mail, User, Phone, Briefcase, ChevronRight, CheckCircle2, Download, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
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

  const triggerDownload = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - (2 * margin);
      let y = 20;

      const drawHeader = () => {
        // Top colored accent bar
        doc.setFillColor(22, 163, 74); // Green 600
        doc.rect(0, 0, pageWidth, 5, "F");
      };

      const drawFooter = (pageNumber: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text("Atalaia Segurança Colaborativa — atalaia.seg.br", margin, 285);
        doc.text(`Página ${pageNumber}`, pageWidth - margin - 15, 285);
      };

      const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > 265) {
          const pageNum = doc.getNumberOfPages();
          drawFooter(pageNum);
          doc.addPage();
          drawHeader();
          y = 25;
        }
      };

      // --- FIRST PAGE ---
      drawHeader();

      // Logo / Brand Icon
      doc.setFillColor(240, 253, 244); // Light green background for icon
      doc.roundedRect(margin, y, 14, 14, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("A", margin + 5, y + 10);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("ATALAIA", margin + 18, y + 9);

      y += 24;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(24, 24, 27); // Zinc 900
      doc.text("GUIA ESTRATÉGICO", margin, y);
      y += 8;
      doc.text("SEGURANÇA COLABORATIVA", margin, y);
      y += 10;

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(82, 82, 91); // Zinc 600
      const subTitleText = "Como integradores de segurança eletrônica podem construir uma nova e altamente lucrativa fonte de receita recorrente mensal (MRR).";
      const splitSubtitle = doc.splitTextToSize(subTitleText, contentWidth);
      doc.text(splitSubtitle, margin, y);
      y += (splitSubtitle.length * 5) + 5;

      // Personalized Box
      doc.setFillColor(244, 244, 245); // Zinc 100
      doc.setDrawColor(228, 228, 231); // Zinc 200
      doc.roundedRect(margin, y, contentWidth, 32, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("GUIA EXCLUSIVO E PERSONALIZADO", margin + 5, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(63, 63, 70); // Zinc 700
      doc.text(`Preparado para: `, margin + 5, y + 13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text(`${name || "Integrador Parceiro"}`, margin + 30, y + 13);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(63, 63, 70);
      doc.text(`Empresa: `, margin + 5, y + 19);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text(`${companyName || "Sistemas de Segurança"}`, margin + 30, y + 19);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(63, 63, 70);
      doc.text(`Expansão estimada: `, margin + 5, y + 25);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(`${clientCount || "Projetos de Recorrência"}`, margin + 36, y + 25);

      const todayStr = new Date().toLocaleDateString("pt-BR");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122); // Zinc 500
      doc.text(`Emissão: ${todayStr}`, margin + contentWidth - 32, y + 6);

      y += 42;

      // Introduction
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42); // Zinc 800
      const introText = "Este guia prático foi elaborado para integradores e profissionais de segurança eletrônica que buscam sair do ciclo estressante de vendas de projetos pontuais de hardware (câmeras, cabos e gravadores) e construir uma receita recorrente sólida, sustentável e de alta lucratividade através do modelo inovador de segurança colaborativa com a plataforma Atalaia.";
      const splitIntro = doc.splitTextToSize(introText, contentWidth);
      doc.text(splitIntro, margin, y);
      y += (splitIntro.length * 5) + 12;

      // Section 1
      checkPageBreak(50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("PARTE 1: A EVOLUÇÃO E A REVOLUÇÃO DO MERCADO", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      const part1Text = "A venda tradicional de câmeras e CFTV está sofrendo uma rápida comoditização. Os preços dos equipamentos caem a cada dia, a concorrência é acirrada e o cliente final foca apenas no menor preço de instalação. A solução definitiva para esse gargalo é a mudança de modelo mental e comercial: vender a segurança como um SERVIÇO (SaaS) e não como um produto único.\n\nAo conectar as câmeras de segurança a uma plataforma de nuvem compartilhada e inteligente, o integrador passa a comercializar ACESSO e PREVENÇÃO, cobrando mensalidades recorrentes dos moradores.";
      const splitPart1 = doc.splitTextToSize(part1Text, contentWidth);
      doc.text(splitPart1, margin, y);
      y += (splitPart1.length * 5) + 12;

      // Section 2
      checkPageBreak(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("PARTE 2: O CONCEITO DE SEGURANÇA COLABORATIVA", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      const part2Text = "A segurança colaborativa baseia-se no princípio de que a união de uma comunidade aumenta a segurança de todos. Em vez de cada vizinho ter seu próprio sistema de CFTV isolado e sem utilidade coletiva:\n\n1. Uma ou mais câmeras estrategicamente posicionadas na rua gravam as imagens diretamente na nuvem.\n2. Todos os moradores daquela rua/quadra possuem acesso controlado ao aplicativo para visualizar as imagens em tempo real e acessar gravações dos últimos dias.\n3. Em caso de atitude suspeita, qualquer morador pode emitir um alerta comunitário em tempo real, mobilizando a vizinhança de forma imediata e preventiva.";
      const splitPart2 = doc.splitTextToSize(part2Text, contentWidth);
      doc.text(splitPart2, margin, y);
      y += (splitPart2.length * 5) + 12;

      // Section 3
      checkPageBreak(75);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("PARTE 3: O MODELO DE NEGÓCIOS DE RECORRÊNCIA (MRR)", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      const part3Text1 = "No modelo colaborativo, a matemática financeira joga a favor do integrador parceiro:\n\n* Custo do Equipamento + Instalação: Pago uma única vez pelo cliente ou diluído.\n* Receita do Morador (Assinante): R$ 39,90 a R$ 79,90 mensais por morador ativo.\n* Divisão 50/50:\n  - 50% é a sua margem de lucro como Integrador parceiro (R$ 19,95 no plano mínimo por cliente).\n  - 50% é a taxa da licença Atalaia (responsável por toda infraestrutura em nuvem, aplicativo, processamento e suporte técnico).";
      const splitPart3_1 = doc.splitTextToSize(part3Text1, contentWidth);
      doc.text(splitPart3_1, margin, y);
      y += (splitPart3_1.length * 5) + 8;

      checkPageBreak(40);
      // Example Callout box in Section 3
      doc.setFillColor(240, 253, 244); // light green
      doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(21, 128, 61); // dark green
      doc.text("EXEMPLO DE ESCALA E GANHO FINANCEIRO:", margin + 5, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(21, 128, 61);
      const exampleText = "Ao instalar 10 câmeras em uma rua, com média de 15 assinantes por câmera (150 assinantes):\n* No plano de R$ 39,90, o faturamento total da rua é de R$ 5.985,00 mensais.\n* Sua recorrência líquida (50%): R$ 2.992,50 recorrentes TODOS OS MESES por apenas uma rua!";
      const splitExample = doc.splitTextToSize(exampleText, contentWidth - 10);
      doc.text(splitExample, margin + 5, y + 12);
      y += 32;

      // Section 4
      checkPageBreak(75);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("PARTE 4: PLANO DE AÇÃO PARA IMPLEMENTAÇÃO EM 4 PASSOS", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      const part4Text = "PASSO 1: MAPEAMENTO DE REGIÃO\nEscolha bairros residenciais ativos, ruas sem saída ou pequenos comércios integrados.\n\nPASSO 2: REUNIÃO COM A VIZINHANÇA\nApresente a ideia de 'Rua Protegida'. Mostre que pagar R$ 39,90 por mês é infinitamente mais barato do que contratar segurança privada física ou comprar sistemas individuais caros.\n\nPASSO 3: INSTALAÇÃO E ATIVAÇÃO\nInstale câmeras IP de qualidade voltadas para a via pública e conecte-as ao sistema Atalaia.\n\nPASSO 4: EXPANSÃO DA REDE\nPeça indicações para os moradores da rua protegida. Rapidamente, as ruas vizinhas também vão querer implementar o mesmo cinturão de segurança.";
      const splitPart4 = doc.splitTextToSize(part4Text, contentWidth);
      doc.text(splitPart4, margin, y);
      y += (splitPart4.length * 5) + 12;

      // Contact section
      checkPageBreak(45);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74); // Green 600
      doc.text("CONTATO E PARCERIA EXCLUSIVA", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
      const contactText = "Quer se tornar um integrador credenciado Atalaia e ter exclusividade de atuação na sua região? Entre em contato com nossa equipe comercial e receba todo o material de apoio, treinamentos técnicos e comerciais validados.\n\nE-mail: contato@atalaia.seg.br\nWebsite: atalaia.seg.br\n\nAtalaia Segurança Colaborativa — Desenvolvido para o crescimento de integradores.\nBy Alien Sistemas de Segurança Eletrônica";
      const splitContact = doc.splitTextToSize(contactText, contentWidth);
      doc.text(splitContact, margin, y);
      y += (splitContact.length * 5) + 10;

      // Draw final footer for the last page
      const totalPages = doc.getNumberOfPages();
      drawFooter(totalPages);

      // Save the PDF
      doc.save("Guia_Estrategico_Seguranca_Colaborativa.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Fallback to text file in case of error
      const link = document.createElement("a");
      link.href = "/Guia_Estrategico_Seguranca_Colaborativa.txt";
      link.download = "Guia_Estrategico_Seguranca_Colaborativa.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
                    Preencha os campos abaixo para receber o link de download imediato no seu e-mail e WhatsApp.
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
                        Liberar Meu Download Grátis <ChevronRight size={18} />
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
                    <Download size={22} className="animate-bounce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-display font-bold text-zinc-900">Preparando seu material...</h4>
                  <p className="text-zinc-600 text-sm max-w-xs">
                    Estamos gerando o seu Guia Estratégico com informações personalizadas para a <span className="text-green-700 font-semibold">{companyName}</span>.
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
                    Parabéns, {name.split(" ")[0]}!
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">
                    O download do seu <strong className="text-green-700 font-semibold">Guia Estratégico</strong> foi liberado e também enviamos uma cópia para o seu e-mail.
                  </p>
                </div>

                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 space-y-3.5">
                  <button
                    onClick={triggerDownload}
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download size={18} /> Baixar Ebook Grátis (PDF)
                  </button>
                  
                  <p className="text-[11px] text-zinc-500">
                    O download iniciará automaticamente. Se não iniciar, clique no botão acima.
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
                      Que tal colocar em prática os conceitos do Ebook ainda hoje e ter acesso ao sistema de monitoramento colaborativo de maior crescimento? Fale conosco e verifique a disponibilidade de região!
                    </p>
                  </div>
                  
                  <a
                    href="https://wa.me/5511999999999?text=Ol%C3%A1%2C+baixei+o+Ebook+Guia+Estrat%C3%A9gico+e+gostaria+de+saber+mais+sobre+a+parceria+Atalaia%21"
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
