import {
  db,
  filters,
  estado,
  persist,
  go,
  routeParts,
  ownGroups,
  subjects,
} from "./estado.js";
import { render } from "./telas.js";
import { closeModal, activityDetail } from "./formularios.js";
import { setStatus } from "./acoes.js";

document.addEventListener("change", (event) => {
  const el = event.target;
  if (el.dataset.control === "semester") {
    db.selectedSemester = el.value;
    filters.subject = "all";
    estado.disciplinaNotas = subjects()[0]?.id || "";
    persist();
    const [page] = routeParts();
    if (["disciplinas", "notas"].includes(page) && routeParts()[1]) go(page);
    else render();
  } else if (el.dataset.control === "grade-subject") {
    estado.disciplinaNotas = el.value;
    go("notas/" + el.value);
  } else if (el.dataset.status) setStatus(el.dataset.status, el.value);
  else if (el.dataset.detailStatus) {
    setStatus(el.dataset.detailStatus, el.value);
    activityDetail(el.dataset.detailStatus);
  } else if (el.dataset.filter) {
    filters[el.dataset.filter] = el.value;
    render();
  } else if (el.name === "groupId" && el.closest('[data-form="activity"]')) {
    const g = ownGroups().find((g) => g.id === el.value),
      s = el.form.elements.subjectId;
    if (g?.subjectId && [...s.options].some((o) => o.value === g.subjectId))
      s.value = g.subjectId;
  }
});
document.addEventListener("input", (event) => {
  const el = event.target;
  el.removeAttribute("aria-invalid");
  if (el.dataset.filter === "search") {
    const caret = el.selectionStart;
    filters.search = el.value;
    render();
    const input = $('[data-filter="search"]');
    input.focus();
    input.setSelectionRange(caret, caret);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (estado.modalAtual) closeModal();
    else if (estado.menuAberto) {
      estado.menuAberto = false;
      $(".sidebar")?.classList.remove("open");
    }
    return;
  }
  if (event.key === "Tab" && estado.modalAtual) {
    const focusable = [
      ...modalRoot.querySelectorAll(
        'button:not([disabled]),a[href],input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
      ),
    ];
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const tab = event.target.closest?.('[role="tab"]');
  if (tab && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab),
      next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
    const action = tabs[next].dataset.action,
      id = tabs[next].dataset.id;
    tabs[next].click();
    document
      .querySelector(`[data-action="${action}"][data-id="${id}"]`)
      ?.focus();
  }
});
document.addEventListener("click", (event) => {
  if (
    estado.menuAberto &&
    !event.target.closest(".sidebar") &&
    !event.target.closest('[data-action="menu"]')
  ) {
    estado.menuAberto = false;
    $(".sidebar")?.classList.remove("open");
  }
});
window.addEventListener("hashchange", () => {
  estado.menuAberto = false;
  closeModal();
  const [page, id] = routeParts();
  if (page === "turmas" && id) estado.abaTurma = "activities";
  render();
  window.scrollTo(0, 0);
});
