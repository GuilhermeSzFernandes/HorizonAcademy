import { simulatedAverage, canEditActivity, setPrimary } from "./domain.js";
import {
  db,
  estado,
  badge,
  num,
  uid,
  persist,
  toast,
  go,
  ownGroups,
  subjects,
  subjectOf,
} from "./estado.js";
import { render } from "./telas.js";
import {
  passwordHash,
  correctPassword,
  formError,
  formValues,
  finishChange,
  ownerGroup,
  joinResult,
} from "./acoes.js";

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const type = form.dataset.form,
    id = form.dataset.id || "",
    v = formValues(form),
    error = $(".form-error", form);
  if (error) error.textContent = "";
  for (const input of form.querySelectorAll("[required]")) {
    if (input.name && !String(v[input.name] ?? "").trim()) {
      formError(
        form,
        "Preencha os campos obrigatórios sem usar apenas espaços.",
        input.name,
      );
      return;
    }
  }
  const submit = $('[type="submit"]', form);
  const original = submit?.innerHTML;
  try {
    switch (type) {
      case "login":
        db.session = true;
        persist();
        go("dashboard");
        break;
      case "register": {
        if (v.password !== v.confirm) {
          formError(
            form,
            "As senhas não coincidem. Confira a confirmação.",
            "confirm",
          );
          return;
        }
        submit.disabled = true;
        submit.innerHTML = '<span class="spinner"></span>Criando seu espaço…';
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (
          db.credential &&
          v.email.toLowerCase() === db.user.email.toLowerCase()
        ) {
          formError(
            form,
            "Este e-mail já tem uma conta neste navegador. Use a tela de login.",
            "email",
          );
          return;
        }
        const newId = uid("u");
        db.user = {
          id: newId,
          name: v.name,
          email: v.email.toLowerCase(),
          course: "",
          institution: "",
        };
        db.credential = { digest: await passwordHash(v.password) };
        db.session = true;
        db.semesters = [];
        db.subjects = [];
        db.evaluations = [];
        db.selectedSemester = "";
        db.statuses[newId] = {};
        db.activities = db.activities
          .filter((a) => a.groupId)
          .map((a) => ({ ...a, subjectId: "" }));
        persist();
        go("inicio/1");
        break;
      }
      case "onboard-semester": {
        if (v.end < v.start) {
          formError(
            form,
            "A data de término precisa ser igual ou posterior ao início.",
            "end",
          );
          return;
        }
        const sid = uid("s");
        db.semesters.push({
          id: sid,
          name: v.name,
          start: v.start,
          end: v.end,
          primary: true,
        });
        db.semesters = setPrimary(db.semesters, sid);
        db.selectedSemester = sid;
        persist();
        go("inicio/2");
        break;
      }
      case "onboard-subject":
        db.subjects.push({
          id: uid("d"),
          name: v.name,
          teacher: v.teacher,
          color: v.color,
          target: Number(v.target),
          method: "weighted",
          semesterId: db.selectedSemester,
        });
        persist();
        go("dashboard");
        toast("Seu espaço está pronto. Bem-vinda ao Horizon!");
        break;
      case "profile": {
        const oldName = db.user.name;
        Object.assign(db.user, {
          name: v.name,
          email: v.email.toLowerCase(),
          course: v.course,
          institution: v.institution,
        });
        db.groups.forEach((g) =>
          g.members.forEach((m) => {
            if (m.id === db.user.id) m.name = db.user.name;
          }),
        );
        persist();
        render();
        toast(
          oldName !== v.name
            ? "Perfil e identidade atualizados."
            : "Perfil atualizado.",
        );
        break;
      }
      case "password": {
        if (!(await correctPassword(v.current))) {
          formError(form, "A senha atual está incorreta.", "current");
          return;
        }
        if (v.password !== v.confirm) {
          formError(form, "As senhas não coincidem.", "confirm");
          return;
        }
        db.credential = { digest: await passwordHash(v.password) };
        finishChange("Senha do protótipo atualizada.");
        break;
      }
      case "semester": {
        if (v.end < v.start) {
          formError(form, "O término não pode ser anterior ao início.", "end");
          return;
        }
        if (
          db.semesters.some(
            (s) => s.id !== id && s.name.toLowerCase() === v.name.toLowerCase(),
          )
        ) {
          formError(
            form,
            "Você já cadastrou um semestre com esse nome.",
            "name",
          );
          return;
        }
        const existing = db.semesters.find((s) => s.id === id),
          sid = existing?.id || uid("s");
        if (existing)
          Object.assign(existing, { name: v.name, start: v.start, end: v.end });
        else
          db.semesters.push({
            id: sid,
            name: v.name,
            start: v.start,
            end: v.end,
            primary: false,
          });
        if (v.primary || !db.semesters.some((s) => s.primary))
          db.semesters = setPrimary(db.semesters, sid);
        if (!db.selectedSemester) db.selectedSemester = sid;
        finishChange(id ? "Semestre atualizado." : "Semestre criado.");
        break;
      }
      case "subject": {
        const target = Number(v.target);
        if (v.method !== "points" && target > 10) {
          formError(
            form,
            "Em médias, a meta deve estar entre 0 e 10.",
            "target",
          );
          return;
        }
        if (!db.semesters.some((s) => s.id === v.semesterId)) {
          formError(form, "Escolha um semestre válido.", "semesterId");
          return;
        }
        const old = subjectOf(id);
        if (
          old &&
          old.method === "points" &&
          v.method !== "points" &&
          db.evaluations.some((e) => e.subjectId === id && e.grade > 10)
        ) {
          formError(
            form,
            "Há avaliações com mais de 10 pontos. Ajuste essas avaliações antes de usar média simples ou ponderada.",
          );
          return;
        }
        const values = {
          name: v.name,
          teacher: v.teacher,
          semesterId: v.semesterId,
          color: v.color,
          target,
          method: v.method,
        };
        if (old) Object.assign(old, values);
        else db.subjects.push({ id: uid("d"), ...values });
        db.selectedSemester = v.semesterId;
        finishChange(id ? "Disciplina atualizada." : "Disciplina adicionada.");
        break;
      }
      case "activity": {
        const existing = db.activities.find((a) => a.id === id);
        if (existing && !canEditActivity(existing, db.groups, db.user.id)) {
          formError(form, "Você não tem permissão para editar esta atividade.");
          return;
        }
        const groupId = existing ? existing.groupId : v.groupId;
        if (groupId && !ownGroups().some((g) => g.id === groupId)) {
          formError(form, "Você precisa participar da turma.");
          return;
        }
        const values = {
          title: v.title,
          description: v.description,
          type: v.type,
          due: v.due,
          priority: v.priority,
          subjectId: v.subjectId,
          groupId,
        };
        const aid = existing?.id || uid("a");
        if (existing) Object.assign(existing, values);
        else db.activities.push({ id: aid, ...values, authorId: db.user.id });
        db.statuses[db.user.id] ||= {};
        db.statuses[db.user.id][aid] = v.status;
        finishChange(id ? "Atividade atualizada." : "Atividade criada.");
        break;
      }
      case "group": {
        const existing = id ? ownerGroup(id) : null;
        if (id && !existing) {
          formError(form, "Somente o proprietário pode editar a turma.");
          return;
        }
        const values = {
          name: v.name,
          description: v.description,
          subjectId: v.subjectId,
          approval: v.approval === "true",
        };
        const gid = existing?.id || uid("g");
        if (existing) Object.assign(existing, values);
        else {
          let code;
          do {
            code = "HZ" + crypto.randomUUID().slice(0, 6).toUpperCase();
          } while (db.groups.some((g) => g.code === code));
          db.groups.push({
            id: gid,
            ...values,
            code,
            ownerId: db.user.id,
            members: [{ id: db.user.id, name: db.user.name }],
            requests: [],
          });
        }
        estado.abaTurma = "activities";
        finishChange(
          id ? "Turma atualizada." : "Turma criada. Convide seus colegas!",
          "turmas/" + gid,
        );
        break;
      }
      case "join":
        joinResult(
          db.groups.find(
            (g) => g.code === v.code.toUpperCase().replace(/\s/g, ""),
          ),
        );
        break;
      case "evaluation": {
        const s = subjectOf(v.subjectId),
          grade = Number(v.grade),
          weight = Number(v.weight);
        if (!s) {
          formError(form, "Disciplina não encontrada.");
          return;
        }
        if (
          !Number.isFinite(grade) ||
          grade < 0 ||
          (s.method !== "points" && grade > 10) ||
          !Number.isFinite(weight) ||
          weight <= 0
        ) {
          formError(form, "Confira a nota e o peso informados.");
          return;
        }
        const e = db.evaluations.find((e) => e.id === id),
          values = { name: v.name, grade, weight, subjectId: s.id };
        if (e) Object.assign(e, values);
        else db.evaluations.push({ id: uid("e"), ...values });
        finishChange("Avaliação salva. Sua média foi atualizada.");
        break;
      }
      case "simulate": {
        const s = subjectOf(estado.disciplinaNotas);
        if (!s) return;
        const result = simulatedAverage(
          s,
          db.evaluations,
          Number(v.grade),
          Number(v.weight),
        );
        $("#sim-result").innerHTML = `<span class="small muted"
            >${s.method === "points" ? "Pontos projetados" : "Média projetada"}</span
          ><strong>${num(result)}</strong
          >${badge(result >= s.target ? "Meta alcançada nesta simulação" : `Faltam ${num(s.target - result)} para sua meta`, result >= s.target ? "success" : "warning")}
          <p class="small muted mt16">
            Simulação · não altera suas avaliações
          </p>`;
        $("#sim-result").setAttribute("aria-live", "polite");
        break;
      }
    }
  } catch (error) {
    console.error(error);
    formError(
      form,
      "Não foi possível salvar. Verifique os campos e tente novamente.",
    );
  } finally {
    if (submit?.isConnected) {
      submit.disabled = false;
      submit.innerHTML = original;
    }
  }
});
