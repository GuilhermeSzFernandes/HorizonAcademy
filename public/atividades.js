import { isOverdue } from "./domain.js";
import {
  filters,
  statusNames,
  esc,
  icon,
  button,
  iconButton,
  badge,
  dueLabel,
  subjects,
  subjectOf,
  statusOf,
  myActivities,
  pending,
  empty,
  options,
  simpleOptions,
} from "./estado.js";
import { pageHead } from "./componentes.js";

function filteredActivities() {
  const busca = filters.search.toLocaleLowerCase("pt-BR");
  return myActivities()
    .filter((atividade) => {
      if (busca && !atividade.title.toLocaleLowerCase("pt-BR").includes(busca))
        return false;
      if (
        filters.status === "late" &&
        !isOverdue(atividade, statusOf(atividade))
      )
        return false;
      if (
        !["all", "late"].includes(filters.status) &&
        statusOf(atividade) !== filters.status
      )
        return false;
      if (filters.priority !== "all" && atividade.priority !== filters.priority)
        return false;
      if (filters.subject !== "all" && atividade.subjectId !== filters.subject)
        return false;
      if (filters.origin === "group" && !atividade.groupId) return false;
      if (filters.origin === "personal" && atividade.groupId) return false;
      return true;
    })
    .sort((primeira, segunda) =>
      filters.sort === "asc"
        ? primeira.due.localeCompare(segunda.due)
        : segunda.due.localeCompare(primeira.due),
    );
}
export function filterBar(calendar = false) {
  return `<div class="toolbar">
    ${!calendar ? `<label class="search-input">${icon("search", 17)}<input data-filter="search" aria-label="Buscar por título" placeholder="Buscar por título…" value="${esc(filters.search)}" /></label>` : ""}<select
      aria-label="Filtrar por disciplina"
      data-filter="subject"
    >
      <option value="all">Todas as disciplinas</option>
      ${options(subjects(), filters.subject)}</select
    >${
      !calendar
        ? `<select
            aria-label="Filtrar por prioridade"
            data-filter="priority"
          >
            <option value="all">Prioridade</option>
            ${simpleOptions(["Alta", "Média", "Baixa"], filters.priority)}
          </select>`
        : ""
    }<select aria-label="Filtrar por origem" data-filter="origin">
      ${options(
        [
          { id: "all", name: "Todas as origens" },
          { id: "personal", name: "Pessoal" },
          { id: "group", name: "Turma" },
        ],
        filters.origin,
      )}</select
    >${!calendar ? button(filters.sort === "asc" ? "Prazo ↑" : "Prazo ↓", "sort", "", "", "clock") : ""}${Object.entries(filters).some(([k, v]) => !["sort", "status"].includes(k) && v !== "" && v !== "all") ? button("Limpar", "clear-filters", "", "ghost") : ""}
  </div>`;
}
function activityTable(acts) {
  if (!acts.length)
    return empty(
      "Nenhuma atividade por aqui",
      "Crie uma atividade ou ajuste os filtros para encontrar o que procura.",
      "activity-form",
      "Nova atividade",
      "task",
    );
  return `<div class="table-wrap">
    <table class="activity-table">
      <thead>
        <tr>
          <th>Atividade</th>
          <th>Prazo</th>
          <th>Prioridade</th>
          <th>Origem</th>
          <th>Meu status</th>
          <th><span class="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        ${acts
          .map((a) => {
            const st = statusOf(a);
            return `<tr>
              <td>
                <div class="row">
                  <button
                    class="check ${st === "done" ? "checked" : ""}"
                    data-action="complete"
                    data-id="${a.id}"
                    aria-label="${st === "done" ? "Reabrir" : "Concluir"} ${esc(a.title)}"
                  >
                    ${st === "done" ? icon("check", 13) : ""}
                  </button>
                  <div>
                    <button
                      class="task-title"
                      data-action="activity-detail"
                      data-id="${a.id}"
                    >
                      ${esc(a.title)}
                    </button>
                    <div class="task-meta">
                      ${esc(subjectOf(a.subjectId)?.name || "Sem disciplina")} ·
                      ${esc(a.type)}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span class="${isOverdue(a, st) ? "text-danger" : ""}"
                  >${dueLabel(a.due)}</span
                >${isOverdue(a, st) ? '<div class="small text-danger mt8">Atrasada</div>' : ""}
              </td>
              <td>
                ${badge(a.priority, a.priority === "Alta" ? "danger" : a.priority === "Média" ? "warning" : "")}
              </td>
              <td>
                ${badge(a.groupId ? "Turma" : "Pessoal", a.groupId ? "primary" : "")}
              </td>
              <td>
                <select
                  class="status-select ${st}"
                  data-status="${a.id}"
                  aria-label="Meu status: ${esc(a.title)}"
                >
                  ${options(
                    Object.entries(statusNames).map(([id, name]) => ({
                      id,
                      name,
                    })),
                    st,
                  )}
                </select>
              </td>
              <td>
                ${iconButton("external", "activity-detail", a.id, "Ver detalhes")}
              </td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>`;
}
export function activitiesPage() {
  const acts = myActivities(),
    rows = filteredActivities();
  return (
    pageHead(
      "Atividades",
      "Menos pendências, mais espaço para aprender.",
      button("Nova atividade", "activity-form", "", "primary", "plus"),
    ) +
    filterBar() +
    `<section class="card">
        <div class="tabs" role="tablist" aria-label="Status das atividades">
          ${[
            ["all", "Todas"],
            ["pending", "Pendentes"],
            ["progress", "Em andamento"],
            ["done", "Concluídas"],
            ["late", "Atrasadas"],
          ]
            .map(
              ([id, name]) =>
                `<button
                  role="tab"
                  aria-selected="${filters.status === id}"
                  class="tab ${filters.status === id ? "active" : ""}"
                  data-action="status-tab"
                  data-id="${id}"
                >
                  ${name}${badge(acts.filter((a) => id === "all" || (id === "late" ? isOverdue(a, statusOf(a)) : statusOf(a) === id)).length)}
                </button>`,
            )
            .join("")}
        </div>
        ${activityTable(rows)}
        <div class="table-foot">
          <span>${rows.length} de ${acts.length} atividades</span
          ><span
            >Ordenadas por prazo
            ${filters.sort === "asc" ? "crescente" : "decrescente"}</span
          >
        </div>
      </section>
      <p class="privacy-note">
        ${icon("lock", 15)}Nas atividades de turma, seu status de conclusão é
        individual.
      </p>`
  );
}
