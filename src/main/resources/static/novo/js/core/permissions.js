/**
 * Perfis e regras de apresentação/acesso.
 * Não substitui a autorização do backend.
 */
export const ROLES = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  FUNCIONARIO: 'FUNCIONARIO'
});

export const ROLE_LABELS = Object.freeze({
  ADMINISTRADOR: 'Administrador',
  FUNCIONARIO: 'Funcionário'
});

export function isAdmin(usuario) {
  return !!usuario && usuario.papel === ROLES.ADMINISTRADOR;
}

export function roleLabel(usuario) {
  return (usuario && ROLE_LABELS[usuario.papel]) || 'Usuário';
}

/**
 * @param {object|null} usuario
 * @param {string[]|undefined} papeis perfis permitidos; ausente = qualquer autenticado
 */
export function hasRole(usuario, papeis) {
  if (!usuario) return false;
  if (!papeis || papeis.length === 0) return true;
  return papeis.includes(usuario.papel);
}
