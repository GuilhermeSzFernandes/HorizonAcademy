import { canEditActivity, setPrimary, joinState } from "./domain.js";
import {
  db,
  filters,
  estado,
  statusNames,
  esc,
  icon,
  button,
  localDate,
  persist,
  toast,
  go,
  routeParts,
  ownGroups,
  subjects,
  subjectOf,
  statusOf,
  myActivities,
  resetDb,
  resetFilters,
} from "./estado.js";
import { render } from "./telas.js";
import {
  closeModal,
  activityForm,
  activityDetail,
  subjectForm,
  semesterForm,
  groupForm,
  joinModal,
  evaluationForm,
  passwordModal,
  confirmModal,
} from "./formularios.js";

export function setStatus(id, status) {
  const atividade = myActivities().find((item) => item.id === id);
  if (!atividade || !Object.hasOwn(statusNames, status)) return;

  db.statuses[db.user.id] ||= {};
  db.statuses[db.user.id][id] = status;
  persist();
  render();
  toast(
    status === "done"
      ? "Atividade concluída! Seu status foi atualizado."
      : "Seu status foi atualizado.",
  );
}
export async function passwordHash(value) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function correctPassword(value) {
  return db.credential
    ? db.credential.digest === (await passwordHash(value))
    : value === "horizonte123";
}
export function formError(form, message, name) {
  const el = $(".form-error", form);
  if (el) {
    el.textContent = message;
    el.setAttribute("tabindex", "-1");
    el.focus();
  }
  if (name) form.elements[name]?.setAttribute("aria-invalid", "true");
}
export function formValues(form) {
  return Object.fromEntries(
    [...new FormData(form)].map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v,
    ]),
  );
}
function removeSubject(id) {
  db.subjects = db.subjects.filter((s) => s.id !== id);
  db.evaluations = db.evaluations.filter((e) => e.subjectId !== id);
  db.activities.forEach((a) => {
    if (a.subjectId === id) a.subjectId = "";
  });
  db.groups.forEach((g) => {
    if (g.subjectId === id) g.subjectId = "";
  });
}
export function finishChange(message, route) {
  persist();
  closeModal();
  if (route) go(route);
  render();
  toast(message);
}
export function ownerGroup(id) {
  return db.groups.find((g) => g.id === id && g.ownerId === db.user.id);
}
function groupForCurrent() {
  return ownGroups().find((g) => g.id === routeParts()[1]);
}
export function joinResult(group) {
  const state = joinState(group, db.user.id),
    result = $("#join-result");
  if (!result) return;
  if (state === "invalid") {
    result.innerHTML = `<div class="form-error">
      Código não encontrado. Confira e tente novamente.
    </div>`;
    return;
  }
  if (state === "member") {
    result.innerHTML = `<div class="form-info">
        Você já participa de <strong>${esc(group.name)}</strong>.
      </div>
      <div class="mt16">
        ${button("Abrir turma", "open-group", group.id, "primary full", "arrow")}
      </div>`;
    return;
  }
  if (state === "pending") {
    result.innerHTML = `<div class="form-info">
      Sua solicitação para <strong>${esc(group.name)}</strong> aguarda
      aprovação.
    </div>`;
    return;
  }
  result.innerHTML = `<div class="form-info">
      <strong class="text-primary">${icon("check", 14)} Código válido</strong>
      <h3 class="mt16">${esc(group.name)}</h3>
      <p class="small muted mt16">${esc(group.description)}</p>
      <p class="small muted mt16">
        ${group.members.length} membros ·
        ${state === "request" ? "Ingresso mediante aprovação" : "Ingresso automático"}
      </p>
    </div>
    <div class="mt16">
      ${button(state === "request" ? "Solicitar ingresso" : "Ingressar na turma", "confirm-join", group.id, "primary full", "users")}
    </div>`;
}

