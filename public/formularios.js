import { canEditActivity, isOverdue } from "./domain.js";
import {
  app,
  modalRoot,
  db,
  estado,
  esc,
  icon,
  button,
  iconButton,
  badge,
  localDate,
  dueLabel,
  toast,
  ownGroups,
  subjects,
  subjectOf,
  statusOf,
  myActivities,
  options,
  field,
  selectField,
  simpleOptions,
  passwordField,
} from "./estado.js";

export function closeModal() {
  modalRoot.replaceChildren();
  estado.modalAtual = null;
  document.body.style.overflow = "";
  app.inert = false;
  estado.focoAnterior?.focus?.();
}
export function showModal(title, subtitle, content, footer = "", wide = false) {
  if (!estado.modalAtual) estado.focoAnterior = document.activeElement;
  estado.modalAtual = { title };
  modalRoot.innerHTML = `<div class="modal-backdrop">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="modal ${wide ? "wide" : ""}"
      tabindex="-1"
    >
      <header class="modal-head">
        <div>
          <h2 id="modal-title">${esc(title)}</h2>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        </div>
        ${iconButton("close", "close-modal", "", "Fechar janela")}
      </header>
      ${content}${footer}
    </section>
  </div>`;
  document.body.style.overflow = "hidden";
  app.inert = true;
  requestAnimationFrame(() => {
    const first = $("input:not([type=hidden]),select,textarea", modalRoot);
    (first || $(".modal", modalRoot)).focus();
  });
}
export function modalForm(
  type,
  title,
  subtitle,
  fields,
  id = "",
  submit = "Salvar",
  extra = "",
) {
  showModal(
    title,
    subtitle,
    `<form data-form="${type}" data-id="${esc(id)}">
      <div class="form-error" role="alert"></div>
      <div class="form-grid">${fields}</div>
      ${extra}
      <div class="modal-footer">
        ${button("Cancelar", "close-modal")}<button
          class="btn primary"
          type="submit"
        >
          ${esc(submit)}
        </button>
      </div>
    </form>`,
  );
}
export function activityForm(id = "", context = {}) {
  const existing = db.activities.find((a) => a.id === id);
  if (existing && !canEditActivity(existing, db.groups, db.user.id)) {
    toast(
      "Somente o autor e o proprietário podem editar esta atividade.",
      true,
    );
    return;
  }
  const a = existing || {
    title: "",
    description: "",
    type: "Tarefa",
    due: (context.date || localDate(new Date())) + "T18:00",
    priority: "Média",
    subjectId: context.subjectId || "",
    groupId: context.groupId || "",
  };
  const group = ownGroups().find((g) => g.id === a.groupId);
  const fields = `<div class="span2">
      ${field("Título da atividade", "title", a.title, "text", 'required maxlength="120" placeholder="Ex.: Lista de exercícios 03"')}
    </div>
    <label class="field span2"
      >Descrição (opcional)<textarea
        name="description"
        maxlength="2000"
        placeholder="O que você precisa fazer?"
      >
${esc(a.description)}</textarea></label
    >${selectField("Tipo", "type", simpleOptions(["Tarefa", "Prova", "Trabalho"], a.type))}${selectField("Prioridade", "priority", simpleOptions(["Baixa", "Média", "Alta"], a.priority))}${field("Prazo de entrega", "due", a.due, "datetime-local", "required")}${selectField("Disciplina (opcional)", "subjectId", '<option value="">Sem disciplina</option>' + options(subjects(), a.subjectId || group?.subjectId))}${selectField("Origem", "groupId", '<option value="">Pessoal</option>' + options(ownGroups(), a.groupId), existing ? "disabled" : "")}<input
      type="hidden"
      name="lockedGroupId"
      value="${esc(existing?.groupId || "")}"
    />${selectField(
      "Meu status",
      "status",
      options(
        Object.entries(statusNames).map(([id, name]) => ({ id, name })),
        existing ? statusOf(existing) : "pending",
      ),
    )}`;
  modalForm(
    "activity",
    existing ? "Editar atividade" : "Nova atividade",
    "Um próximo passo bem definido.",
    fields,
    id,
    existing ? "Salvar alterações" : "Criar atividade",
    `<p class="privacy-note">
      ${icon("info", 14)}Em turmas, cada membro controla seu próprio status.
    </p>`,
  );
}
export function activityDetail(id) {
  const a = myActivities().find((a) => a.id === id);
  if (!a) return;
  const g = db.groups.find((g) => g.id === a.groupId),
    canEdit = canEditActivity(a, db.groups, db.user.id),
    st = statusOf(a);
  showModal(
    a.title,
    `${a.type} · ${subjectOf(a.subjectId)?.name || "Sem disciplina"}`,
    `<div class="row wrap">
        ${badge(a.priority, a.priority === "Alta" ? "danger" : "warning")}${badge(statusNames[st], st === "done" ? "success" : st === "progress" ? "primary" : "")}${isOverdue(a, st) ? badge("Atrasada", "danger") : ""}
      </div>
      <p class="detail-description mt24">
        ${esc(a.description || "Nenhuma descrição adicionada.")}
      </p>
      <dl class="detail-fields">
        <div>
          <dt>Prazo</dt>
          <dd>${dueLabel(a.due)}</dd>
        </div>
        <div>
          <dt>Origem</dt>
          <dd>${esc(g?.name || "Pessoal")}</dd>
        </div>
        <div>
          <dt>Autor</dt>
          <dd>
            ${esc(a.authorId === db.user.id ? db.user.name : g?.members.find((m) => m.id === a.authorId)?.name || "Colega da turma")}
          </dd>
        </div>
        <div>
          <dt>Meu status</dt>
          <dd>
            <select
              class="status-select ${st}"
              data-detail-status="${a.id}"
              aria-label="Alterar meu status"
            >
              ${options(
                Object.entries(statusNames).map(([id, name]) => ({ id, name })),
                st,
              )}
            </select>
          </dd>
        </div>
      </dl>
      ${g ? `<p class="privacy-note">${icon("lock", 14)}Alterar seu status não muda o progresso dos outros membros.</p>` : ""}${!canEdit ? '<p class="small muted mt16">A edição está disponível somente para o autor e o proprietário da turma.</p>' : ""}`,
    `<div class="modal-footer">
      ${canEdit ? iconButton("trash", "delete-activity", a.id, "Excluir atividade") : ""}<span
        class="grow"
      ></span
      >${canEdit ? button("Editar", "activity-form", a.id, "", "edit") : ""}${button(st === "done" ? "Reabrir atividade" : "Marcar como concluída", "detail-complete", a.id, "primary", "check")}
    </div>`,
  );
}
export function subjectForm(id = "") {
  if (!db.semesters.length) {
    toast("Crie um semestre antes de adicionar uma disciplina.");
    semesterForm();
    return;
  }
  const s = subjectOf(id) || {
    name: "",
    teacher: "",
    semesterId: db.selectedSemester,
    color: "#753de7",
    target: 7,
    method: "weighted",
  };
  modalForm(
    "subject",
    id ? "Editar disciplina" : "Adicionar disciplina",
    "Um lugar para cada área do conhecimento.",
    `<div class="span2">
        ${field("Nome da disciplina", "name", s.name, "text", 'required maxlength="80"')}
      </div>
      ${field("Professor (opcional)", "teacher", s.teacher, "text", 'maxlength="80"')}${selectField("Semestre", "semesterId", options(db.semesters, s.semesterId), "required")}${field("Cor identificadora", "color", s.color, "color")}${field("Meta mínima (nota ou pontos)", "target", s.target, "number", 'required min="0" max="1000" step="0.1"')}${selectField(
        "Sistema de cálculo",
        "method",
        options(
          Object.entries(methodNames).map(([id, name]) => ({ id, name })),
          s.method,
        ),
      )}
      <div class="form-info">
        Médias simples e ponderadas usam notas de 0 a 10. O sistema de pontos
        soma os valores das avaliações.
      </div>`,
    id,
    id ? "Salvar alterações" : "Adicionar disciplina",
  );
}
export function semesterForm(id = "") {
  const year = new Date().getFullYear(),
    s = db.semesters.find((s) => s.id === id) || {
      name: "",
      start: localDate(new Date()),
      end: `${year}-12-31`,
    };
  modalForm(
    "semester",
    id ? "Editar semestre" : "Novo semestre",
    "Organize um novo capítulo da sua vida acadêmica.",
    `<div class="span2">
        ${field("Nome do semestre", "name", s.name, "text", 'required maxlength="40" placeholder="Ex.: 2026.2"')}
      </div>
      ${field("Data de início", "start", s.start, "date", "required")}${field("Data de término", "end", s.end, "date", "required")}<label
        class="row small span2"
        ><input
          type="checkbox"
          name="primary"
          ${s.primary || !db.semesters.length ? "checked" : ""}
        />Definir como semestre principal</label
      >`,
    id,
    id ? "Salvar alterações" : "Criar semestre",
  );
}
export function groupForm(id = "") {
  const g = db.groups.find((g) => g.id === id) || {
    name: "",
    description: "",
    subjectId: "",
    approval: false,
  };
  if (id && g.ownerId !== db.user.id) {
    toast("Apenas o proprietário pode configurar a turma.", true);
    return;
  }
  modalForm(
    "group",
    id ? "Configurações da turma" : "Criar turma",
    "Um ponto de encontro para os prazos do semestre.",
    `<div class="span2">
        ${field("Nome da turma", "name", g.name, "text", 'required maxlength="100" placeholder="Ex.: Cálculo I · Engenharia"')}
      </div>
      <label class="field span2"
        >Descrição (opcional)<textarea
          name="description"
          maxlength="500"
          placeholder="Conte um pouco sobre a turma."
        >
${esc(g.description)}</textarea></label
      >${selectField("Disciplina relacionada (opcional)", "subjectId", '<option value="">Sem disciplina</option>' + options(subjects(), g.subjectId))}${selectField(
        "Tipo de ingresso",
        "approval",
        options(
          [
            { id: "false", name: "Automático por código" },
            { id: "true", name: "Mediante aprovação" },
          ],
          String(g.approval),
        ),
      )}`,
    id,
    id ? "Salvar alterações" : "Criar turma",
    `<p class="privacy-note">
      ${icon("users", 14)}${id ? "Todos os membros podem criar atividades." : "Você será proprietária da turma e poderá gerenciar os membros."}
    </p>`,
  );
}
export function joinModal() {
  modalForm(
    "join",
    "Encontre sua turma",
    "Peça o código de ingresso a um colega.",
    `<div class="span2">
      ${field("Código da turma", "code", "", "text", 'required maxlength="16" placeholder="Ex.: CALC27" autocomplete="off" style="text-transform:uppercase;letter-spacing:2px"')}
    </div>`,
    "",
    "Verificar código",
    `<div class="form-info mt16">
        Códigos da demonstração: <strong>ETICA27</strong> (automático),
        <strong>FISICA27</strong> (aprovação) e <strong>CALC27</strong> (já
        participante).
      </div>
      <div id="join-result" class="mt16" aria-live="polite"></div>`,
  );
}
export function evaluationForm(id = "", subjectId = estado.disciplinaNotas) {
  const e = db.evaluations.find((e) => e.id === id) || {
    name: "",
    grade: "",
    weight: 1,
    subjectId,
  };
  const s = subjectOf(e.subjectId);
  if (!s) {
    toast("Adicione uma disciplina primeiro.");
    subjectForm();
    return;
  }
  modalForm(
    "evaluation",
    id ? "Editar avaliação" : "Cadastrar avaliação",
    s.name,
    `<input type="hidden" name="subjectId" value="${s.id}" />
      <div class="span2">
        ${field("Nome da avaliação", "name", e.name, "text", 'required maxlength="100" placeholder="Ex.: Prova 1"')}
      </div>
      ${field(s.method === "points" ? "Pontos obtidos" : "Nota (0 a 10)", "grade", e.grade, "number", `required min="0" max="${s.method === "points" ? "1000" : "10"}" step="0.1"`)}${s.method === "weighted" ? field("Peso", "weight", e.weight, "number", 'required min="0.1" max="100" step="0.1"') : '<input type="hidden" name="weight" value="1"><div class="form-info">' + methodNames[s.method] + ". " + (s.method === "points" ? "Os pontos são somados." : "Todas as notas têm o mesmo peso.") + "</div>"}`,
    id,
    id ? "Salvar alterações" : "Cadastrar avaliação",
  );
}
export function passwordModal() {
  modalForm(
    "password",
    "Alterar senha",
    "A alteração vale apenas para este protótipo local.",
    `<div class="span2">
      ${passwordField("Senha atual", "current")}${passwordField("Nova senha", "password", "new-password")}${passwordField("Confirmar nova senha", "confirm", "new-password")}
    </div>`,
    "",
    "Atualizar senha",
  );
}
export function confirmModal(
  title,
  description,
  action,
  id = "",
  label = "Excluir",
) {
  showModal(
    title,
    "Esta ação precisa da sua confirmação.",
    `<div
        class="empty-icon"
        style="background:var(--danger-bg);color:var(--danger)"
      >
        ${icon("trash", 26)}
      </div>
      <p class="muted mt24" style="font-size:14px">${esc(description)}</p>`,
    `<div class="modal-footer">
      ${button("Cancelar", "close-modal")}${button(label, action, id, "danger")}
    </div>`,
  );
}
