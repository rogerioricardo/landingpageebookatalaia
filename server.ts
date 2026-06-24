import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route for sending WhatsApp message via proxy to bypass browser CORS constraints
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { apiUrl, token, number, body, whatsappId } = req.body;

      if (!apiUrl || !token || !number || !body) {
        res.status(400).json({ error: "Campos obrigatórios ausentes: apiUrl, token, number e body são necessários." });
        return;
      }

      const payload: any = {
        number,
        body,
      };

      if (whatsappId) {
        const idNum = parseInt(whatsappId, 10);
        payload.whatsappId = isNaN(idNum) ? whatsappId : idNum;
      }

      console.log(`[PROXY] Enviando mensagem de WhatsApp para ${number} via API do Whaticket...`);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error(`[PROXY] Erro da API Whaticket (status ${response.status}):`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Array.from(response.headers.entries()),
          body: responseText
        });
        res.status(response.status).json({ 
          error: `A API respondeu com status ${response.status}: ${responseText || response.statusText}` 
        });
        return;
      }

      let responseData = {};
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      console.log(`[PROXY] Mensagem enviada com sucesso:`, responseData);
      res.json({ success: true, data: responseData });
    } catch (err: any) {
      console.error("[PROXY] Erro de conexão com o Whaticket:", err);
      res.status(500).json({ error: err.message || "Erro de rede ao conectar com a API." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
