import { average, simulatedAverage } from "./domain.js";
import {
  db,
  estado,
  methodNames,
  esc,
  icon,
  button,
  link,
  iconButton,
  badge,
  dateLabel,
  num,
  subjects,
  subjectOf,
  myActivities,
  pending,
  empty,
  options,
  field,
} from "./estado.js";
import { pageHead, taskRow, missing } from "./componentes.js";

function subjectCard(s) {
  const avg = average(s, db.evaluations),
    count = pending().filter((a) => a.subjectId === s.id).length;
  return `<article class="card subject-card">
    <div class="card-head">
      <a href="#/disciplinas/${s.id}"><h2>${esc(s.name)}</h2></a
      ><span class="dot" style="background:${esc(s.color)}"></span>
    </div>
    <p class="teacher">${esc(s.teacher || "Professor não informado")}</p>
    <div class="subject-numbers">
      <div>
        <strong>${num(avg)}</strong
        ><span
          >${s.method === "points" ? "Pontos acumulados" : "Média atual"}</span
        >
      </div>
      <div><strong>${count}</strong><span>Atividades pendentes</span></div>
    </div>
    <div class="card-footer">
      <span class="small muted"
        >${esc(db.semesters.find((x) => x.id === s.semesterId)?.name || "")}</span
      >${link("Ver disciplina", "disciplinas/" + s.id, "link", "external")}
    </div>
  </article>`;
}
export function subjectsPage() {
  return (
    pageHead(
      "Disciplinas",
      "Seu conhecimento, organizado por semestre.",
      button("Adicionar disciplina", "subject-form", "", "primary", "plus"),
    ) +
    `<div class="toolbar">
        <span class="badge primary"
          >${esc(db.semesters.find((s) => s.id === db.selectedSemester)?.name || "Sem semestre")}</span
        ><span class="small muted"
          >${subjects().length} disciplinas · Informações privadas</span
        >
      </div>
      <div class="cards-grid">${subjects().map(subjectCard).join("")}</div>
      ${!subjects().length ? `<div class="card">${empty("Um novo começo", "Adicione sua primeira disciplina e organize seu semestre.", "subject-form", "Adicionar disciplina")}</div>` : ""}`
  );
}
function evaluationTable(s) {
  const rows = db.evaluations.filter((e) => e.subjectId === s.id);
  return rows.length
    ? `<div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Avaliação</th>
              <th>${s.method === "points" ? "Pontos" : "Nota"}</th>
              <th>${s.method === "weighted" ? "Peso" : "Valor"}</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (e) =>
                  `<tr>
                    <td>${esc(e.name)}</td>
                    <td><strong>${num(e.grade)}</strong></td>
                    <td class="muted">
                      ${s.method === "weighted" ? e.weight : s.method === "points" ? "Acumulativo" : "Igual"}
                    </td>
                    <td>
                      <div class="row gap8">
                        ${iconButton("edit", "evaluation-form", e.id, "Editar avaliação")}${iconButton("trash", "delete-evaluation", e.id, "Excluir avaliação")}
                      </div>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    : empty(
        "Ainda sem avaliações",
        "Cadastre uma avaliação para acompanhar seu desempenho.",
        "evaluation-new",
        "Cadastrar avaliação",
        "chart",
      );
}
export function subjectDetail(id) {
  const s = subjectOf(id);
  if (!s) return missing();
  const avg = average(s, db.evaluations);
  return (
    pageHead(
      s.name,
      "Disciplinas / Detalhes da disciplina",
      button("Editar", "subject-form", s.id, "", "edit") +
        button("Excluir", "delete-subject", s.id, "ghost text-danger", "trash"),
    ) +
    `<div class="detail-meta">
        <span class="row gap8"
          ><span class="dot" style="background:${esc(s.color)}"></span
          >${esc(s.teacher || "Professor não informado")}</span
        ><span
          >Semestre
          ${esc(db.semesters.find((x) => x.id === s.semesterId)?.name)}</span
        ><span
          >Meta ${num(s.target)}${s.method === "points" ? " pontos" : ""}</span
        >
      </div>
      <div class="detail-grid">
        <div class="stack">
          <section class="card">
            <div class="card-head">
              <h2>Atividades vinculadas</h2>
              ${button("Criar atividade", "activity-subject", s.id, "sm", "plus")}
            </div>
            ${
              myActivities()
                .filter((a) => a.subjectId === s.id)
                .map((a) => taskRow(a))
                .join("") ||
              empty(
                "Sem atividades",
                "As atividades desta disciplina aparecerão aqui.",
                "",
                "",
                "task",
              )
            }
          </section>
          <section class="card">
            <div class="card-head">
              <h2>Avaliações e notas</h2>
              ${button("Cadastrar", "evaluation-subject", s.id, "sm", "plus")}
            </div>
            ${evaluationTable(s)}
          </section>
        </div>
        <aside class="stack">
          <section class="card">
            <h2>Seu desempenho</h2>
            <div class="big-number mt16">${num(avg)}</div>
            <p class="small muted mt16">${methodNames[s.method]}</p>
            <div class="mt16">
              ${avg == null ? badge("Sem avaliações") : badge(avg >= s.target ? "Meta alcançada" : "Abaixo da meta", avg >= s.target ? "success" : "warning")}
            </div>
            <p class="small muted mt16">
              Mínimo desejado:
              ${num(s.target)}${s.method === "points" ? " pontos" : ""}
            </p>
            ${link("Ver notas e simular", "notas/" + s.id, "btn full mt24", "arrow")}
          </section>
          <p class="privacy-note">
            ${icon("lock", 15)}Suas notas e disciplinas são privadas.
          </p>
        </aside>
      </div>`
  );
}
export function gradesPage(id) {
  if (id && subjectOf(id)) estado.disciplinaNotas = id;
  const s =
    subjects().find((s) => s.id === estado.disciplinaNotas) || subjects()[0];
  if (!s)
    return (
      pageHead(
        "Notas e desempenho",
        "Conheça seu progresso, planeje seu próximo passo.",
      ) +
      `<div class="card">
        ${empty("Primeiro, uma disciplina", "Adicione uma disciplina para começar a registrar suas notas.", "subject-form", "Adicionar disciplina", "chart")}
      </div>`
    );
  estado.disciplinaNotas = s.id;
  const avg = average(s, db.evaluations);
  return (
    pageHead(
      "Notas e desempenho",
      "Seu progresso merece uma visão clara.",
      button(
        "Cadastrar avaliação",
        "evaluation-subject",
        s.id,
        "primary",
        "plus",
      ),
    ) +
    `<div class="toolbar">
        <select data-control="grade-subject" aria-label="Selecionar disciplina">
          ${options(subjects(), s.id)}</select
        ><span class="privacy-note" style="margin:0"
          >${icon("lock", 14)}Suas notas são privadas.</span
        >
      </div>
      <div class="detail-grid">
        <div class="stack">
          <section class="card">
            <div class="card-head">
              <div>
                <h2>${esc(s.name)}</h2>
                <p class="small muted mt16">
                  ${esc(s.teacher || "Professor não informado")}
                </p>
              </div>
              ${button("Configurar cálculo", "subject-form", s.id, "sm", "settings")}
            </div>
            <div class="row between">
              <div>
                <div class="eyebrow">
                  ${s.method === "points" ? "Pontos acumulados" : "Média atual"}
                </div>
                <div class="big-number mt16">${num(avg)}</div>
              </div>
              <div style="text-align:right">
                <div class="small muted">Meta mínima</div>
                <div style="font-size:26px;margin:8px 0">${num(s.target)}</div>
                ${avg == null ? badge("Sem avaliações") : badge(avg >= s.target ? "Meta alcançada" : "Abaixo da meta", avg >= s.target ? "success" : "warning")}
              </div>
            </div>
            <div class="card-footer mt24">
              <span class="small muted">${methodNames[s.method]}</span
              ><span class="small muted"
                >${db.evaluations.filter((e) => e.subjectId === s.id).length}
                avaliações</span
              >
            </div>
          </section>
          <section class="card">
            <div class="card-head">
              <h2>Avaliações</h2>
              ${button("Adicionar", "evaluation-subject", s.id, "sm", "plus")}
            </div>
            ${evaluationTable(s)}
          </section>
        </div>
        <aside class="stack">
          <section class="card">
            <div class="row gap8">
              <span class="text-primary">${icon("target")}</span>
              <h2>Simulador de notas</h2>
            </div>
            <p class="small muted mt16 mb16">
              E se a próxima avaliação fosse assim? Simule sem alterar suas
              notas.
            </p>
            <form id="simulator" data-form="simulate">
              <div class="stack">
                ${field(s.method === "points" ? "Próximos pontos" : "Nota da próxima avaliação", "grade", 8, "number", `min="0" ${s.method === "points" ? "" : 'max="10"'} step="0.1" required`)}${s.method === "weighted" ? field("Peso da avaliação", "weight", 1, "number", 'min="0.1" max="100" step="0.1" required') : '<input type="hidden" name="weight" value="1">'}<button
                  class="btn full"
                  type="submit"
                >
                  ${icon("chart", 16)}Simular resultado
                </button>
              </div>
              <div class="form-error mt16" role="alert"></div>
            </form>
            <div id="sim-result" class="sim-result mt24">
              <span class="small muted">Média projetada</span
              ><strong>${num(simulatedAverage(s, db.evaluations, 8, 1))}</strong
              ><span class="small muted"
                >Simulação · não altera as avaliações</span
              >
            </div>
          </section>
        </aside>
      </div>
      <section class="card mt24">
        <div class="card-head"><h2>Visão geral das disciplinas</h2></div>
        ${subjects()
          .map((d) => {
            const n = average(d, db.evaluations);
            return `<div class="score-bar">
              <a href="#/notas/${d.id}">${esc(d.name)}</a>
              <div class="progress">
                <span
                  style="width:${Math.min(100, Math.max(0, ((n || 0) / (d.method === "points" ? Math.max(1, d.target) : 10)) * 100))}%;background:${esc(d.color)}"
                ></span>
              </div>
              <strong>${num(n)}</strong>
            </div>`;
          })
          .join("")}
      </section>`
  );
}
export function semestersPage() {
  return (
    pageHead(
      "Semestres",
      "Cada etapa do seu caminho, em seu lugar.",
      button("Novo semestre", "semester-form", "", "primary", "plus"),
    ) +
    `<div class="stack">
        ${
          db.semesters
            .map(
              (s) =>
                `<article class="card semester-card">
                  <div class="semester-illustration">${icon("layers", 28)}</div>
                  <div class="grow">
                    <div class="row wrap">
                      <h2>${esc(s.name)}</h2>
                      ${s.primary ? badge("Semestre principal", "primary") : ""}
                    </div>
                    <p class="small muted mt16">
                      ${dateLabel(s.start)} a
                      ${dateLabel(s.end, { day: "numeric", month: "short", year: "numeric" })}
                      ·
                      ${db.subjects.filter((d) => d.semesterId === s.id).length}
                      disciplinas
                    </p>
                  </div>
                  <div class="semester-actions">
                    ${button("Ver disciplinas", "semester-subjects", s.id, "sm", "book")}${!s.primary ? button("Definir principal", "semester-primary", s.id, "sm") : ""}${iconButton("edit", "semester-form", s.id, "Editar semestre")}${iconButton("trash", "delete-semester", s.id, "Excluir semestre")}
                  </div>
                </article>`,
            )
            .join("") ||
          `<div class="card">
            ${empty("Seu próximo capítulo", "Crie um semestre para organizar suas disciplinas.", "semester-form", "Criar semestre", "layers")}
          </div>`
        }
      </div>
      <p class="privacy-note">
        ${icon("info", 15)}Você pode cadastrar vários semestres. Apenas um é o
        principal.
      </p>`
  );
}
