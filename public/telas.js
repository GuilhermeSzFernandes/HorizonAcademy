import {
  app,
  db,
  esc,
  icon,
  avatar,
  button,
  badge,
  go,
  routeParts,
  field,
} from "./estado.js";
import { landingPage, authPage, onboardingPage } from "./paginas-publicas.js";
import { shell, pageHead, missing } from "./componentes.js";
import { activitiesPage } from "./atividades.js";
import {
  subjectsPage,
  subjectDetail,
  gradesPage,
  semestersPage,
} from "./estudos.js";
import { groupsPage, groupDetail } from "./turmas.js";
import { calendarPage } from "./calendario.js";
import { dashboardPage } from "./painel.js";

function profilePage() {
  return (
    pageHead("Meu perfil", "Um espaço com a sua identidade.") +
    `<div class="profile-layout">
      <aside class="card profile-card">
        ${avatar(db.user.name, "lg")}
        <h2>${esc(db.user.name)}</h2>
        <p class="small muted mt16">${esc(db.user.course || "Estudante")}</p>
        ${badge("Meu espaço acadêmico", "primary")}
      </aside>
      <section class="card">
        <div class="card-head">
          <h2>Informações pessoais</h2>
          ${icon("user", 19)}
        </div>
        <form data-form="profile">
          <div class="form-error" role="alert"></div>
          <div class="form-grid">
            ${field("Nome completo", "name", db.user.name, "text", 'required minlength="3" maxlength="80" autocomplete="name"')}${field("E-mail", "email", db.user.email, "email", 'required autocomplete="email"')}${field("Curso (opcional)", "course", db.user.course, "text", 'maxlength="100"')}${field("Instituição (opcional)", "institution", db.user.institution, "text", 'maxlength="100"')}
          </div>
          <div class="modal-footer">
            <button class="btn primary" type="submit">Salvar alterações</button>
          </div>
        </form>
      </section>
    </div>`
  );
}
function settingsPage() {
  return (
    pageHead("Configurações", "Deixe seu espaço do seu jeito.") +
    `<section class="card" style="max-width:900px">
      <div class="settings-row">
        <div>
          <h3>Senha</h3>
          <p>Atualize a senha da sua conta de demonstração local.</p>
        </div>
        ${button("Alterar senha", "password-form", "", "", "lock")}
      </div>
      <div class="settings-row">
        <div>
          <h3>Sessão</h3>
          <p>Seus dados de demonstração continuam salvos neste navegador.</p>
        </div>
        ${button("Encerrar sessão", "logout", "", "", "logout")}
      </div>
      <div class="settings-row">
        <div>
          <h3>Dados do protótipo</h3>
          <p>Restaure os exemplos para apresentar o projeto novamente.</p>
        </div>
        ${button("Restaurar demonstração", "reset-demo", "", "ghost text-danger")}
      </div>
    </section>`
  );
}
export function render() {
  const [pagina = "", id = ""] = routeParts();
  const publica = ["", "login", "cadastro"].includes(pagina);
  if (!publica && !db.session) {
    go("login");
    return;
  }

  const titulos = {
    "": "Seu semestre, em perspectiva",
    login: "Entrar",
    cadastro: "Criar conta",
    dashboard: "Dashboard",
    atividades: "Atividades",
    disciplinas: "Disciplinas",
    turmas: "Turmas",
    calendario: "Calendário",
    notas: "Notas",
    semestres: "Semestres",
    perfil: "Meu perfil",
    configuracoes: "Configurações",
    inicio: "Primeiro acesso",
  };
  document.title = `${titulos[pagina] || "Página não encontrada"} · Horizon Academic`;

  if (pagina === "") app.innerHTML = landingPage();
  else if (pagina === "login" || pagina === "cadastro")
    app.innerHTML = authPage(pagina === "cadastro");
  else if (pagina === "inicio") app.innerHTML = onboardingPage(id);
  else {
    const paginas = {
      dashboard: dashboardPage,
      atividades: activitiesPage,
      disciplinas: () => (id ? subjectDetail(id) : subjectsPage()),
      turmas: () => (id ? groupDetail(id) : groupsPage()),
      calendario: calendarPage,
      notas: () => gradesPage(id),
      semestres: semestersPage,
      perfil: profilePage,
      configuracoes: settingsPage,
    };
    app.innerHTML = shell(
      paginas[pagina] ? paginas[pagina]() : missing(),
      pagina,
    );
    document
      .querySelector('.topbar [data-action="menu"]')
      ?.classList.add("mobile-menu");
    const principal = db.semesters.find((semestre) => semestre.primary);
    if (principal) {
      const opcao = $(`#global-semester option[value="${principal.id}"]`);
      if (opcao) opcao.textContent += " · Principal";
    }
  }
}
