import {
  db,
  esc,
  icon,
  initials,
  button,
  link,
  localDate,
  dateLabel,
  dueLabel,
  ownGroups,
  subjects,
  subjectOf,
  statusOf,
  myActivities,
  pending,
  empty,
} from "./estado.js";
import { taskRow, miniSubject } from "./componentes.js";

function weekStrip() {
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return `<div class="week-strip week-strip-v2">
    ${Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = localDate(d);
      const n = myActivities().filter((a) => a.due.startsWith(key)).length;
      return `<button
        class="week-day ${key === localDate(new Date()) ? "today" : ""}"
        data-action="calendar-day"
        data-id="${key}"
        aria-label="${dateLabel(key, { weekday: "long", day: "numeric", month: "long" })}${n ? `, ${n} ${n === 1 ? "atividade" : "atividades"}` : ""}"
      >
        <span>${["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"][i]}</span
        ><strong>${d.getDate()}</strong><i class="${n ? "marked" : ""}"></i>
      </button>`;
    }).join("")}
  </div>`;
}

export function dashboardPage() {
  const acts = myActivities(),
    todo = pending().sort((a, b) => a.due.localeCompare(b.due)),
    done = acts.filter((a) => statusOf(a) === "done").length,
    groups = ownGroups();
  const today = localDate(new Date());
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const metrics = [
    ["A fazer", todo.length, "No semestre ativo"],
    ["Concluídas", done, "No seu ritmo"],
    ["Disciplinas", subjects().length, "Em andamento"],
    ["Turmas", groups.length, "Compartilhadas"],
  ];
  return `<section class="dashboard-welcome">
      <div>
        <p class="dashboard-date">
          ${esc(dateLabel(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}
        </p>
        <h1>${greeting}, ${esc(db.user.name.split(" ")[0])}.</h1>
        <p>Veja o que pede atenção e siga no seu ritmo.</p>
      </div>
      ${button("Criar atividade", "activity-form", "", "primary", "plus")}
    </section>
    <section class="stats" aria-label="Resumo acadêmico">
      ${metrics.map(([label, value, caption]) => `<div class="stat-card"><span class="stat-label">${label}</span><strong class="stat-value">${value}</strong><span class="stat-caption">${caption}</span></div>`).join("")}
    </section>
    <div class="dashboard-grid">
      <section class="card task-panel">
        <div class="card-head">
          <div>
            <h2>Na sua lista</h2>
            <p>Próximos compromissos por prazo</p>
          </div>
          ${link("Todas as atividades", "atividades", "link", "arrow")}
        </div>
        ${
          todo.length
            ? todo
                .slice(0, 5)
                .map((a) => taskRow(a))
                .join("")
            : empty(
                "Tudo em dia",
                "Você não tem atividades pendentes.",
                "activity-form",
                "Criar atividade",
                "check",
              )
        }
      </section>
      <aside class="agenda-panel">
        <div class="card-head">
          <div>
            <h2>Seu horizonte</h2>
            <p>Os próximos sete dias</p>
          </div>
          ${link("Calendário", "calendario", "link", "arrow")}
        </div>
        ${weekStrip()}
        <div class="agenda-next">
          <span class="agenda-label"
            >HOJE · ${dateLabel(today).toUpperCase()}</span
          >${
            acts
              .filter((a) => a.due.startsWith(today))
              .map(
                (a) =>
                  `<button
                    class="agenda-task"
                    data-action="activity-detail"
                    data-id="${a.id}"
                  >
                    <strong>${esc(a.title)}</strong
                    ><span
                      >${esc(subjectOf(a.subjectId)?.name || "Pessoal")} ·
                      ${dueLabel(a.due)}</span
                    >
                  </button>`,
              )
              .join("") ||
            "<p>Sem entregas para hoje. Confira os próximos dias.</p>"
          }
        </div>
        <div class="agenda-progress">
          <div class="row between">
            <span>Atividades concluídas</span
            ><strong
              >${acts.length ? Math.round((done / acts.length) * 100) : 0}%</strong
            >
          </div>
          <div
            class="progress"
            role="progressbar"
            aria-label="Atividades concluídas"
            aria-valuenow="${acts.length ? Math.round((done / acts.length) * 100) : 0}"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span
              style="width:${acts.length ? (done / acts.length) * 100 : 0}%"
            ></span>
          </div>
        </div>
      </aside>
    </div>
    <div class="dashboard-lower">
      <section class="dashboard-subjects">
        <div class="card-head">
          <div>
            <h2>Disciplinas em curso</h2>
            <p>O que compõe seu semestre</p>
          </div>
          ${link("Ver disciplinas", "disciplinas", "link", "arrow")}
        </div>
        <div class="subject-mini-grid">
          ${subjects().slice(0, 3).map(miniSubject).join("") || empty("Seu semestre começa aqui", "Adicione sua primeira disciplina.", "subject-form", "Adicionar disciplina")}
        </div>
        <div class="quick-actions">
          ${button("Adicionar disciplina", "subject-form", "", "sm ghost", "plus")}${button("Ingressar em turma", "join-group", "", "sm ghost", "users")}
        </div>
      </section>
      <section class="dashboard-groups">
        <div class="card-head">
          <div>
            <h2>Suas turmas</h2>
            <p>Prazos que vocês compartilham</p>
          </div>
          ${link("Ver turmas", "turmas", "link", "arrow")}
        </div>
        ${
          groups
            .slice(0, 2)
            .map(
              (g) =>
                `<a href="#/turmas/${g.id}" class="group-mini row"
                  ><span class="group-monogram" aria-hidden="true"
                    >${esc(initials(g.name))}</span
                  >
                  <div>
                    <h3>${esc(g.name)}</h3>
                    <p>
                      ${g.members.length} membros ·
                      ${g.ownerId === db.user.id ? "Você é proprietária" : "Membro"}
                    </p>
                  </div>
                  ${icon("chevron", 15)}</a
                >`,
            )
            .join("") ||
          '<p class="small muted">Suas turmas aparecerão aqui.</p>'
        }
      </section>
    </div>`;
}
