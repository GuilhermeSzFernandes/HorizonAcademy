import { isOverdue } from "./domain.js";
import {
  app,
  db,
  estado,
  nav,
  esc,
  icon,
  brand,
  avatar,
  button,
  link,
  iconButton,
  badge,
  dueLabel,
  subjectOf,
  statusOf,
  pending,
  empty,
  options,
} from "./estado.js";

export function pageHead(title, subtitle, actions = "", meta = "") {
  return `<div class="page-head">
    <div>
      <h1>${esc(title)}</h1>
      <p>${esc(subtitle)}</p>
      ${meta ? `<span class="page-meta">${esc(meta)}</span>` : ""}
    </div>
    ${actions ? `<div class="page-actions">${actions}</div>` : ""}
  </div>`;
}
export function shell(content, section) {
  const active =
    nav.find((n) => n[0] === section)?.[1] ||
    (section === "perfil" ? "Meu perfil" : "Configurações");
  return `<aside
      class="sidebar ${estado.menuAberto ? "open" : ""}"
      aria-label="Navegação principal"
    >
      ${brand()}
      <div class="nav-label eyebrow">Seu espaço</div>
      <nav>
        ${nav.map(([route, label, ico]) => `<a href="#/${route}" class="nav-link ${section === route ? "active" : ""}" ${section === route ? 'aria-current="page"' : ""} title="${label}">${icon(ico)}<span class="nav-text">${label}</span>${route === "atividades" ? `<span class="count">${pending().length}</span>` : ""}</a>`).join("")}
      </nav>
      <div class="sidebar-bottom">
        <a
          class="nav-link ${section === "configuracoes" ? "active" : ""}"
          href="#/configuracoes"
          title="Configurações"
          >${icon("settings")}<span class="nav-text">Configurações</span></a
        ><a href="#/perfil" class="sidebar-user row"
          >${avatar()}<span class="user-copy"
            ><strong>${esc(db.user.name)}</strong
            ><span class="small muted"
              >Meu perfil ${icon("external", 11)}</span
            ></span
          ></a
        >
      </div>
    </aside>
    <div class="app-frame">
      <header class="topbar">
        <div class="row">
          ${iconButton("menu", "menu", "", "Abrir menu")}
          <div class="breadcrumb">
            <span>Meu espaço</span><span>/</span><span>${active}</span>
          </div>
        </div>
        <div class="row">
          <label class="sr-only" for="global-semester"
            >Semestre em visualização</label
          ><select id="global-semester" data-control="semester">
            ${options(db.semesters, db.selectedSemester).replaceAll("</option>", "</option>")}</select
          ><a href="#/perfil" title="Meu perfil">${avatar()}</a>
        </div>
      </header>
      <main id="main" class="content" tabindex="-1">${content}</main>
    </div>
    <nav class="mobile-bottom" aria-label="Atalhos">
      ${nav
        .slice(0, 5)
        .map(
          ([route, label, ico]) =>
            `<a
              href="#/${route}"
              class="${section === route ? "active" : ""}"
              ${section === route ? 'aria-current="page"' : ""}
              >${icon(ico, 19)}<span
                >${label === "Dashboard" ? "Início" : label}</span
              ></a
            >`,
        )
        .join("")}
    </nav>`;
}
export function taskRow(a, compact = false) {
  const st = statusOf(a),
    s = subjectOf(a.subjectId);
  return `<div class="task-row ${st === "done" ? "done" : ""}">
    <button
      class="check ${st === "done" ? "checked" : ""}"
      data-action="complete"
      data-id="${a.id}"
      aria-label="${st === "done" ? "Reabrir" : "Concluir"} ${esc(a.title)}"
      aria-pressed="${st === "done"}"
    >
      ${st === "done" ? icon("check", 13) : ""}
    </button>
    <div class="grow">
      <button
        class="task-title"
        data-action="activity-detail"
        data-id="${a.id}"
      >
        ${esc(a.title)}
      </button>
      <div class="task-meta">
        ${esc(s?.name || "Sem disciplina")} · ${a.groupId ? "Turma" : "Pessoal"}
      </div>
    </div>
    ${!compact ? `<div class="task-priority">${badge(a.priority, a.priority === "Alta" ? "danger" : "")}</div>` : ""}<span
      class="task-date ${isOverdue(a, st) ? "text-danger" : ""}"
      >${dueLabel(a.due)}${isOverdue(a, st) ? "<br>Atrasada" : ""}</span
    >
  </div>`;
}
export function miniSubject(s) {
  return `<a
    class="subject-mini"
    style="--subject-color:${esc(s.color)}"
    href="#/disciplinas/${s.id}"
    ><span class="subject-mini-dot" aria-hidden="true"></span
    ><span class="subject-mini-copy"
      ><strong>${esc(s.name)}</strong>
      <p>${esc(s.teacher || "Professor não informado")}</p></span
    >${icon("arrow", 16)}</a
  >`;
}
export function missing() {
  return `<div class="card">
    ${empty("Não encontramos esta página", "O item pode ter sido removido ou você não participa desta turma.", "", "", "search")}${link("Voltar ao dashboard", "dashboard", "btn primary")}
  </div>`;
}
