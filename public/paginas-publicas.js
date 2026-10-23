import { createSeed } from "./data.js";
import {
  db,
  esc,
  icon,
  brand,
  button,
  link,
  field,
  passwordField,
  localDate,
  dueLabel,
} from "./estado.js";

export function landingPage() {
  const sample = createSeed();
  const modules = [
    [
      "01",
      "calendar",
      "Agenda que acompanha você",
      "Veja o mês, a semana ou só os próximos compromissos.",
      "calendar",
    ],
    [
      "02",
      "book",
      "Disciplinas em ordem",
      "Reúna professor, atividades e notas no semestre certo.",
      "subjects",
    ],
    [
      "03",
      "users",
      "Sua turma no mesmo ritmo",
      "Divida atividades sem misturar seu progresso com o de ninguém.",
      "groups",
    ],
  ];
  return `<div class="public-page site-v3">
    <header class="public-header">
      <div class="public-header-inner">
        ${brand()}
        <nav class="public-nav" aria-label="Navegação da página">
          <a href="#modulos" data-scroll="modulos">O que você organiza</a
          ><a href="#vantagens" data-scroll="vantagens">Por que usar</a
          ><a href="#como-funciona" data-scroll="como-funciona">Como começar</a>
        </nav>
        <div class="public-auth">
          ${link("Entrar", "login", "btn ghost")}${link("Criar conta", "cadastro", "btn primary")}
        </div>
      </div>
    </header>
    <main id="main" tabindex="-1">
      <section class="hero hero-v3">
        <div class="hero-copy">
          <span class="hero-kicker-v3"
            >HORIZON ACADEMIC · SEU ESPAÇO DE ESTUDOS</span
          >
          <h1>Seu semestre pode ser <span>mais leve.</span></h1>
          <p>
            Organize disciplinas, atividades, notas e turmas em um lugar só.
            Enxergue o próximo passo e tenha mais espaço para aprender.
          </p>
          <div class="hero-actions">
            ${link("Começar agora", "cadastro", "btn primary lg", "arrow")}${button("Explorar demonstração", "demo", "", "lg hero-secondary", "external")}
          </div>
          <span class="hero-note"
            >${icon("info", 15)} Protótipo com dados de exemplo</span
          >
        </div>
        <div class="hero-illustration">
          <img
            src="./assets/hero-calendar-cutout.png"
            alt="Ilustração de dois estudantes organizando atividades em um calendário digital"
            width="1536"
            height="1024"
          />
        </div>
      </section>
      <div class="hero-stats" aria-label="Conteúdo da demonstração">
        <div class="hero-stats-label">NA DEMONSTRAÇÃO</div>
        ${[
          [String(sample.subjects.length), "disciplinas"],
          [String(sample.activities.length), "atividades"],
          [
            String(
              sample.groups.filter((g) =>
                g.members.some((m) => m.id === sample.user.id),
              ).length,
            ),
            "turmas participantes",
          ],
          ["03", "visões da agenda"],
        ]
          .map(
            ([value, label]) =>
              `<div class="hero-stat">
                <strong>${value}</strong><span>${label}</span>
              </div>`,
          )
          .join("")}
      </div>
      <section class="landing-section landing-modules" id="modulos">
        <div class="section-heading">
          <span class="section-kicker">TUDO NO SEU LUGAR</span>
          <h2>O que você precisa para seguir em frente.</h2>
          <p>
            Comece com o semestre de hoje. O Horizon mantém cada parte da rotina
            por perto.
          </p>
        </div>
        <div class="module-grid">
          ${modules
            .map(
              ([index, ico, title, copy, art]) =>
                `<article class="module-card">
                  <div class="module-art ${art}">
                    <span class="module-orbit"></span
                    ><span class="module-icon">${icon(ico, 66)}</span
                    ><span class="module-art-card"
                      >${icon("check", 20)} ${index} / 03</span
                    >
                  </div>
                  <div class="module-body">
                    <span class="module-index">${index} / 03</span>
                    <h3>${title}</h3>
                    <p>${copy}</p>
                    ${button("Ver na demonstração", "demo", "", "module-link", "arrow")}
                  </div>
                </article>`,
            )
            .join("")}
        </div>
      </section>
      <section class="landing-soft-section">
        <div class="landing-section">
          <div class="section-heading">
            <span class="section-kicker">UM DIA DE CADA VEZ</span>
            <h2>Menos tempo lembrando.<br />Mais tempo fazendo.</h2>
            <p>
              As próximas entregas aparecem com prazo, prioridade e contexto.
              Você escolhe por onde começar.
            </p>
          </div>
          <div class="benefit-visual">
            <img
              src="./assets/hero-students-cutout.png"
              alt="Dois estudantes consultam a agenda acadêmica digital entre livros e materiais de estudo"
              width="1536"
              height="1024"
              loading="lazy"
            />
          </div>
          <div class="benefit-grid">
            <article class="benefit-card">
              <span class="benefit-icon">${icon("task", 27)}</span>
              <h3>Seu próximo prazo</h3>
              <p>
                Atividades organizadas por data para você reconhecer o que pede
                atenção.
              </p>
            </article>
            <article class="benefit-card">
              <span class="benefit-icon">${icon("chart", 27)}</span>
              <h3>Notas com perspectiva</h3>
              <p>
                Acompanhe médias e simule uma avaliação antes de planejar seus
                estudos.
              </p>
            </article>
            <article class="benefit-card">
              <span class="benefit-icon">${icon("users", 27)}</span>
              <h3>Junto, do seu jeito</h3>
              <p>
                Compartilhe uma atividade com a turma e mantenha seu status
                individual.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section class="landing-blue-band" id="vantagens">
        <div class="blue-band-inner">
          <div class="blue-band-copy">
            <span class="blue-kicker">POR QUE HORIZON?</span>
            <h2>Uma visão clara para cada etapa.</h2>
            <p>
              Seu calendário, suas disciplinas e sua turma formam uma rotina só.
              Cada tela ajuda você a decidir o próximo passo.
            </p>
            <div class="blue-points">
              <span>${icon("check", 18)} Prazos em destaque</span
              ><span>${icon("check", 18)} Progresso individual</span
              ><span>${icon("check", 18)} Notas privadas</span>
            </div>
            ${button("Conhecer na prática", "demo", "", "blue-cta", "arrow")}
          </div>
          <div class="blue-demo">
            <div class="blue-demo-top">
              <span>${icon("calendar", 18)} Próximas entregas</span
              ><span>EXEMPLO</span>
            </div>
            <h3>O que vem pela frente</h3>
            ${sample.activities
              .slice(0, 3)
              .map(
                (a) =>
                  `<div class="blue-demo-row">
                    <span class="blue-demo-check">${icon("clock", 14)}</span>
                    <div>
                      <strong>${esc(a.title)}</strong
                      ><small
                        >${esc(sample.subjects.find((s) => s.id === a.subjectId)?.name || "Pessoal")}</small
                      >
                    </div>
                    <time>${esc(dueLabel(a.due))}</time>
                  </div>`,
              )
              .join("")}
            <div class="blue-demo-foot">
              ${icon("lock", 15)} Seu progresso é só seu
            </div>
          </div>
        </div>
      </section>
      <section class="landing-section landing-steps" id="como-funciona">
        <div class="section-heading">
          <span class="section-kicker">COMECE AGORA</span>
          <h2>Seu espaço toma forma com você.</h2>
          <p>
            Não precisa cadastrar tudo de uma vez. Dê o primeiro passo e
            organize o resto no seu ritmo.
          </p>
        </div>
        <div class="step-cards">
          ${[
            ["01", "Crie sua conta", "Abra seu espaço pessoal de estudos."],
            [
              "02",
              "Adicione um semestre",
              "Reúna disciplinas e registre os próximos prazos.",
            ],
            [
              "03",
              "Participe de uma turma",
              "Use um código ou crie a sua para dividir atividades.",
            ],
          ]
            .map(
              ([n, title, copy]) =>
                `<article>
                  <span>${n}</span>
                  <h3>${title}</h3>
                  <p>${copy}</p>
                </article>`,
            )
            .join("")}
        </div>
      </section>
      <section class="landing-final">
        <div>
          <span class="section-kicker">UM NOVO JEITO DE SE ORGANIZAR</span>
          <h2>Pronto para olhar adiante?</h2>
          <p>Comece pelo seu semestre. O próximo passo aparece depois.</p>
          ${link("Criar meu espaço", "cadastro", "btn primary lg", "arrow")}
        </div>
      </section>
    </main>
    <footer class="public-footer">
      ${brand(true)}
      <p>Horizon Academic · Protótipo acadêmico com dados fictícios.</p>
      <div class="row">
        ${link("Entrar", "login")}${link("Criar conta", "cadastro")}
      </div>
    </footer>
  </div>`;
}

