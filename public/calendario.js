import {
  filters,
  estado,
  esc,
  button,
  iconButton,
  badge,
  localDate,
  dateLabel,
  dueLabel,
  myActivities,
  empty,
} from "./estado.js";
import { pageHead, taskRow } from "./componentes.js";
import { filterBar } from "./atividades.js";

export function calendarPage() {
  const month = estado.dataCalendario.getMonth(),
    year = estado.dataCalendario.getFullYear();
  const filtered = myActivities().filter(
    (a) =>
      (filters.subject === "all" || a.subjectId === filters.subject) &&
      (filters.origin === "all" ||
        (filters.origin === "group" ? !!a.groupId : !a.groupId)),
  );
  const forDate = (d) =>
    filtered
      .filter((a) => a.due.startsWith(d))
      .sort((a, b) => a.due.localeCompare(b.due));
  const event = (a) =>
    `<button
      class="calendar-event ${a.type === "Prova" ? "exam" : a.type === "Trabalho" ? "work" : ""}"
      data-action="activity-detail"
      data-id="${a.id}"
      title="${esc(a.title)} · ${dueLabel(a.due)}"
    >
      ${esc(a.title)}
    </button>`;
  const first = new Date(year, month, 1),
    start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
  const days = Array.from(
    {
      length:
        Math.ceil(
          (((first.getDay() + 6) % 7) +
            new Date(year, month + 1, 0).getDate()) /
            7,
        ) * 7,
    },
    (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    },
  );
  const weekStart = new Date(estado.dataCalendario);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const body =
    estado.visaoCalendario === "month"
      ? `<div class="calendar-grid">
          ${["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((d) => `<div class="calendar-weekday">${d}</div>`).join("")}${days
            .map((d) => {
              const key = localDate(d);
              return `<div
                class="calendar-day ${d.getMonth() !== month ? "outside" : ""} ${key === localDate(new Date()) ? "today" : ""} ${key === estado.dataSelecionada ? "selected" : ""}"
                data-action="select-date"
                data-id="${key}"
              >
                <button
                  class="day-number"
                  data-action="select-date"
                  data-id="${key}"
                  aria-label="Ver atividades em ${dateLabel(key, { day: "numeric", month: "long" })}"
                  aria-pressed="${key === estado.dataSelecionada}"
                >
                  ${d.getDate()}</button
                >${forDate(key).slice(0, 3).map(event).join("")}${forDate(key).length > 3 ? `<span class="small muted">+${forDate(key).length - 3}</span>` : ""}
              </div>`;
            })
            .join("")}
        </div>`
      : estado.visaoCalendario === "week"
        ? `<div class="calendar-week">
            ${Array.from({ length: 7 }, (_, i) => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + i);
              return `<div>
                <h3>
                  ${dateLabel(localDate(d), { weekday: "short", day: "numeric" })}
                </h3>
                ${forDate(localDate(d)).map(event).join("")}${button("+", "date-activity", localDate(d), "sm ghost")}
              </div>`;
            }).join("")}
          </div>`
        : `<div style="padding:0 24px">
            ${
              filtered
                .filter(
                  (a) =>
                    new Date(a.due).getMonth() === month &&
                    new Date(a.due).getFullYear() === year,
                )
                .sort((a, b) => a.due.localeCompare(b.due))
                .map((a) => taskRow(a))
                .join("") ||
              empty(
                "Um mês com espaço livre",
                "Nenhuma atividade neste período. Selecione uma data para planejar.",
                "",
                "",
                "calendar",
              )
            }
          </div>`;
  const dayActs = forDate(estado.dataSelecionada);
  return (
    pageHead(
      "Calendário",
      "Uma perspectiva clara dos seus próximos dias.",
      button("Nova atividade", "activity-form", "", "primary", "plus"),
    ) +
    filterBar(true) +
    `<div class="calendar-layout">
      <section class="card calendar-card">
        <div class="card-head calendar-toolbar">
          <div class="row gap8">
            ${iconButton("back", "calendar-prev", "", "Período anterior")}
            <h2>
              ${dateLabel(localDate(estado.dataCalendario), { month: "long", year: "numeric" })}
            </h2>
            ${iconButton("arrow", "calendar-next", "", "Próximo período")}${button("Hoje", "calendar-today", "", "sm ghost")}
          </div>
          <div
            class="segmented"
            role="group"
            aria-label="Visualização do calendário"
          >
            ${[
              ["month", "Mês"],
              ["week", "Semana"],
              ["list", "Lista"],
            ]
              .map(
                ([v, label]) =>
                  `<button
                    data-action="calendar-view"
                    data-id="${v}"
                    class="${estado.visaoCalendario === v ? "active" : ""}"
                    aria-pressed="${estado.visaoCalendario === v}"
                  >
                    ${label}
                  </button>`,
              )
              .join("")}
          </div>
        </div>
        ${body}
      </section>
      <aside class="calendar-aside">
        <section class="card">
          <div class="eyebrow">Sua agenda</div>
          <h2 class="mt16">
            ${dateLabel(estado.dataSelecionada, { day: "numeric", month: "long" })}
          </h2>
          ${dayActs.map((a) => taskRow(a, true)).join("") || '<p class="small muted mt24">Nenhuma atividade nesta data. Um bom espaço para se organizar.</p>'}
          <div class="mt24">
            ${button("Criar nesta data", "date-activity", estado.dataSelecionada, "full", "plus")}
          </div>
        </section>
        <div class="row wrap mt16 small muted">
          ${badge("Provas", "danger")}${badge("Trabalhos", "warning")}${badge("Tarefas", "primary")}
        </div>
      </aside>
    </div>`
  );
}
