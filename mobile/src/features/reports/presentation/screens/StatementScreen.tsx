import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { DashboardStackParamList } from '../../../../core/navigation/types';
import type { Transaction } from '../../../transactions/domain/Transaction';
import {
    useStatement,
    type StatementFilter,
} from '../../../transactions/presentation/viewmodels/useStatement';
import { categoryIcon } from '../../../transactions/presentation/utils/categories';
import {
    formatCurrency,
    formatSignedAmount,
} from '../../../transactions/presentation/utils/format';

// 🎨 Cores do Figma (depois trocamos pelos tokens do core/theme)
const C = {
    primary: '#823B18',
    background: '#F7F6FA',
    surface: '#FFFFFF',
    text: '#1E1E24',
    textSecondary: '#6B6A73',
    iconBg: '#ECEBF1',
    incomeIconBg: '#F6E5DD',
    divider: '#E6E5EA',
    segmentBg: '#ECEBF1',
    beige: '#EEDFD3',
    beigeText: '#8C7B70',
};

// 🔤 Mesmos nomes de fonte do Dashboard
const F = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

// 📊 Filtros
const FILTERS: { key: StatementFilter; label: string }[] = [
    { key: 'all', label: 'Tudo' },
    { key: 'income', label: 'Entradas' },
    { key: 'expense', label: 'Saídas' },
];

// Mensagem quando a aba escolhida não tem transações
const EMPTY_MESSAGES: Record<StatementFilter, string> = {
    all: 'Nenhuma transação registrada.',
    income: 'Nenhuma entrada registrada.',
    expense: 'Nenhuma saída registrada.',
};

// 🧾 Ícone de cada transação: seta para entradas, ícone da categoria para gastos
function ItemIcon({ transaction }: { transaction: Transaction }) {
    if (transaction.type === 'INCOME') {
        return (
            <View style={[styles.itemIcon, { backgroundColor: C.incomeIconBg }]}>
                <Feather name="arrow-down" size={20} color={C.primary} />
            </View>
        );
    }

    return (
        <View style={styles.itemIcon}>
            <MaterialCommunityIcons
                name={categoryIcon(transaction.category)}
                size={20}
                color={C.text}
            />
        </View>
    );
}