document.addEventListener("click", async (event) => {
  const scrollLink = event.target.closest("[data-scroll]");
  if (scrollLink) {
    event.preventDefault();
    const target = document.getElementById(scrollLink.dataset.scroll);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      target.focus({ preventScroll: true });
    }
    return;
  }
  if (event.target.classList.contains("modal-backdrop")) {
    closeModal();
    return;
  }
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action,
    id = el.dataset.id || "";
  if (el.tagName === "BUTTON") event.preventDefault();
  try {
    switch (action) {
      case "demo":
        db.session = true;
        persist();
        go("dashboard");
        break;
      case "menu":
        estado.menuAberto = !estado.menuAberto;
        $(".sidebar")?.classList.toggle("open", estado.menuAberto);
        break;
      case "toggle-password": {
        const input = el.parentElement.querySelector("input");
        input.type = input.type === "password" ? "text" : "password";
        el.setAttribute(
          "aria-label",
          input.type === "password" ? "Mostrar senha" : "Ocultar senha",
        );
        el.setAttribute("aria-pressed", String(input.type === "text"));
        break;
      }
      case "close-modal":
        closeModal();
        break;
      case "activity-form":
        activityForm(id);
        break;
      case "activity-subject":
        activityForm("", { subjectId: id });
        break;
      case "activity-group": {
        const g = ownGroups().find((g) => g.id === id);
        if (g) activityForm("", { groupId: g.id, subjectId: g.subjectId });
        break;
      }
      case "activity-group-current": {
        const g = groupForCurrent();
        if (g) activityForm("", { groupId: g.id, subjectId: g.subjectId });
        break;
      }
      case "date-activity":
        activityForm("", { date: id });
        break;
      case "activity-detail":
        activityDetail(id);
        break;
      case "complete": {
        const a = myActivities().find((a) => a.id === id);
        if (a) setStatus(id, statusOf(a) === "done" ? "pending" : "done");
        break;
      }
      case "detail-complete": {
        const a = myActivities().find((a) => a.id === id);
        if (a) {
          setStatus(id, statusOf(a) === "done" ? "pending" : "done");
          activityDetail(id);
        }
        break;
      }
      case "status-tab":
        filters.status = id;
        render();
        break;
      case "sort":
        filters.sort = filters.sort === "asc" ? "desc" : "asc";
        render();
        break;
      case "clear-filters":
        resetFilters();
        render();
        break;
      case "subject-form":
        subjectForm(id);
        break;
      case "semester-form":
        semesterForm(id);
        break;
      case "semester-primary":
        if (db.semesters.some((s) => s.id === id)) {
          db.semesters = setPrimary(db.semesters, id);
          db.selectedSemester = id;
          finishChange("Semestre principal atualizado.");
        }
        break;
      case "semester-subjects":
        db.selectedSemester = id;
        persist();
        go("disciplinas");
        break;
      case "group-form":
        groupForm(id);
        break;
      case "join-group":
        joinModal();
        break;
      case "open-group":
        closeModal();
        estado.abaTurma = "activities";
        go("turmas/" + id);
        break;
      case "confirm-join": {
        const g = db.groups.find((g) => g.id === id),
          st = joinState(g, db.user.id);
        if (!["join", "request"].includes(st)) return;
        const member = { id: db.user.id, name: db.user.name };
        if (st === "request") {
          g.requests.push(member);
          persist();
          joinResult(g);
          toast("Solicitação enviada. Aguarde a aprovação do proprietário.");
        } else {
          g.members.push(member);
          estado.abaTurma = "activities";
          finishChange("Você entrou na turma!", "turmas/" + id);
        }
        break;
      }
      case "group-tab": {
        const g = groupForCurrent();
        if (g && (id !== "requests" || g.ownerId === db.user.id)) {
          estado.abaTurma = id;
          render();
        }
        break;
      }
      case "copy-code": {
        const g = ownGroups().find((g) => g.id === id);
        if (g) {
          try {
            await navigator.clipboard.writeText(g.code);
            toast("Código copiado. Compartilhe com sua turma.");
          } catch {
            toast("Não foi possível copiar. Selecione o código exibido.", true);
          }
        }
        break;
      }
      case "approve-member":
      case "reject-member": {
        const [gid, mid] = id.split("|"),
          g = ownerGroup(gid),
          member = g?.requests.find((m) => m.id === mid);
        if (member) {
          if (action === "approve-member") g.members.push(member);
          g.requests = g.requests.filter((m) => m.id !== mid);
          finishChange(
            action === "approve-member"
              ? "Solicitação aprovada. Novo membro adicionado."
              : "Solicitação recusada.",
          );
        }
        break;
      }
      case "remove-member": {
        const [gid, mid] = id.split("|"),
          g = ownerGroup(gid),
          m = g?.members.find((m) => m.id === mid);
        if (m && mid !== db.user.id)
          confirmModal(
            "Remover membro?",
            `${m.name} deixará de participar da turma. As atividades já criadas continuam disponíveis.`,
            "confirm-remove-member",
            id,
            "Remover",
          );
        break;
      }
      case "confirm-remove-member": {
        const [gid, mid] = id.split("|"),
          g = ownerGroup(gid);
        if (g && mid !== g.ownerId) {
          g.members = g.members.filter((m) => m.id !== mid);
          finishChange("Membro removido da turma.");
        }
        break;
      }
      case "leave-group": {
        const g = ownGroups().find((g) => g.id === id);
        if (g && g.ownerId !== db.user.id)
          confirmModal(
            "Sair da turma?",
            `Você deixará de acessar as atividades de ${g.name}. Poderá entrar novamente usando o código.`,
            "confirm-leave",
            id,
            "Sair da turma",
          );
        break;
      }
      case "confirm-leave": {
        const g = ownGroups().find((g) => g.id === id);
        if (g && g.ownerId !== db.user.id) {
          g.members = g.members.filter((m) => m.id !== db.user.id);
          finishChange("Você saiu da turma.", "turmas");
        }
        break;
      }
      case "delete-group": {
        const g = ownerGroup(id);
        if (g)
          confirmModal(
            "Excluir turma?",
            `A turma ${g.name}, suas atividades compartilhadas e solicitações serão excluídas para todos os participantes deste protótipo.`,
            "confirm-delete-group",
            id,
          );
        break;
      }
      case "confirm-delete-group":
        if (ownerGroup(id)) {
          db.activities = db.activities.filter((a) => a.groupId !== id);
          db.groups = db.groups.filter((g) => g.id !== id);
          finishChange("Turma excluída.", "turmas");
        }
        break;
      case "delete-activity": {
        const a = db.activities.find((a) => a.id === id);
        if (a && canEditActivity(a, db.groups, db.user.id))
          confirmModal(
            "Excluir atividade?",
            `A atividade “${a.title}” será excluída${a.groupId ? " para todos os membros da turma" : ""}.`,
            "confirm-delete-activity",
            id,
          );
        break;
      }
      case "confirm-delete-activity": {
        const a = db.activities.find((a) => a.id === id);
        if (a && canEditActivity(a, db.groups, db.user.id)) {
          db.activities = db.activities.filter((a) => a.id !== id);
          for (const statuses of Object.values(db.statuses))
            delete statuses[id];
          finishChange("Atividade excluída.");
        }
        break;
      }
      case "delete-subject": {
        const s = subjectOf(id);
        if (s)
          confirmModal(
            "Excluir disciplina?",
            `“${s.name}” e suas avaliações serão excluídas. As atividades serão mantidas, sem disciplina vinculada.`,
            "confirm-delete-subject",
            id,
          );
        break;
      }
      case "confirm-delete-subject":
        if (subjectOf(id)) {
          removeSubject(id);
          finishChange(
            "Disciplina excluída. As atividades foram preservadas.",
            "disciplinas",
          );
        }
        break;
      case "delete-semester": {
        const s = db.semesters.find((s) => s.id === id);
        if (s)
          confirmModal(
            "Excluir semestre?",
            `O semestre ${s.name}, suas disciplinas e avaliações serão excluídos. Atividades serão preservadas sem vínculo com as disciplinas.`,
            "confirm-delete-semester",
            id,
          );
        break;
      }
      case "confirm-delete-semester": {
        const s = db.semesters.find((s) => s.id === id);
        if (!s) break;
        db.subjects
          .filter((s) => s.semesterId === id)
          .forEach((s) => removeSubject(s.id));
        db.semesters = db.semesters.filter((s) => s.id !== id);
        if (s.primary && db.semesters.length)
          db.semesters = setPrimary(db.semesters, db.semesters[0].id);
        if (db.selectedSemester === id)
          db.selectedSemester = db.semesters.find((s) => s.primary)?.id || "";
        finishChange("Semestre excluído.");
        break;
      }
      case "evaluation-form":
        evaluationForm(id);
        break;
      case "evaluation-new":
        evaluationForm(
          "",
          routeParts()[0] === "disciplinas"
            ? routeParts()[1]
            : estado.disciplinaNotas,
        );
        break;
      case "evaluation-subject":
        evaluationForm("", id);
        break;
      case "delete-evaluation": {
        const e = db.evaluations.find((e) => e.id === id);
        if (e)
          confirmModal(
            "Excluir avaliação?",
            `“${e.name}” será removida e sua média será recalculada.`,
            "confirm-delete-evaluation",
            id,
          );
        break;
      }
      case "confirm-delete-evaluation":
        db.evaluations = db.evaluations.filter((e) => e.id !== id);
        finishChange("Avaliação excluída. Média atualizada.");
        break;
      case "calendar-day":
        estado.dataSelecionada = id;
        estado.dataCalendario = new Date(id + "T12:00");
        go("calendario");
        break;
      case "select-date":
        estado.dataSelecionada = id;
        render();
        break;
      case "calendar-view":
        estado.visaoCalendario = id;
        render();
        break;
      case "calendar-prev":
      case "calendar-next": {
        const step = action === "calendar-next" ? 1 : -1;
        if (estado.visaoCalendario === "week")
          estado.dataCalendario.setDate(
            estado.dataCalendario.getDate() + 7 * step,
          );
        else
          estado.dataCalendario = new Date(
            estado.dataCalendario.getFullYear(),
            estado.dataCalendario.getMonth() + step,
            1,
          );
        render();
        break;
      }
      case "calendar-today":
        estado.dataCalendario = new Date();
        estado.dataSelecionada = localDate(estado.dataCalendario);
        render();
        break;
      case "password-form":
        passwordModal();
        break;
      case "logout":
        db.session = false;
        persist();
        closeModal();
        go("login");
        break;
      case "reset-demo":
        confirmModal(
          "Restaurar demonstração?",
          "Todas as alterações e o cadastro local serão substituídos pelos dados fictícios originais.",
          "confirm-reset",
          "",
          "Restaurar",
        );
        break;
      case "confirm-reset": {
        resetDb();
        db.session = true;
        resetFilters();
        estado.disciplinaNotas = "d1";
        finishChange("Demonstração restaurada.", "dashboard");
        break;
      }
    }
  } catch (error) {
    console.error(error);
    toast("Não foi possível concluir a ação. Tente novamente.", true);
  }
});
