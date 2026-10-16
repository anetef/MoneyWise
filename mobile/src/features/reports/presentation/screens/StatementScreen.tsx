import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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

// 📊 Tipos e dados mockados
type Filter = 'all' | 'income' | 'expense';
type StatementIcon = 'cart' | 'income' | 'food' | 'fuel';

type StatementItem = {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    type: 'income' | 'expense';
    icon: StatementIcon;
};

type StatementGroup = {
    id: string;
    dateLabel: string;
    items: StatementItem[];
};

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tudo' },
    { key: 'income', label: 'Entradas' },
    { key: 'expense', label: 'Saídas' },
];

const BALANCE = 'R$ 14.529,80';

const GROUPS: StatementGroup[] = [
    {
        id: 'today',
        dateLabel: 'Hoje, 24 de Outubro',
        items: [
            {
                id: '1',
                title: 'Mercado Extra',
                subtitle: 'Cartão de Crédito • 14:32',
                amount: '- R$ 145,90',
                type: 'expense',
                icon: 'cart',
            },
            {
                id: '2',
                title: 'Pix Recebido',
                subtitle: 'João Silva • 10:15',
                amount: '+ R$ 350,00',
                type: 'income',
                icon: 'income',
            },
        ],
    },
    {
        id: 'yesterday',
        dateLabel: 'Ontem, 23 de Outubro',
        items: [
            {
                id: '3',
                title: 'Restaurante Sabor',
                subtitle: 'Cartão de Débito • 20:45',
                amount: '- R$ 89,50',
                type: 'expense',
                icon: 'food',
            },
            {
                id: '4',
                title: 'Posto Ipiranga',
                subtitle: 'Cartão de Crédito • 08:30',
                amount: '- R$ 200,00',
                type: 'expense',
                icon: 'fuel',
            },
        ],
    },
];

// 🧾 Ícone de cada transação
function ItemIcon({ icon }: { icon: StatementIcon }) {
    if (icon === 'income') {
        return (
            <View style={[styles.itemIcon, { backgroundColor: C.incomeIconBg }]}>
                <Feather name="arrow-down" size={20} color={C.primary} />
            </View>
        );
    }

    return (
        <View style={styles.itemIcon}>
            {icon === 'cart' && (
                <MaterialCommunityIcons name="cart-outline" size={21} color={C.text} />
            )}
            {icon === 'food' && (
                <MaterialCommunityIcons name="silverware-fork-knife" size={19} color={C.text} />
            )}
            {icon === 'fuel' && (
                <MaterialCommunityIcons name="gas-station-outline" size={21} color={C.text} />
            )}
        </View>
    );
}

export function StatementScreen() {
    const [filter, setFilter] = useState<Filter>('all');

    // Filtra os itens de cada dia e esconde os dias que ficarem vazios
    const visibleGroups = GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => filter === 'all' || item.type === filter),
    })).filter((group) => group.items.length > 0);

    function handleDownload() {
        Alert.alert('Em breve', 'O download do extrato será implementado em breve.');
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
                    <Text style={styles.balanceLabel}>Saldo Disponível</Text>
                    <Text style={styles.balanceValue}>{BALANCE}</Text>
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
                    <Pressable
                        onPress={handleDownload}
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.downloadButton,
                            pressed && { opacity: 0.85 },
                        ]}
                    >
                        <Feather name="download" size={16} color={C.surface} />
                        <Text style={styles.downloadText}>Baixar</Text>
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

                {/* Lista agrupada por dia */}
                {visibleGroups.map((group) => (
                    <View key={group.id} style={styles.group}>
                        <Text style={styles.groupTitle}>{group.dateLabel}</Text>

                        <View style={styles.card}>
                            {group.items.map((item, index) => (
                                <View key={item.id}>
                                    {index > 0 && <View style={styles.divider} />}

                                    <View style={styles.itemRow}>
                                        <ItemIcon icon={item.icon} />

                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.itemAmount,
                                                item.type === 'income' && { color: C.primary },
                                            ]}
                                        >
                                            {item.amount}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
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
});