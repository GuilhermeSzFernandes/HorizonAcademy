import {
  db,
  estado,
  esc,
  icon,
  avatar,
  button,
  link,
  iconButton,
  badge,
  ownGroups,
  myActivities,
  empty,
} from "./estado.js";
import { pageHead, taskRow, missing } from "./componentes.js";

function groupCard(g) {
  const owner = g.members.find((m) => m.id === g.ownerId);
  return `<article class="card group-card">
    <div class="row between">
      <div class="group-icon">${icon("users", 24)}</div>
      ${g.ownerId === db.user.id ? badge("Proprietária", "primary") : badge("Membro")}
    </div>
    <h2>${esc(g.name)}</h2>
    <p>
      ${esc(g.description || "Uma turma para organizar as atividades do semestre.")}
    </p>
    <div class="row between mb16">
      <div class="avatars">
        ${g.members
          .slice(0, 4)
          .map((m) => avatar(m.name))
          .join("")}
      </div>
      <span class="small muted">${g.members.length} membros</span>
    </div>
    <div class="small muted mb16">
      ${esc(owner?.name || "Proprietário")} · Proprietário
    </div>
    <div class="card-footer">
      ${badge(g.approval ? "Ingresso com aprovação" : "Ingresso por código")}${link("Abrir turma", "turmas/" + g.id, "link", "external")}
    </div>
  </article>`;
}
export function groupsPage() {
  const groups = ownGroups(),
    requests = db.groups.filter((g) =>
      g.requests.some((r) => r.id === db.user.id),
    );
  return (
    pageHead(
      "Turmas",
      "Compartilhe os prazos. Preserve seu próprio ritmo.",
      button("Ingressar em turma", "join-group", "", "", "users") +
        button("Criar turma", "group-form", "", "primary", "plus"),
    ) +
    `<div class="cards-grid">${groups.map(groupCard).join("")}</div>
      ${!groups.length ? `<section class="card">${empty("Aprender junto fica mais leve", "Crie uma turma ou use um código para participar.", "join-group", "Ingressar em turma", "users")}</section>` : ""}${
        requests.length
          ? `<section class="card mt24">
              <h2>Solicitações enviadas</h2>
              ${requests
                .map(
                  (g) =>
                    `<div class="member-row">
                      <div class="grow">
                        <strong>${esc(g.name)}</strong
                        ><small>Aguardando aprovação do proprietário</small>
                      </div>
                      ${badge("Pendente", "warning")}
                    </div>`,
                )
                .join("")}
            </section>`
          : ""
      }
      <p class="privacy-note">
        ${icon("info", 15)}Todos os membros ativos podem criar atividades. O
        status de conclusão é individual.
      </p>`
  );
}
export function groupDetail(id) {
  const g = ownGroups().find((g) => g.id === id);
  if (!g) return missing();
  const owner = g.ownerId === db.user.id,
    acts = myActivities().filter((a) => a.groupId === id),
    members = g.members;
  return (
    pageHead(
      g.name,
      g.description || "Atividades e organização da turma.",
      button("Criar atividade", "activity-group", id, "primary", "plus") +
        (owner
          ? button("Configurações", "group-form", id, "", "settings")
          : button("Sair da turma", "leave-group", id, "ghost", "logout")),
    ) +
    `<div class="detail-grid">
      <section class="card">
        <div class="tabs" role="tablist" aria-label="Seções da turma">
          ${[["activities", "Atividades", acts.length], ["members", "Membros", members.length], ...(owner ? [["requests", "Solicitações", g.requests.length]] : [])].map(([key, label, n]) => `<button role="tab" class="tab ${estado.abaTurma === key ? "active" : ""}" aria-selected="${estado.abaTurma === key}" data-action="group-tab" data-id="${key}">${label}${badge(n)}</button>`).join("")}
        </div>
        ${
          estado.abaTurma === "activities"
            ? acts.map((a) => taskRow(a)).join("") ||
              empty(
                "Sem atividades compartilhadas",
                "Qualquer membro pode criar a primeira atividade da turma.",
                "activity-group-current",
                "Criar atividade",
                "task",
              )
            : estado.abaTurma === "members"
              ? members
                  .map(
                    (m) =>
                      `<div class="member-row">
                        ${avatar(m.name)}
                        <div class="grow">
                          <strong
                            >${esc(m.id === db.user.id ? db.user.name : m.name)}
                            ${m.id === db.user.id ? "(você)" : ""}</strong
                          ><small
                            >${m.id === g.ownerId ? "Proprietário" : "Membro"}</small
                          >
                        </div>
                        ${owner && m.id !== db.user.id ? button("Remover", "remove-member", g.id + "|" + m.id, "sm ghost text-danger") : ""}
                      </div>`,
                  )
                  .join("")
              : owner
                ? g.requests
                    .map(
                      (m) =>
                        `<div class="member-row">
                          ${avatar(m.name)}
                          <div class="grow">
                            <strong>${esc(m.name)}</strong
                            ><small>Solicitou ingresso na turma</small>
                          </div>
                          ${iconButton("check", "approve-member", g.id + "|" + m.id, "Aprovar solicitação")}${iconButton("close", "reject-member", g.id + "|" + m.id, "Recusar solicitação")}
                        </div>`,
                    )
                    .join("") ||
                  empty(
                    "Tudo resolvido",
                    "Nenhuma solicitação aguardando aprovação.",
                    "",
                    "",
                    "users",
                  )
                : ""
        }
      </section>
      <aside class="stack">
        <section class="card">
          <h2>Convide sua turma</h2>
          <p class="small muted mt16 mb16">
            Compartilhe este código com seus colegas.
          </p>
          <div class="group-code">
            <strong>${esc(g.code)}</strong
            >${iconButton("copy", "copy-code", g.id, "Copiar código de ingresso")}
          </div>
          <p class="small muted mt16">
            ${g.approval ? "Novos membros precisam da aprovação do proprietário." : "O ingresso acontece automaticamente pelo código."}
          </p>
        </section>
        <div class="permission-box">
          <strong
            >${owner ? "Você é proprietária desta turma." : "Você participa como membro."}</strong
          ><br />${owner ? "Gerencie membros, solicitações e todas as atividades compartilhadas." : "Crie atividades e edite as que você publicou. Seu progresso é individual."}
        </div>
        ${owner ? button("Excluir turma", "delete-group", g.id, "ghost text-danger", "trash") : ""}
      </aside>
    </div>`
  );
}
