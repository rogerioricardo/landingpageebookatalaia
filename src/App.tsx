import { useState, useEffect } from "react";
import { ShieldCheck, Download, Users, TrendingUp, BarChart3, HelpCircle, ArrowRight, Eye, Sparkles, Calculator } from "lucide-react";
import EbookHero from "./components/EbookHero";
import ChapterExplorer from "./components/ChapterExplorer";
import RevenueCalculator from "./components/RevenueCalculator";
import PartnershipSection from "./components/PartnershipSection";
import LeadModal from "./components/LeadModal";
import LeadsPanel from "./components/LeadsPanel";
import AdminDashboard from "./components/AdminDashboard";
import { Lead } from "./types";

export default function App() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [refreshLeadsTrigger, setRefreshLeadsTrigger] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Monitor URL path, hash, or search to trigger Admin view
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (
        path === "/admin" || 
        path === "/admim" || 
        hash === "#admin" || 
        hash === "#admim" ||
        search.includes("admin") ||
        search.includes("admim")
      ) {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    // Run on initial load
    handleUrlChange();

    // Listen for url change events
    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminMode(false);
    // Gracefully clean up the browser address bar
    if (window.location.hash) {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    } else if (window.location.pathname === "/admin" || window.location.pathname === "/admim") {
      window.history.pushState("", document.title, "/");
    } else if (window.location.search.includes("admin") || window.location.search.includes("admim")) {
      window.history.pushState("", document.title, window.location.pathname);
    }
  };

  // Read current leads count on load
  const updateLeadCount = () => {
    const stored = JSON.parse(localStorage.getItem("collaborative_security_leads") || "[]");
    setLeadCount(stored.length);
  };

  useEffect(() => {
    updateLeadCount();
  }, [refreshLeadsTrigger, isLeadsOpen]);

  const handleLeadCapture = (newLead: Lead) => {
    setRefreshLeadsTrigger(prev => prev + 1);
  };

  if (isAdminMode) {
    return <AdminDashboard onClose={handleCloseAdmin} />;
  }

  return (
    <div className="min-h-screen bg-[#f3faf6] text-zinc-900 selection:bg-green-600 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Decorative top header glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-green-100/30 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <ShieldCheck className="text-white font-bold" size={18} />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm md:text-base text-zinc-900 tracking-tight block">
                ATALAIA
              </span>
              <span className="text-[9px] text-green-700 uppercase tracking-widest font-mono block">
                Segurança Colaborativa
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-700">
            <a 
              href="#hero-section" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("hero-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-green-700 transition-colors"
            >
              Início
            </a>
            <a 
              href="#chapters-section" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("chapters-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-green-700 transition-colors"
            >
              Capítulos
            </a>
            <a 
              href="#revenue-calculator" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("revenue-calculator");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-green-700 transition-colors"
            >
              Simulador
            </a>
            <a 
              href="#partnership-section" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("partnership-section");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-green-700 transition-colors"
            >
              Parceria
            </a>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="#revenue-calculator"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("revenue-calculator");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-green-50 hover:bg-green-100 text-black font-bold text-xs md:text-sm py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-green-200"
            >
              <Calculator size={14} className="text-green-700" />
              <span>Calcule quanto você pode faturar</span>
            </a>
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-black font-bold text-xs md:text-sm py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download size={14} /> Baixar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        
        {/* Hero Section */}
        <EbookHero 
          onOpenDownload={() => setIsDownloadOpen(true)} 
          onOpenLeads={() => setIsLeadsOpen(true)}
          leadCount={leadCount}
        />

        {/* Why Collaborative Security Section (Pain Point & Goal) */}
        <section className="py-16 md:py-24 border-t border-zinc-200 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Pain Point */}
              <div className="p-6 md:p-8 bg-[#f9fdfa] border border-zinc-200/80 rounded-3xl space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                  <TrendingUp className="rotate-180" size={22} />
                </div>
                <h3 className="text-lg font-display font-bold text-zinc-900">Margens Espremidas?</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Depender apenas de vender cabos, câmeras convencionais e instalações pontuais cria um ciclo estressante. Se você não vende hoje, você não fatura amanhã.
                </p>
              </div>

              {/* Card 2: Solution */}
              <div className="p-6 md:p-8 bg-[#f9fdfa] border border-zinc-200/80 rounded-3xl space-y-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center border border-green-100">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg font-display font-bold text-zinc-900">Receita Recorrente</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  A tecnologia colaborativa permite cobrar mensalidades acessíveis de dezenas de moradores por cada câmera instalada na rua, escalando sua receita mensal (MRR).
                </p>
              </div>

              {/* Card 3: Market Size */}
              <div className="p-6 md:p-8 bg-[#f9fdfa] border border-zinc-200/80 rounded-3xl space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Users size={22} />
                </div>
                <h3 className="text-lg font-display font-bold text-zinc-900">Escala Infinita</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Uma única câmera pode ser vendida para 20 ou 30 moradores de uma rua. O custo de instalação é fixo, mas o faturamento recorrente se multiplica exponencialmente.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Chapter Explorer (Bento Grid of the 12 Chapters) */}
        <section className="py-16 md:py-24 border-t border-zinc-200">
          <div className="container mx-auto px-4">
            <ChapterExplorer />
          </div>
        </section>

        {/* Dynamic Financial Simulator Calculator */}
        <section id="revenue-calculator" className="py-16 md:py-24 border-t border-zinc-200 bg-white">
          <div className="container mx-auto px-4">
            <RevenueCalculator />
          </div>
        </section>

        {/* Partnership Exclusivity and Atalaia Section */}
        <PartnershipSection onOpenDownload={() => setIsDownloadOpen(true)} />

        {/* Bottom Final conversion Section */}
        <section className="py-16 md:py-24 border-t border-zinc-200 bg-gradient-to-b from-green-50/50 to-white">
          <div className="container mx-auto px-4 text-center space-y-6 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-zinc-900 tracking-tight leading-tight">
              Pronto para transformar sua Integradora de Segurança Eletrônica?
            </h2>
            <p className="text-zinc-700 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              Baixe agora o <strong className="text-green-700">Guia Estratégico da Segurança Colaborativa</strong> gratuitamente e entre hoje mesmo no mercado de recorrência altamente rentável!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 px-10 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Download size={18} /> Baixar Ebook Grátis Agora
              </button>
              
              <a
                href="#chapters-section"
                className="w-full sm:w-auto bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Rever Capítulos
              </a>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Disponibilidade garantida • Material prático formatado para 2026
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 text-zinc-600 text-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1.5">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <div className="w-5 h-5 bg-green-100 text-green-700 rounded flex items-center justify-center">
                    <ShieldCheck size={12} />
                  </div>
                  <span className="font-display font-bold text-zinc-900 text-sm tracking-tight">
                    Atalaia Segurança Colaborativa
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-semibold md:pl-6">
                  By Alien Sistemas de Segurança Eletrônica
                </div>
              </div>
              <p className="text-xs text-zinc-600 max-w-xs">
                Inovando a segurança eletrônica no Brasil através de inovação, tecnologia colaborativa e recorrência.
              </p>
            </div>

            <div className="text-xs space-y-1">
              <div>&copy; 2026 Atalaia. Todos os direitos reservados.</div>
              <div>Desenvolvido com foco no crescimento de integradores de segurança.</div>
            </div>


          </div>
        </div>
      </footer>

      {/* Pop-up Modals */}
      <LeadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        onLeadCapture={handleLeadCapture}
      />

      <LeadsPanel
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
        triggerRefresh={refreshLeadsTrigger}
      />

    </div>
  );
}
