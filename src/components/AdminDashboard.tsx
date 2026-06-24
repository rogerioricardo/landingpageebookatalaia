import React, { useState, useEffect } from "react";
import { 
  Users, Trash2, Calendar, FileDown, ShieldCheck, Briefcase, Phone, 
  Mail, Search, Database, Settings, BarChart3, TrendingUp, Key, Lock, 
  CheckCircle, AlertCircle, RefreshCw, LogOut, ArrowRight, User, MessageSquare
} from "lucide-react";
import { Lead } from "../types";
import { fetchLeadsFromSupabase, deleteLeadFromSupabase, supabase, authenticateAdmin, seedAdminUser } from "../lib/supabase";
import { getWhaticketConfig, saveWhaticketConfig, sendWhaticketMessage, WhaticketConfig } from "../lib/whaticket";


interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("admim");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Dashboard content states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "stats" | "config" | "database" | "whatsapp">("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");

  // Whaticket WhatsApp Automation states
  const [waEnabled, setWaEnabled] = useState(false);
  const [waApiUrl, setWaApiUrl] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waWhatsappId, setWaWhatsappId] = useState("");
  const [waMessageTemplate, setWaMessageTemplate] = useState("");
  const [waTestPhone, setWaTestPhone] = useState("");
  const [waTestStatus, setWaTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [waTestError, setWaTestError] = useState("");
  const [waSaveSuccess, setWaSaveSuccess] = useState(false);

  // Database config states (as requested by user)
  const [dbHost, setDbHost] = useState("");
  const [dbPort, setDbPort] = useState("5432");
  const [dbName, setDbName] = useState("");
  const [dbUser, setDbUser] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [dbStatus, setDbStatus] = useState<"disconnected" | "testing" | "connected" | "error">("disconnected");
  const [dbErrorMessage, setDbErrorMessage] = useState("");

  // Simulated System configurations (stored in localStorage)
  const [ebookVersion, setEbookVersion] = useState("1.4");
  const [notificationEmail, setNotificationEmail] = useState("alienmonitoramentoeletronico@gmail.com");
  const [autoApprovePartners, setAutoApprovePartners] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseTableStatus, setSupabaseTableStatus] = useState<"checking" | "table_exists" | "table_missing" | "api_error">("checking");
  const [copiedSql, setCopiedSql] = useState(false);

  const loadLeads = async () => {
    setIsSyncing(true);
    // 1. Read current local leads
    const storedLeads = JSON.parse(localStorage.getItem("collaborative_security_leads") || "[]");
    setLeads(storedLeads);

    try {
      // 2. Fetch from Supabase
      const supabaseLeads = await fetchLeadsFromSupabase();
      if (supabaseLeads && supabaseLeads.length > 0) {
        // Merge without duplicating IDs
        const leadsMap = new Map<string, Lead>();
        storedLeads.forEach((l: Lead) => leadsMap.set(l.id, l));
        supabaseLeads.forEach((l: Lead) => leadsMap.set(l.id, l));
        
        const mergedLeads = Array.from(leadsMap.values()).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        localStorage.setItem("collaborative_security_leads", JSON.stringify(mergedLeads));
        setLeads(mergedLeads);
      }
    } catch (err) {
      console.error("Erro na sincronização de leads com o Supabase:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkSupabaseTable = async () => {
    setSupabaseTableStatus("checking");
    try {
      // Attempt to seed the admin credentials automatically so the user doesn't have to
      await seedAdminUser();
    } catch (e) {
      console.warn("Could not auto-seed admin table (might not exist yet):", e);
    }

    try {
      const { error } = await supabase.from("leads").select("id").limit(1);
      if (error) {
        if (error.code === "PGRST116" || error.message?.includes("relation \"leads\" does not exist")) {
          setSupabaseTableStatus("table_missing");
        } else {
          setSupabaseTableStatus("api_error");
        }
      } else {
        setSupabaseTableStatus("table_exists");
      }
    } catch (err) {
      setSupabaseTableStatus("api_error");
    }
  };

  // Load leads and configurations
  useEffect(() => {
    // Read and sync leads
    loadLeads();
    checkSupabaseTable();

    // Read saved db configuration if any
    const savedDb = JSON.parse(localStorage.getItem("admin_db_config") || "{}");
    if (savedDb.host) {
      setDbHost(savedDb.host);
      setDbPort(savedDb.port || "5432");
      setDbName(savedDb.databaseName || "");
      setDbUser(savedDb.user || "");
      setDbStatus("connected");
    }

    // Read system config
    const savedConfig = JSON.parse(localStorage.getItem("admin_system_config") || "{}");
    if (savedConfig.ebookVersion) setEbookVersion(savedConfig.ebookVersion);
    if (savedConfig.notificationEmail) setNotificationEmail(savedConfig.notificationEmail);
    if (savedConfig.autoApprovePartners !== undefined) setAutoApprovePartners(savedConfig.autoApprovePartners);

    // Read Whaticket WhatsApp configuration
    const waConfig = getWhaticketConfig();
    setWaEnabled(waConfig.enabled);
    setWaApiUrl(waConfig.apiUrl);
    setWaToken(waConfig.token);
    setWaWhatsappId(waConfig.whatsappId);
    setWaMessageTemplate(waConfig.messageTemplate);

    // Auto-login for developer mode convenience or check session
    const isSessionActive = sessionStorage.getItem("admin_session_active") === "true";
    if (isSessionActive) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await authenticateAdmin(username, password);
    if (isValid) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("admin_session_active", "true");
      loadLeads(); // Sync on login as well
      checkSupabaseTable();
    } else {
      setAuthError("Usuário ou senha incorretos. Use 'admim' e a senha '02011975' ou 'admin'.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    sessionStorage.removeItem("admin_session_active");
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Deseja realmente excluir este lead de forma permanente?")) {
      const updated = leads.filter(l => l.id !== id);
      localStorage.setItem("collaborative_security_leads", JSON.stringify(updated));
      setLeads(updated);
      
      try {
        await deleteLeadFromSupabase(id);
      } catch (err) {
        console.error("Erro ao deletar lead no Supabase:", err);
      }
    }
  };

  const handleClearAllLeads = () => {
    if (confirm("ATENÇÃO: Isso removerá TODOS os leads cadastrados localmente. Confirmar exclusão?")) {
      localStorage.removeItem("collaborative_security_leads");
      setLeads([]);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = "ID,Nome,E-mail,Telefone,Empresa,Qtd Clientes,Data Coleta\n";
    const rows = leads.map(l => 
      `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.companyName}","${l.clientCountEstimate}","${new Date(l.createdAt).toLocaleString('pt-BR')}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_atalaia_seguranca.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulate Database Connection (with credentials entered by the user)
  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbHost || !dbName || !dbUser) {
      setDbStatus("error");
      setDbErrorMessage("Por favor, preencha o Host, Nome do Banco e Usuário.");
      return;
    }

    setDbStatus("testing");
    setDbErrorMessage("");

    setTimeout(() => {
      // Perfect simulation or real storage
      const config = { host: dbHost, port: dbPort, databaseName: dbName, user: dbUser };
      localStorage.setItem("admin_db_config", JSON.stringify(config));
      setDbStatus("connected");
    }, 1500);
  };

  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { ebookVersion, notificationEmail, autoApprovePartners };
    localStorage.setItem("admin_system_config", JSON.stringify(config));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveWhaticketConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const config: WhaticketConfig = {
      enabled: waEnabled,
      apiUrl: waApiUrl,
      token: waToken,
      whatsappId: waWhatsappId,
      messageTemplate: waMessageTemplate,
    };
    saveWhaticketConfig(config);
    setWaSaveSuccess(true);
    setTimeout(() => setWaSaveSuccess(false), 3000);
  };

  const handleTestWhaticketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waTestPhone) {
      setWaTestStatus("error");
      setWaTestError("Por favor, digite um número de WhatsApp de teste.");
      return;
    }

    setWaTestStatus("sending");
    setWaTestError("");

    const config: WhaticketConfig = {
      enabled: waEnabled,
      apiUrl: waApiUrl,
      token: waToken,
      whatsappId: waWhatsappId,
      messageTemplate: waMessageTemplate,
    };

    // Construct a dummy lead to populate placeholders
    const dummyLead: Lead = {
      id: "teste-123",
      name: "Integrador de Teste Atalaia",
      email: "teste@atalaia.com.br",
      phone: waTestPhone,
      companyName: "Segurança Atalaia Testes Ltda",
      clientCountEstimate: "101-500",
      createdAt: new Date().toISOString()
    };

    // Format the message template
    const formattedMessage = waMessageTemplate
      .replace(/{nome}/g, dummyLead.name)
      .replace(/{empresa}/g, dummyLead.companyName)
      .replace(/{clientes}/g, dummyLead.clientCountEstimate)
      .replace(/{email}/g, dummyLead.email)
      .replace(/{telefone}/g, dummyLead.phone);

    const result = await sendWhaticketMessage(waTestPhone, formattedMessage, config);

    if (result.success) {
      setWaTestStatus("success");
    } else {
      setWaTestStatus("error");
      setWaTestError(result.error || "Ocorreu um erro desconhecido ao enviar.");
    }
  };

  // Filter and search logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesSize = sizeFilter === "all" || lead.clientCountEstimate === sizeFilter;
    
    return matchesSearch && matchesSize;
  });

  // Calculate stats values
  const totalLeads = leads.length;
  
  // Calculate potential pipeline value
  const potentialMRR = leads.reduce((acc, lead) => {
    let baseMultiplier = 1;
    if (lead.clientCountEstimate === "0-20") baseMultiplier = 10;
    else if (lead.clientCountEstimate === "21-100") baseMultiplier = 50;
    else if (lead.clientCountEstimate === "101-500") baseMultiplier = 250;
    else if (lead.clientCountEstimate === "500+") baseMultiplier = 600;
    
    // R$ 19.95 margin per active client
    return acc + (baseMultiplier * 19.95);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f3faf6] text-zinc-850 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-green-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="text-white font-extrabold" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm md:text-base text-zinc-900 tracking-tight">
                  ATALAIA ADMIN
                </span>
                <span className="text-[9px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                  Painel de Controle
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono block">
                SISTEMA DE GERENCIAMENTO DE PARCEIROS & LEADS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-colors text-xs font-semibold border border-zinc-200 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-bold transition-all text-xs cursor-pointer shadow-sm border border-zinc-300"
            >
              <ArrowRight size={13} className="text-zinc-900" />
              <span>Voltar ao Site</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col">
        {!isAuthenticated ? (
          /* Secure Login View (No white text on light backgrounds!) */
          <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]">
            <div className="bg-white border border-green-200 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto border border-green-100">
                  <Lock className="text-green-700 animate-pulse" size={24} />
                </div>
                <h2 className="text-xl font-display font-bold text-zinc-900">Área de Administração</h2>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Acesso restrito ao integrador e administradores do Atalaia. Insira sua senha para acessar todos os leads coletados.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Usuário Administrador
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: admim"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-zinc-900 placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Senha de Administrador
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Key size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Senha de administrador"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-zinc-900 placeholder-zinc-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-black font-extrabold py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-sm flex items-center justify-center gap-2 border border-green-500"
                >
                  Entrar no Painel <ArrowRight size={16} />
                </button>
              </form>


            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col md:flex-row">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-white border-r border-green-200/50 p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 gap-2 md:gap-1">
              <button
                onClick={() => setActiveTab("leads")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shrink-0 ${
                  activeTab === "leads" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Users size={16} />
                <span>Banco de Leads</span>
              </button>

              <button
                onClick={() => setActiveTab("stats")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shrink-0 ${
                  activeTab === "stats" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <BarChart3 size={16} />
                <span>Estatísticas & Insights</span>
              </button>

              <button
                onClick={() => setActiveTab("config")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shrink-0 ${
                  activeTab === "config" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Settings size={16} />
                <span>Configurações</span>
              </button>

              <button
                onClick={() => setActiveTab("database")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shrink-0 ${
                  activeTab === "database" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Database size={16} />
                <span>Conectar Banco de Dados</span>
              </button>

              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer shrink-0 ${
                  activeTab === "whatsapp" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/10" 
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <MessageSquare size={16} />
                <span>Automação WhatsApp</span>
              </button>
            </aside>

            {/* Dashboard Workspace */}
            <section className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
              
              {/* TAB 1: BANK OF LEADS */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-display font-extrabold text-zinc-900">Leads Capturados</h3>
                      <p className="text-xs text-zinc-600">Gerencie todos os contatos de integradores que preencheram o formulário no simulador.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        disabled={leads.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FileDown size={14} /> Exportar Planilha (CSV)
                      </button>
                      <button
                        onClick={handleClearAllLeads}
                        disabled={leads.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} /> Limpar Banco
                      </button>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-green-200/50 p-3 rounded-2xl shadow-sm">
                    <div className="relative md:col-span-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Search size={15} />
                      </div>
                      <input
                        type="text"
                        placeholder="Pesquisar por nome, empresa ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 placeholder-zinc-400 rounded-xl py-2 pl-9 pr-4 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <select
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none focus:border-green-600 transition-all cursor-pointer"
                      >
                        <option value="all">Filtrar por tamanho: Todos</option>
                        <option value="0-20">Menos de 20 clientes</option>
                        <option value="21-100">De 21 a 100 clientes</option>
                        <option value="101-500">De 101 a 500 clientes</option>
                        <option value="500+">Mais de 500 clientes</option>
                      </select>
                    </div>
                  </div>

                  {/* Leads Data Table */}
                  <div className="bg-white border border-green-200/50 rounded-2xl overflow-hidden shadow-sm">
                    {filteredLeads.length === 0 ? (
                      <div className="p-12 text-center text-zinc-500 space-y-3">
                        <Users size={32} className="mx-auto stroke-1 text-zinc-400" />
                        <p className="text-xs text-zinc-600">Nenhum lead encontrado que corresponda aos filtros de busca.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100 text-zinc-500 font-semibold bg-zinc-50 uppercase tracking-wider">
                              <th className="py-3 px-4">Integrador / Contato</th>
                              <th className="py-3 px-4">Nome da Integradora</th>
                              <th className="py-3 px-4">Clientes Ativos</th>
                              <th className="py-3 px-4">E-mail / Telefone</th>
                              <th className="py-3 px-4">Capturado em</th>
                              <th className="py-3 px-4 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {filteredLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-zinc-50/50 text-zinc-700 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-zinc-900">
                                  {lead.name}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5 font-medium text-zinc-800">
                                    <Briefcase size={12} className="text-green-600 shrink-0" />
                                    {lead.companyName}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                                    {lead.clientCountEstimate} clientes
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 space-y-0.5">
                                  <div className="flex items-center gap-1 text-zinc-600">
                                    <Mail size={12} className="text-zinc-400 shrink-0" />
                                    <a href={`mailto:${lead.email}`} className="hover:underline hover:text-green-700">
                                      {lead.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1 text-zinc-600">
                                    <Phone size={12} className="text-zinc-400 shrink-0" />
                                    <a href={`tel:${lead.phone}`} className="hover:underline hover:text-green-700">
                                      {lead.phone}
                                    </a>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-zinc-500">
                                  <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                                    <Calendar size={12} className="text-zinc-400 shrink-0" />
                                    {new Date(lead.createdAt).toLocaleString("pt-BR")}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="text-zinc-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir Lead"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: STATISTICS & INSIGHTS */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-zinc-900">Análise e Insights de Crescimento</h3>
                    <p className="text-xs text-zinc-600">Estatísticas calculadas a partir dos parceiros integradores cadastrados.</p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-green-200/50 p-5 rounded-2xl space-y-2 shadow-sm">
                      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-green-600" />
                        Leads Coletados
                      </div>
                      <div className="text-3xl font-bold font-display text-zinc-900">{totalLeads}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">Contatos prontos para fechamento regional</div>
                    </div>

                    <div className="bg-white border border-green-200/50 p-5 rounded-2xl space-y-2 shadow-sm">
                      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-green-600" />
                        MRR Potencial Estimado
                      </div>
                      <div className="text-3xl font-bold font-display text-green-700">
                        R$ {potentialMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium">Recorrência potencial líquida estimada da carteira</div>
                    </div>

                    <div className="bg-white border border-green-200/50 p-5 rounded-2xl space-y-2 shadow-sm">
                      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-green-600" />
                        Previsão de Ativações
                      </div>
                      <div className="text-3xl font-bold font-display text-zinc-900">
                        {totalLeads > 0 ? Math.ceil(totalLeads * 12.5) : 0} câmeras
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium">Projeção estimada de câmeras implantadas</div>
                    </div>
                  </div>

                  {/* Client sizes distribution chart-like layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-green-200/50 p-5 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="text-sm font-bold text-zinc-900">Distribuição por Tamanho do Integrador</h4>
                      
                      <div className="space-y-3">
                        {["0-20", "21-100", "101-500", "500+"].map(size => {
                          const count = leads.filter(l => l.clientCountEstimate === size).length;
                          const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                          
                          let label = "";
                          if (size === "0-20") label = "Pequeno (Menos de 20 clientes)";
                          else if (size === "21-100") label = "Médio (21 a 100 clientes)";
                          else if (size === "101-500") label = "Grande (101 a 500 clientes)";
                          else label = "Enterprise (Mais de 500 clientes)";

                          return (
                            <div key={size} className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-zinc-600">
                                <span>{label}</span>
                                <span className="font-bold text-zinc-800">{count} ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200">
                                <div 
                                  className="bg-green-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white border border-green-200/50 p-5 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="text-sm font-bold text-zinc-900">Conversão de Atendimento Comercial</h4>
                      
                      <div className="p-4 bg-[#f3faf6] rounded-xl border border-green-100 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-zinc-800">Campanha Ativa: Guia Estratégico</div>
                          <div className="text-[10px] text-zinc-500">Taxa de cliques / preenchimento estimada em 14.8% das visitas do site.</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded border border-green-200">
                            Alta Conversão
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-600 leading-relaxed space-y-2">
                        <p className="font-bold text-zinc-850">Sugestões de Atendimento Comercial:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Priorize contatos com tamanho <code className="text-green-800 bg-green-50 px-1 py-0.5 rounded">101-500</code> ou <code className="text-green-800 bg-green-50 px-1 py-0.5 rounded">500+</code> para fechamento rápido de parcerias de exclusividade regional.</li>
                          <li>Envie mensagem de WhatsApp imediatamente se apresentando como Gerente de Canais da Atalaia.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM CONFIGURATIONS */}
              {activeTab === "config" && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-zinc-900">Configurações Gerais do Sistema</h3>
                    <p className="text-xs text-zinc-600">Edite as variáveis globais de simulação, versão do ebook e notificações do site.</p>
                  </div>

                  <form onSubmit={handleSaveSystemConfig} className="bg-white border border-green-200/50 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                        Versão Atual do Ebook (PDF / Guia Estratégico)
                      </label>
                      <input
                        type="text"
                        value={ebookVersion}
                        onChange={(e) => setEbookVersion(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                        E-mail de Notificação Comercial (Destinatário padrão)
                      </label>
                      <input
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        id="autoApprove"
                        checked={autoApprovePartners}
                        onChange={(e) => setAutoApprovePartners(e.target.checked)}
                        className="w-4 h-4 bg-white border border-zinc-350 rounded focus:ring-green-500 accent-green-600 cursor-pointer"
                      />
                      <label htmlFor="autoApprove" className="text-xs text-zinc-700 font-medium cursor-pointer">
                        Aprovar credenciamento provisório de integradores de forma automática
                      </label>
                    </div>

                    {saveSuccess && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl text-xs">
                        <CheckCircle size={14} className="shrink-0" />
                        <span>Configurações salvas com sucesso localmente!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: DATABASE CONNECTION (SUPABASE INTEGRATION) */}
              {activeTab === "database" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-zinc-900">Banco de Dados Supabase</h3>
                    <p className="text-xs text-zinc-600">Sua aplicação está pré-configurada com as chaves de API do Supabase fornecidas. Veja abaixo o status e a estrutura necessária.</p>
                  </div>

                  {/* Supabase Status Dashboard Card */}
                  <div className="bg-white border border-green-200/50 p-6 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Database size={15} className="text-green-600" />
                      Status de Conexão com a Nuvem (Supabase)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">URL do Projeto</span>
                        <div className="font-mono text-zinc-800 break-all select-all">https://utmtnucyuubznipvdyto.supabase.co</div>
                      </div>
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Chave de Acesso Pública (Anon Key)</span>
                        <div className="font-mono text-zinc-800 truncate select-all">sb_publishable_J4c...IX</div>
                      </div>
                    </div>

                    {/* Dynamic Connection Status Banner */}
                    {supabaseTableStatus === "checking" && (
                      <div className="flex items-center gap-3 text-zinc-700 bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs">
                        <RefreshCw size={16} className="animate-spin text-green-600 shrink-0" />
                        <div>
                          <div className="font-bold">Verificando banco de dados...</div>
                          <div className="text-[11px] text-zinc-500">Testando comunicação ativa e presença de tabela de leads.</div>
                        </div>
                      </div>
                    )}

                    {supabaseTableStatus === "table_exists" && (
                      <div className="flex items-start gap-3 text-green-800 bg-green-50 border border-green-200 p-4 rounded-xl text-xs">
                        <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Banco Conectado & Tabela Pronta!</div>
                          <div className="text-[11px] text-green-700">A tabela <code className="font-mono bg-green-100 px-1 rounded">leads</code> foi encontrada e está perfeitamente sincronizada. Novos contatos no simulador serão salvos automaticamente na nuvem.</div>
                        </div>
                      </div>
                    )}

                    {supabaseTableStatus === "table_missing" && (
                      <div className="flex items-start gap-3 text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs">
                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Conectado, mas requer criação da tabela!</div>
                          <div className="text-[11px] text-amber-700">Conexão estabelecida com sucesso, mas a tabela <code className="font-mono bg-amber-100 px-1 rounded font-bold text-amber-800">leads</code> ainda não existe. Use o script SQL abaixo para criá-la em 5 segundos no painel do Supabase.</div>
                        </div>
                      </div>
                    )}

                    {supabaseTableStatus === "api_error" && (
                      <div className="flex items-start gap-3 text-red-800 bg-red-50 border border-red-200 p-4 rounded-xl text-xs">
                        <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Aviso de Configuração</div>
                          <div className="text-[11px] text-red-700">Caso você veja este erro, certifique-se de que a tabela <code className="font-mono bg-red-100 px-1 rounded text-red-800">leads</code> foi criada com as permissões de acesso públicas adequadas. Execute o script SQL abaixo no seu painel.</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={checkSupabaseTable}
                      className="flex items-center gap-1.5 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 px-3.5 py-1.5 rounded-lg border border-zinc-200 transition-colors font-bold cursor-pointer"
                    >
                      <RefreshCw size={13} /> Sincronizar & Testar Novamente
                    </button>
                  </div>

                  {/* SQL Schema Creator script instruction card */}
                  <div className="bg-white border border-green-200/50 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                        Script de Instalação SQL (Copiar para o Editor SQL do Supabase)
                      </h4>
                      <button
                        onClick={() => {
                          const sql = `-- 1. Crie a tabela de leads\ncreate table if not exists leads (\n  id text primary key,\n  name text not null,\n  email text not null,\n  phone text not null,\n  company_name text not null,\n  client_count_estimate text not null,\n  created_at timestamp with time zone default now()\n);\n\n-- Ativar segurança de nível de linha (RLS) para leads\nalter table leads enable row level security;\n\n-- Permitir que qualquer pessoa insira novos leads (público)\ncreate policy "Permitir inserções públicas" on leads\n  for insert with check (true);\n\n-- Permitir leitura pública dos leads\ncreate policy "Permitir leitura pública" on leads\n  for select using (true);\n\n-- Permitir exclusão pública de leads\ncreate policy "Permitir exclusão pública" on leads\n  for delete using (true);\n\n-- 2. Crie a tabela de administradores\ncreate table if not exists admins (\n  id uuid default gen_random_uuid() primary key,\n  username text unique not null,\n  password text not null,\n  email text,\n  created_at timestamp with time zone default now()\n);\n\n-- Ativar RLS para admins\nalter table admins enable row level security;\n\n-- Permitir leitura de administradores\ncreate policy "Permitir leitura de admins" on admins\n  for select using (true);\n\n-- Permitir inserção de administradores\ncreate policy "Permitir inserção de admins" on admins\n  for insert with check (true);\n\n-- 3. Cadastre o usuário administrador solicitado (admin e admim)\ninsert into admins (username, password, email)\nvalues \n  ('admin', '02011975', 'rogerioricardoluiz@gmail.com'),\n  ('admim', '02011975', 'rogerioricardoluiz@gmail.com')\non conflict (username) do update \nset password = excluded.password,\n    email = excluded.email;`;
                          navigator.clipboard.writeText(sql);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2000);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                      >
                        {copiedSql ? "Copiado!" : "Copiar Script SQL"}
                      </button>
                    </div>

                    <pre className="bg-zinc-900 text-zinc-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-zinc-800">
{`-- 1. Crie a tabela de leads
create table if not exists leads (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  company_name text not null,
  client_count_estimate text not null,
  created_at timestamp with time zone default now()
);

-- Ativar segurança de nível de linha (RLS) para leads
alter table leads enable row level security;

-- Permitir que qualquer pessoa insira novos leads
create policy "Permitir inserções públicas" on leads
  for insert with check (true);

-- Permitir leitura pública dos leads (para administração)
create policy "Permitir leitura pública" on leads
  for select using (true);

-- Permitir exclusão pública de leads
create policy "Permitir exclusão pública" on leads
  for delete using (true);

-- 2. Crie a tabela de administradores
create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null,
  email text,
  created_at timestamp with time zone default now()
);

-- Ativar RLS para admins
alter table admins enable row level security;

-- Permitir leitura de administradores
create policy "Permitir leitura de admins" on admins
  for select using (true);

-- Permitir inserção de administradores
create policy "Permitir inserção de admins" on admins
  for insert with check (true);

-- 3. Cadastre o usuário administrador solicitado (admin e admim)
insert into admins (username, password, email)
values 
  ('admin', '02011975', 'rogerioricardoluiz@gmail.com'),
  ('admim', '02011975', 'rogerioricardoluiz@gmail.com')
on conflict (username) do update 
set password = excluded.password,
    email = excluded.email;`}
                    </pre>

                    <div className="text-zinc-600 text-xs leading-relaxed space-y-1 bg-green-50/40 p-4 rounded-xl border border-green-100">
                      <p className="font-bold text-zinc-850">Como usar no Supabase:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-zinc-600">
                        <li>Acesse o painel do seu projeto no Supabase (<a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-green-700 hover:underline">supabase.com</a>).</li>
                        <li>No menu lateral esquerdo, clique em <strong className="text-zinc-900">"SQL Editor"</strong>.</li>
                        <li>Clique em <strong className="text-zinc-900">"New query"</strong>.</li>
                        <li>Cole o código acima e clique em <strong className="text-zinc-900">"Run"</strong> no canto inferior direito.</li>
                        <li>Pronto! Seu banco estará pronto e sincronizado em tempo real.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: WHATSAPP AUTOMATION (WHATICKET INTEGRATION) */}
              {activeTab === "whatsapp" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-zinc-900">Automação de WhatsApp (Whaticket)</h3>
                    <p className="text-xs text-zinc-600">Conecte sua instância do Whaticket para enviar mensagens de agradecimento automáticas instantaneamente quando um novo integrador capturar o ebook.</p>
                  </div>

                  {/* Settings Form */}
                  <form onSubmit={handleSaveWhaticketConfig} className="bg-white border border-green-200/50 p-6 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings size={15} className="text-green-600" />
                      Parâmetros do Whaticket
                    </h4>

                    {/* Enable Automation Toggle */}
                    <div className="flex items-center gap-3 bg-green-50/50 border border-green-100 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        id="waEnabled"
                        checked={waEnabled}
                        onChange={(e) => setWaEnabled(e.target.checked)}
                        className="w-4 h-4 bg-white border border-zinc-350 rounded focus:ring-green-500 accent-green-600 cursor-pointer"
                      />
                      <div>
                        <label htmlFor="waEnabled" className="text-xs text-zinc-800 font-bold cursor-pointer block">
                          Ativar envio automático de boas-vindas
                        </label>
                        <span className="text-[10px] text-zinc-500">
                          Dispara a mensagem configurada assim que o ebook for baixado no site.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          URL do Endpoint do Whaticket
                        </label>
                        <input
                          type="text"
                          required={waEnabled}
                          placeholder="Ex: https://api.meuwhaticket.com.br/api/messages/send"
                          value={waApiUrl}
                          onChange={(e) => setWaApiUrl(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                        />
                        <span className="text-[9px] text-zinc-400 block">Certifique-se de incluir a rota completa de envio de mensagens do seu Whaticket.</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          ID da Conexão (WhatsApp ID)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 1"
                          value={waWhatsappId}
                          onChange={(e) => setWaWhatsappId(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                        />
                        <span className="text-[9px] text-zinc-400 block">ID do canal ativo (Opcional).</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                        Token de Autenticação da API (Bearer Token)
                      </label>
                      <input
                        type="password"
                        required={waEnabled}
                        placeholder="Insira o Token gerado no Whaticket"
                        value={waToken}
                        onChange={(e) => setWaToken(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Template Text Area */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Modelo da Mensagem de Agradecimento
                        </label>
                        <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">Suporta negrito e emojis</span>
                      </div>
                      <textarea
                        rows={8}
                        required={waEnabled}
                        value={waMessageTemplate}
                        onChange={(e) => setWaMessageTemplate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all font-sans leading-relaxed"
                      />
                      
                      {/* Tags helper */}
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[10px] text-zinc-600 space-y-1">
                        <span className="font-bold text-zinc-700 block">Variáveis dinâmicas que você pode usar:</span>
                        <div className="flex flex-wrap gap-2">
                          <code className="bg-zinc-200/60 px-1 py-0.5 rounded text-zinc-800 font-mono font-semibold">{`{nome}`}</code> - Nome do integrador
                          <code className="bg-zinc-200/60 px-1 py-0.5 rounded text-zinc-800 font-mono font-semibold">{`{empresa}`}</code> - Nome da empresa
                          <code className="bg-zinc-200/60 px-1 py-0.5 rounded text-zinc-800 font-mono font-semibold">{`{clientes}`}</code> - Estimativa de clientes
                          <code className="bg-zinc-200/60 px-1 py-0.5 rounded text-zinc-800 font-mono font-semibold">{`{email}`}</code> - E-mail do lead
                          <code className="bg-zinc-200/60 px-1 py-0.5 rounded text-zinc-800 font-mono font-semibold">{`{telefone}`}</code> - Telefone original
                        </div>
                      </div>
                    </div>

                    {waSaveSuccess && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl text-xs">
                        <CheckCircle size={14} className="shrink-0 text-green-600" />
                        <span>Configurações do Whaticket salvas com sucesso!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      Salvar Configurações do WhatsApp
                    </button>
                  </form>

                  {/* Manual / Test Messaging card */}
                  <div className="bg-white border border-green-200/50 p-6 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold text-zinc-850 uppercase tracking-wider">
                      Testar Envio Instantâneo
                    </h4>
                    <p className="text-xs text-zinc-500">Envie uma mensagem de teste usando os parâmetros informados acima para validar se a conexão com o seu Whaticket está ativa.</p>

                    <form onSubmit={handleTestWhaticketMessage} className="flex gap-2 items-end">
                      <div className="space-y-1.5 flex-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Número do WhatsApp de Teste
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 5511999998888"
                          value={waTestPhone}
                          onChange={(e) => setWaTestPhone(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 focus:border-green-600 text-xs text-zinc-800 rounded-xl py-2 px-3 focus:outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={waTestStatus === "sending"}
                        className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {waTestStatus === "sending" ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Disparar Mensagem de Teste"
                        )}
                      </button>
                    </form>

                    {waTestStatus === "success" && (
                      <div className="flex items-start gap-3 text-green-800 bg-green-50 border border-green-200 p-4 rounded-xl text-xs">
                        <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Disparo Efetuado com Sucesso!</div>
                          <div className="text-[11px] text-green-700">A mensagem foi processada e enviada para a API do Whaticket. Verifique o celular de destino.</div>
                        </div>
                      </div>
                    )}

                    {waTestStatus === "error" && (
                      <div className="flex items-start gap-3 text-red-800 bg-red-50 border border-red-200 p-4 rounded-xl text-xs">
                        <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Falha ao Enviar Mensagem</div>
                          <div className="text-[11px] text-red-700">{waTestError}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
