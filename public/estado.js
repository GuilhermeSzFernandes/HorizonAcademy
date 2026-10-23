import { createSeed } from "./data.js";

const STORAGE = "horizon-academic-v1";
export const $ = (seletor, elemento = document) =>
  elemento.querySelector(seletor);
export const esc = (valor) =>
  String(valor ?? "").replace(
    /[&<>"']/g,
    (caractere) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caractere],
  );

export let db;
try {
  db = JSON.parse(localStorage.getItem(STORAGE));
} catch {
  db = null;
}
if (!db || db.version !== 1 || !Array.isArray(db.activities)) db = createSeed();
delete db.theme;

export const filters = {
  search: "",
  status: "all",
  priority: "all",
  subject: "all",
  origin: "all",
  sort: "asc",
};
export const estado = {
  dataCalendario: new Date(),
  dataSelecionada: localDate(new Date()),
  visaoCalendario: "month",
  disciplinaNotas:
    db.subjects.find((s) => s.semesterId === db.selectedSemester)?.id ||
    db.subjects[0]?.id ||
    "",
  abaTurma: "activities",
  modalAtual: null,
  focoAnterior: null,
  menuAberto: false,
};
let toastTimer;

export const app = $("#app");
export const modalRoot = $("#modal-root");
export const statusNames = {
  pending: "Pendente",
  progress: "Em andamento",
  done: "Concluída",
};
export const methodNames = {
  simple: "Média simples",
  weighted: "Média ponderada",
  points: "Sistema de pontos",
};
export const nav = [
  ["dashboard", "Dashboard", "dashboard"],
  ["calendario", "Calendário", "calendar"],
  ["atividades", "Atividades", "task"],
  ["disciplinas", "Disciplinas", "book"],
  ["turmas", "Turmas", "users"],
  ["notas", "Notas", "chart"],
  ["semestres", "Semestres", "layers"],
];

export function resetDb() {
  db = createSeed();
}
export function resetFilters() {
  Object.assign(filters, {
    search: "",
    status: "all",
    priority: "all",
    subject: "all",
    origin: "all",
    sort: "asc",
  });
}

const paths = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  task: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  book: '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v16h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3zM12 6v16"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m1-16a3 3 0 0 1 0 6m1 4a6 6 0 0 1 4 6"/>',
  chart: '<path d="M4 20V10h4v10m4 0V4h4v16m4 0V7M2 21h20"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M7 17 17 7M7 7h10v10"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  settings:
    '<path d="m9 3-1 3-3 1v4l-2 2 2 3 3-1 3 3h4l1-3 3-1v-4l2-2-2-3-3 1-3-3z"/><circle cx="12" cy="11" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  logout: '<path d="M9 4H4v16h5m6-4 4-4-4-4m-7 4h12"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