export function StatementScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();

    const {
        sections,
        balance,
        filter,
        setFilter,
        hasNext,
        isLoading,
        isLoadingMore,
        error,
        loadMore,
        remove,
        reload,
    } = useStatement();

    /** Toque longo: escolher entre editar e excluir. */
    function handleItemOptions(item: Transaction) {
        Alert.alert(item.description || item.category, 'O que você quer fazer?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Editar',
                onPress: () => navigation.navigate('AddTransaction', { transaction: item }),
            },
            { text: 'Excluir', style: 'destructive', onPress: () => confirmDelete(item) },
        ]);
    }

    function confirmDelete(item: Transaction) {
        Alert.alert(
            'Excluir transação?',
            `${formatSignedAmount(item.amount, item.type)} em ${item.category}. Essa ação não pode ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const message = await remove(item.id);

                        if (message) {
                            Alert.alert('Não deu certo', message);
                        }
                    },
                },
            ],
        );
    }

    function handleFilters() {
        Alert.alert('Em breve', 'Os filtros avançados serão implementados em breve.');
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Cabeçalho fixo */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Extrato</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Saldo */}
                <View style={styles.balance}>
                    <Text style={styles.balanceLabel}>Saldo do Mês</Text>
                    <Text style={styles.balanceValue}>{formatCurrency(balance ?? 0)}</Text>
                </View>

                {/* Tudo / Entradas / Saídas */}
                <View style={styles.segment}>
                    {FILTERS.map((option) => {
                        const isActive = option.key === filter;
                        return (
                            <Pressable
                                key={option.key}
                                onPress={() => setFilter(option.key)}
                                style={[styles.segmentItem, isActive && styles.segmentItemActive]}
                            >
                                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Baixar / Filtros */}
                <View style={styles.actions}>
                    {/* Exportação em PDF fica para a Release 2 (REP-03) */}
                    <Pressable
                        disabled
                        accessibilityRole="button"
                        accessibilityLabel="Baixar extrato, em breve"
                        accessibilityState={{ disabled: true }}
                        style={[styles.actionButton, styles.downloadButton, styles.downloadDisabled]}
                    >
                        <Feather name="download" size={16} color={C.surface} />
                        <Text style={styles.downloadText}>Baixar</Text>
                        <View style={styles.soonBadge}>
                            <Text style={styles.soonBadgeText}>Em breve</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={handleFilters}
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.filterButton,
                            pressed && { opacity: 0.85 },
                        ]}
                    >
                        <MaterialCommunityIcons name="filter-variant" size={18} color={C.beigeText} />
                        <Text style={styles.filterText}>Filtros</Text>
                    </Pressable>
                </View>

                {/* Erro ao carregar, com opção de tentar de novo */}
                {error ? (
                    <Pressable
                        onPress={reload}
                        accessibilityRole="button"
                        style={styles.errorBox}
                    >
                        <Feather name="wifi-off" size={16} color={C.primary} />
                        <Text style={styles.errorText}>{error} Toque para tentar de novo.</Text>
                    </Pressable>
                ) : null}

                {isLoading && sections.length === 0 ? (
                    <ActivityIndicator color={C.primary} style={styles.loader} />
                ) : null}

                {sections.length > 0 ? (
                    <Text style={styles.hint}>Toque e segure uma transação para editar ou excluir.</Text>
                ) : null}

                {/* Lista agrupada por dia */}
                {sections.map((section) => (
                    <View key={section.key} style={styles.group}>
                        <Text style={styles.groupTitle}>{section.title}</Text>

                        <View style={styles.card}>
                            {section.items.map((item, index) => (
                                <View key={item.id}>
                                    {index > 0 && <View style={styles.divider} />}

                                    <Pressable
                                        onLongPress={() => handleItemOptions(item)}
                                        accessibilityRole="button"
                                        accessibilityHint="Toque e segure para editar ou excluir"
                                        style={({ pressed }) => [
                                            styles.itemRow,
                                            pressed && { opacity: 0.7 },
                                        ]}
                                    >
                                        <ItemIcon transaction={item} />

                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle} numberOfLines={1}>
                                                {item.description || item.category}
                                            </Text>
                                            <Text style={styles.itemSubtitle}>{item.category}</Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.itemAmount,
                                                item.type === 'INCOME' && { color: C.primary },
                                            ]}
                                        >
                                            {formatSignedAmount(item.amount, item.type)}
                                        </Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Próxima página */}
                {hasNext ? (
                    <Pressable
                        onPress={loadMore}
                        disabled={isLoadingMore}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.loadMoreButton,
                            (pressed || isLoadingMore) && { opacity: 0.7 },
                        ]}
                    >
                        <Text style={styles.loadMoreText}>
                            {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
                        </Text>
                    </Pressable>
                ) : null}

                {sections.length === 0 && !isLoading && !error && (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{EMPTY_MESSAGES[filter]}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: C.background,
    },

    // Cabeçalho
    header: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
        backgroundColor: C.background,
    },
    headerTitle: {
        fontFamily: F.bold,
        fontSize: 22,
        color: C.primary,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },

    // Saldo
    balance: {
        alignItems: 'center',
        marginBottom: 20,
    },
    balanceLabel: {
        fontFamily: F.medium,
        fontSize: 14,
        color: C.text,
        marginBottom: 4,
    },
    balanceValue: {
        fontFamily: F.bold,
        fontSize: 32,
        color: C.text,
    },

    // Segmentado
    segment: {
        flexDirection: 'row',
        backgroundColor: C.segmentBg,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    segmentItem: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 9,
        alignItems: 'center',
    },
    segmentItemActive: {
        backgroundColor: C.surface,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    segmentText: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.textSecondary,
    },
    segmentTextActive: {
        color: C.text,
    },

    // Botões
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    downloadButton: {
        backgroundColor: C.primary,
    },
    downloadText: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.surface,
    },
    downloadDisabled: {
        opacity: 0.6,
    },
    soonBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 999,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    soonBadgeText: {
        fontFamily: F.medium,
        fontSize: 10,
        color: C.surface,
    },
    filterButton: {
        backgroundColor: C.beige,
    },
    filterText: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.beigeText,
    },

    // Grupos
    group: {
        marginBottom: 24,
    },
    groupTitle: {
        fontFamily: F.medium,
        fontSize: 14,
        color: C.text,
        marginBottom: 10,
        marginLeft: 16,
    },
    card: {
        backgroundColor: C.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: C.divider,
        marginLeft: 56,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.iconBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: F.semibold,
        fontSize: 15,
        color: C.text,
        marginBottom: 2,
    },
    itemSubtitle: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.textSecondary,
    },
    itemAmount: {
        fontFamily: F.semibold,
        fontSize: 15,
        color: C.text,
    },

    // Estado vazio
    empty: {
        backgroundColor: C.surface,
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: F.medium,
        fontSize: 14,
        color: C.textSecondary,
        textAlign: 'center',
    },

    // Carregando, erro, dica e paginação
    loader: {
        marginVertical: 24,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: C.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    errorText: {
        flex: 1,
        fontFamily: F.regular,
        fontSize: 13,
        color: C.text,
    },
    hint: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.textSecondary,
        marginBottom: 12,
    },
    loadMoreButton: {
        alignItems: 'center',
        paddingVertical: 14,
        marginBottom: 8,
    },
    loadMoreText: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.primary,
    },
});