export function authPage(register = false) {
  return `<div class="auth-layout">
    <aside class="auth-art">
      ${brand()}
      <div>
        <div class="eyebrow mb16">Seu semestre, em perspectiva</div>
        <h2>
          Um horizonte<br />de possibilidades.<br />Um passo de<br />cada vez.
        </h2>
        <p>
          Organize o que vem pela frente e abra espaço para o que importa:
          aprender.
        </p>
        <div class="auth-horizon" aria-hidden="true"></div>
      </div>
      <span class="small muted"
        >Horizon Academic · Feito para o seu próximo capítulo.</span
      >
    </aside>
    <main class="auth-form-side" id="main">
      <a class="auth-back link" href="#/"
        >${icon("back", 16)}Voltar ao início</a
      >
      <div class="auth-form">
        <h1>${register ? "Crie seu espaço." : "Bom ter você de volta."}</h1>
        <p>
          ${register ? "Um semestre mais organizado começa por aqui." : "Entre para continuar de onde parou."}
        </p>
        <form
          data-form="${register ? "register" : "login"}"
          ${register ? "" : "novalidate"}
        >
          <div class="form-error" role="alert"></div>
          ${register ? field("Nome completo", "name", "", "text", 'required minlength="3" maxlength="80" autocomplete="name" placeholder="Como podemos chamar você?"') : ""}${field("E-mail", "email", "", "email", register ? 'required autocomplete="email" placeholder="seu@email.com"' : 'autocomplete="off" placeholder="seu@email.com"')}${register ? passwordField("Senha", "password", "new-password") : passwordField("Senha", "password", "off", false)}${register ? passwordField("Confirme sua senha", "confirm", "new-password") : ""}<button
            class="btn primary full"
            type="submit"
          >
            ${register ? "Criar conta" : "Entrar → (fake)"}${register ? icon("arrow", 16) : ""}
          </button>
        </form>
        <div class="auth-switch">
          ${register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
          ${link(register ? "Entrar" : "Criar conta", register ? "login" : "cadastro")}
        </div>
      </div>
    </main>
  </div>`;
}
export function onboardingPage(step = "1") {
  const s = db.semesters.find((s) => s.id === db.selectedSemester);
  return `<main class="onboarding" id="main">
    ${brand()}
    <section class="onboard-card">
      <div class="onboard-steps">
        <i class="active"></i><i class="${step === "2" ? "active" : ""}"></i>
      </div>
      <span class="eyebrow">PASSO ${step === "2" ? "2" : "1"} DE 2</span>
      <h1 class="mt16">
        ${step === "2" ? "Sua primeira disciplina." : "Vamos dar nome ao seu semestre?"}
      </h1>
      <p>
        ${step === "2" ? "Adicione uma matéria para começar. Você pode incluir as outras depois." : "Um pequeno começo para organizar tudo o que vem pela frente."}
      </p>
      <form
        data-form="${step === "2" ? "onboard-subject" : "onboard-semester"}"
      >
        <div class="form-error" role="alert"></div>
        <div class="form-grid">
          ${
            step === "2"
              ? `${field("Nome da disciplina", "name", "", "text", 'required maxlength="80" placeholder="Ex.: Cálculo I"')}${field("Professor (opcional)", "teacher", "", "text", 'maxlength="80"')}${field("Cor da disciplina", "color", "#753de7", "color")}${field("Média mínima desejada", "target", "7", "number", 'min="0" max="10" step="0.1" required')}`
              : `<div class="span2">
                    ${field("Nome do semestre", "name", s?.name || `${new Date().getFullYear()}.2`, "text", 'required maxlength="40" placeholder="Ex.: 2026.2"')}
                  </div>
                  ${field("Data de início", "start", s?.start || localDate(new Date()), "date", "required")}${field("Data de término", "end", s?.end || `${new Date().getFullYear()}-12-31`, "date", "required")}`
          }
        </div>
        <div class="modal-footer">
          ${link("Configurar depois", "dashboard", "btn ghost")}<button
            class="btn primary"
            type="submit"
          >
            ${step === "2" ? "Começar meu semestre" : "Continuar"}${icon("arrow", 15)}
          </button>
        </div>
      </form>
    </section>
  </main>`;
}
