import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type CategoryOption = {
    id: string;
    /** Nome enviado e recebido da API (ex.: "Comida"). */
    label: string;
    icon: IconName;
};

/** Categorias mostradas no formulário, na ordem do Figma. */
export const CATEGORIES: CategoryOption[] = [
    { id: 'food', label: 'Comida', icon: 'silverware-fork-knife' },
    { id: 'transport', label: 'Transporte', icon: 'car-outline' },
    { id: 'shopping', label: 'Compras', icon: 'shopping-outline' },
    { id: 'home', label: 'Casa', icon: 'home-outline' },
    { id: 'health', label: 'Saúde', icon: 'heart-pulse' },
    { id: 'other', label: 'Outros', icon: 'dots-horizontal-circle-outline' },
];

/** Ícone da categoria pelo nome; categorias desconhecidas usam uma etiqueta. */
export function categoryIcon(name: string): IconName {
    const found = CATEGORIES.find(
        (category) => category.label.toLowerCase() === name.trim().toLowerCase(),
    );

    return found?.icon ?? 'tag-outline';
}

/** Encontra a opção do formulário pelo nome vindo da API. */
export function findCategoryByLabel(name: string): CategoryOption | undefined {
    return CATEGORIES.find(
        (category) => category.label.toLowerCase() === name.trim().toLowerCase(),
    );
}
