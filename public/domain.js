export function average(disciplina, avaliacoes) {
  const notas = avaliacoes.filter(
    (avaliacao) => avaliacao.subjectId === disciplina.id,
  );
  if (!notas.length) return null;

  if (disciplina.method === "points") {
    return notas.reduce(
      (total, avaliacao) => total + Number(avaliacao.grade),
      0,
    );
  }

  const ponderada = disciplina.method === "weighted";
  const pesoTotal = notas.reduce(
    (total, avaliacao) => total + (ponderada ? Number(avaliacao.weight) : 1),
    0,
  );
  if (!pesoTotal) return null;

  const soma = notas.reduce(
    (total, avaliacao) =>
      total +
      Number(avaliacao.grade) * (ponderada ? Number(avaliacao.weight) : 1),
    0,
  );
  return soma / pesoTotal;
}
export function canEditActivity(atividade, turmas, usuarioId) {
  if (!atividade.groupId) return atividade.authorId === usuarioId;

  const turma = turmas.find((item) => item.id === atividade.groupId);
  const participa = turma?.members.some((membro) => membro.id === usuarioId);
  return Boolean(
    participa &&
    (atividade.authorId === usuarioId || turma.ownerId === usuarioId),
  );
}
export function isOverdue(atividade, status, agora = new Date()) {
  return (
    status !== "done" && new Date(atividade.due).getTime() < agora.getTime()
  );
}
export function setPrimary(semestres, id) {
  return semestres.map((semestre) => ({
    ...semestre,
    primary: semestre.id === id,
  }));
}
export function simulatedAverage(disciplina, avaliacoes, nota, peso = 1) {
  const simulacao = {
    subjectId: disciplina.id,
    grade: Number(nota),
    weight: Number(peso),
  };
  return average(disciplina, [...avaliacoes, simulacao]);
}
export function joinState(turma, usuarioId) {
  if (!turma) return "invalid";
  if (turma.members.some((membro) => membro.id === usuarioId)) return "member";
  if (turma.requests.some((pedido) => pedido.id === usuarioId))
    return "pending";
  return turma.approval ? "request" : "join";
}
