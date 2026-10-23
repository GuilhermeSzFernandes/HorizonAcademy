import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const pasta = resolve(import.meta.dirname, "public");
const porta = Number(process.env.PORT || 5173);
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

http
  .createServer(async (pedido, resposta) => {
    try {
      const endereco = new URL(pedido.url, "http://localhost");
      const caminho = decodeURIComponent(endereco.pathname);
      const arquivo = resolve(
        pasta,
        "." + (caminho === "/" ? "/index.html" : caminho),
      );
      const permitido =
        arquivo.startsWith(pasta + sep) &&
        !caminho.split("/").some((parte) => parte.startsWith(".")) &&
        tipos[extname(arquivo)];

      if (!permitido) {
        resposta.writeHead(403);
        resposta.end("Acesso indisponível");
        return;
      }

      const conteudo = await readFile(arquivo);
      resposta.writeHead(200, {
        "Content-Type": tipos[extname(arquivo)],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      resposta.end(conteudo);
    } catch {
      resposta.writeHead(404);
      resposta.end("Arquivo não encontrado");
    }
  })
  .listen(porta, "127.0.0.1", () =>
    console.log(`Horizon Academic: http://localhost:${porta}`),
  );
