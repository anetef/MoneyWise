/**
 * Iniciais de um nome (até duas letras), usadas no
 * lugar da foto do membro.
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}