export function icon(name, size = 18) {
  return `<svg
    width="${size}"
    height="${size}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${paths[name] || paths.task}
  </svg>`;
}
export function brand(small = false) {
  return `<a
    href="#/"
    class="brand ${small ? "small-brand" : ""}"
    aria-label="Horizon Academic, início"
    ><img class="brand-mark" src="./assets/logo.svg" alt="" /><span
      class="brand-copy"
      ><span class="brand-name">horizon</span
      ><span class="brand-sub" style="display:block">ACADEMIC</span></span
    ></a
  >`;
}
export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function avatar(name = db.user.name, cls = "") {
  return `<span class="avatar ${cls}" aria-label="${esc(name)}"
    >${esc(initials(name))}</span
  >`;
}
export function button(text, action, id = "", cls = "", ico = "") {
  return `<button
    class="btn ${cls}"
    data-action="${action}"
    data-id="${esc(id)}"
  >
    ${ico ? icon(ico, 16) : ""}${text}
  </button>`;
}
export function link(text, route, cls = "link", ico = "") {
  return `<a class="${cls}" href="#/${route}"
    >${text}${ico ? icon(ico, 15) : ""}</a
  >`;
}
export function iconButton(name, action, id = "", label = "") {
  return `<button
    class="icon-btn"
    data-action="${action}"
    data-id="${esc(id)}"
    title="${esc(label)}"
    aria-label="${esc(label || name)}"
  >
    ${icon(name, 17)}
  </button>`;
}
export function badge(text, cls = "") {
  return `<span class="badge ${cls}">${esc(text)}</span>`;
}
export function localDate(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
export function dateLabel(valor, opcoes = { day: "numeric", month: "short" }) {
  const data = valor.length === 10 ? `${valor}T12:00` : valor;
  return new Date(data).toLocaleDateString("pt-BR", opcoes);
}
export function dueLabel(valor) {
  const data = new Date(valor);
  const dia =
    localDate(data) === localDate(new Date()) ? "Hoje" : dateLabel(valor);
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dia}, ${hora}`;
}
export function num(valor, casas = 1) {
  if (valor == null) return "—";
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
export function uid(prefixo) {
  return prefixo + crypto.randomUUID().slice(0, 8);
}
export function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(db));
  } catch {
    toast(
      "O navegador não permitiu salvar. As alterações duram nesta sessão.",
      true,
    );
  }
}
export function toast(mensagem, erro = false) {
  clearTimeout(toastTimer);
  $("#toast-root").innerHTML = `<div
    role="status"
    class="toast ${erro ? "error" : ""}"
  >
    ${icon(erro ? "info" : "check", 18)}${esc(mensagem)}
  </div>`;
  toastTimer = setTimeout(() => $("#toast-root").replaceChildren(), 4500);
}
export function go(rota) {
  location.hash = "#/" + rota;
}
export function routeParts() {
  return (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean);
}
export function ownGroups() {
  return db.groups.filter((turma) =>
    turma.members.some((membro) => membro.id === db.user.id),
  );
}
export function subjects() {
  return db.subjects.filter(
    (disciplina) => disciplina.semesterId === db.selectedSemester,
  );
}
export function subjectOf(id) {
  return db.subjects.find((disciplina) => disciplina.id === id);
}
export function statusOf(atividade) {
  return db.statuses[db.user.id]?.[atividade.id] || "pending";
}
export function myActivities() {
  const turmas = new Set(ownGroups().map((turma) => turma.id));
  return db.activities.filter((atividade) => {
    const visivel = atividade.groupId
      ? turmas.has(atividade.groupId)
      : atividade.authorId === db.user.id;
    const disciplina = subjectOf(atividade.subjectId);
    return (
      visivel && (!disciplina || disciplina.semesterId === db.selectedSemester)
    );
  });
}
export function pending() {
  return myActivities().filter((atividade) => statusOf(atividade) !== "done");
}
export function empty(title, text, action = "", label = "", ico = "book") {
  return `<div class="empty">
    <div class="empty-icon">${icon(ico, 28)}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${action ? button(label, action, "", "primary", "plus") : ""}
  </div>`;
}
export function options(items, selected, value = "id", label = "name") {
  return items
    .map(
      (o) =>
        `<option
          value="${esc(o[value])}"
          ${String(o[value]) === String(selected) ? "selected" : ""}
        >
          ${esc(o[label])}
        </option>`,
    )
    .join("");
}
export function field(
  label,
  name,
  value = "",
  type = "text",
  attrs = "",
  help = "",
) {
  return `<label class="field"
    >${label}<input
      type="${type}"
      name="${name}"
      value="${esc(value)}"
      ${attrs}
    />${help ? `<small>${help}</small>` : ""}</label
  >`;
}
export function selectField(label, name, html, attrs = "") {
  return `<label class="field"
    >${label}<select name="${name}" ${attrs}>
      ${html}
    </select></label
  >`;
}
export function simpleOptions(values, selected) {
  return values
    .map(
      (v) =>
        `<option
          value="${esc(v)}"
          ${v === selected ? "selected" : ""}
        >
          ${esc(v)}
        </option>`,
    )
    .join("");
}
export function passwordField(
  label,
  name = "password",
  autocomplete = "current-password",
  required = true,
) {
  return `<label class="field"
    >${label}<span class="password-field"
      ><input
        name="${name}"
        type="password"
        ${required ? 'required minlength="8"' : ""}
        autocomplete="${autocomplete}"
        placeholder="${required ? "Pelo menos 8 caracteres" : "Sua senha"}"
      /><button
        type="button"
        class="icon-btn"
        data-action="toggle-password"
        aria-label="Mostrar senha"
      >
        ${icon("eye")}
      </button></span
    ></label
  >`;
}
