# Horizon Academic

Frontend completo em **HTML, CSS e JavaScript puros**, sem dependências de execução ou etapa de build. A interface usa a direção visual da referência enviada pelo usuário: lavanda e violeta, ilustração educacional, cartões claros, seção azul e nova cor da logo. Os dados e fluxos continuam sendo de um planejador acadêmico.

## Executar

Requer Node.js 22 ou superior.

```sh
npm run dev
```

Abra **http://localhost:5173**. Não é necessário executar `npm install`.

Para usar outra porta no PowerShell:

```powershell
$env:PORT = '5174'
npm run dev
```

O servidor serve somente os arquivos locais. Ele não implementa API, autenticação ou banco de dados.

## Publicar na Vercel

O projeto é publicado como site estático a partir da pasta `public/`. Não há etapa de build.

Após autenticar no CLI e escolher o projeto correto:

```sh
vercel link
vercel deploy --prod
```

O cadastro e os dados da demonstração ficam no navegador de cada visitante. Não há backend compartilhado nesta versão.

## Apresentação rápida

1. Abra a landing page e clique em **Explorar demonstração**.
2. No dashboard, crie uma atividade. Ela aparecerá também em Atividades e Calendário.
3. Em Atividades, experimente busca, filtros, alteração de status, detalhes, edição e exclusão.
4. Em Disciplinas, abra Cálculo I e confira atividades e avaliações.
5. Em Turmas, abra **Banco de Dados · Turma A**: Mariana é proprietária. As abas Membros e Solicitações permitem remover membros e aprovar ou recusar ingressos.
6. Abra **Cálculo I · Engenharia** para conferir a experiência de membro: a prova publicada por Lucas pode ser concluída individualmente, mas não editada por Mariana.
7. Em Notas, escolha uma disciplina, cadastre avaliações e use o simulador. Cada disciplina permite média simples, ponderada ou pontos nas configurações.
8. No Calendário, alterne entre mês, semana e lista. Selecione uma data para criar uma atividade.
9. Em Configurações, altere a senha local ou restaure os dados de demonstração.

### Acesso de demonstração

Na tela de login, os campos são ilustrativos: **Entrar → (fake)** abre diretamente os dados locais da demonstração. **Explorar demonstração** na landing faz o mesmo.

### Códigos de turma

| Código | Resultado inicial |
| --- | --- |
| `ETICA27` | Ingresso automático |
| `FISICA27` | Solicitação aguardando aprovação |
| `CALC27` | Usuária já participante |
| Qualquer outro | Código inválido |

Os códigos gerados ao criar uma turma podem ser copiados na tela de detalhes.

## Telas e fluxos

| Rota | Conteúdo |
| --- | --- |
| `#/` | Landing page, funcionalidades, demonstração visual, como funciona e CTA |
| `#/login` | Campos ilustrativos e acesso direto à demonstração |
| `#/cadastro` | Cadastro e confirmação de senha |
| `#/inicio/1` e `#/inicio/2` | Primeiro semestre e primeira disciplina; configuração pode ser pulada |
| `#/dashboard` | Resumo calculado a partir dos dados, agenda, atividades, disciplinas e turmas |
| `#/atividades` | Busca, filtros, ordenação, criação, detalhes, edição, exclusão e conclusão individual |
| `#/disciplinas` | Disciplinas do semestre selecionado |
| `#/disciplinas/:id` | Informações, atividades e avaliações da disciplina |
| `#/turmas` | Turmas participantes, solicitações enviadas, criação e ingresso por código |
| `#/turmas/:id` | Código, atividades, membros, solicitações e permissões por papel |
| `#/calendario` | Mês, semana, lista, filtros, seleção de data e criação contextual |
| `#/notas` | Avaliações, médias, configuração do cálculo e simulação |
| `#/semestres` | Criação, edição, exclusão e definição de semestre principal |
| `#/perfil` | Nome, e-mail, curso e instituição |
| `#/configuracoes` | Senha local, sessão e restauração da demonstração |

Todos os módulos usam componentes visuais consistentes e layouts para desktop, tablet e celular. Há estados vazios, validações, feedbacks, confirmação de exclusão e indicadores de processamento. Modais possuem fechamento por Escape, foco inicial e contenção do foco de teclado.

## Limites do protótipo

- Os dados são fictícios e ficam no `localStorage` deste navegador. Não há sincronização entre computadores ou colaboração em tempo real.
- O cadastro cria um único perfil local e substitui a sessão de demonstração. Use dados fictícios. A senha é representada por um hash local; isso não constitui autenticação segura para produção.
- As permissões representam as regras visuais e comportamentais solicitadas. Uma futura implementação de backend deverá validá-las no servidor.
- As datas iniciais são relativas ao dia em que a demonstração é criada. Atraso é calculado pela data e hora locais, respeitando o status individual.
- Restaurar a demonstração apaga as alterações locais após confirmação.

## Conferir a sintaxe

```sh
npm run check
```

## Arquivos

- `public/index.html`: entrada e metadados.
- `public/styles.css`: identidade, componentes e responsividade.
- `public/app.js`: inicialização da interface.
- `public/estado.js`: dados locais e funções compartilhadas.
- `public/componentes.js`: elementos usados em várias telas.
- `public/atividades.js`, `public/estudos.js`, `public/turmas.js`, `public/calendario.js` e `public/painel.js`: telas do produto.
- `public/paginas-publicas.js`: apresentação, entrada e primeiro acesso.
- `public/formularios.js`: janelas e campos de edição.
- `public/acoes.js`, `public/envios.js` e `public/navegacao.js`: interações do usuário.
- `public/data.js`: dados fictícios consistentes.
- `public/domain.js`: regras de cálculo, atraso e permissões.
- `public/assets/`: logo e ilustrações usadas na interface.
- `server.mjs`: servidor estático local sem dependências.
