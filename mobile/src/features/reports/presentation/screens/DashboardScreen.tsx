import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../../../../core/navigation/types';

// 🎨 Cores do Figma (depois trocamos pelos tokens do core/theme)
const C = {
    primary: '#823B18',
    primarySoft: '#FBDCCF',
    background: '#F7F6FA',
    surface: '#FFFFFF',
    text: '#1E1E24',
    textSecondary: '#6B6A73',
    iconBg: '#ECEBF1',
    divider: '#EFEEF2',
    track: '#EADCD3',
    taupe: '#CBBDB3',
    lightGray: '#E2E0E4',
};

// 🔤 Nomes das fontes: confira no useFonts do App.tsx
const F = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

// 📊 Dados mockados
type Category = { id: string; label: string; amount: string; color: string };

type TransactionIcon = 'shopping' | 'income' | 'food';

type Transaction = {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    type: 'income' | 'expense';
    icon: TransactionIcon;
};

const MOCK = {
    balance: 'R$ 14.529,80',
    income: 'R$ 8.450,00',
    expenses: 'R$ 6.337,50',
    spentPercent: 75,
};

const CATEGORIES: Category[] = [
    { id: '1', label: 'Moradia', amount: 'R$ 3.100,00', color: C.primary },
    { id: '2', label: 'Alimentação', amount: 'R$ 1.850,50', color: C.taupe },
    { id: '3', label: 'Transporte', amount: 'R$ 850,00', color: C.lightGray },
];

const TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        title: 'Mercado Livre',
        subtitle: 'Cartão final 4021 • Hoje, 14:30',
        amount: '- R$ 149,90',
        type: 'expense',
        icon: 'shopping',
    },
    {
        id: '2',
        title: 'Pix Recebido',
        subtitle: 'João Silva • Ontem, 09:15',
        amount: '+ R$ 450,00',
        type: 'income',
        icon: 'income',
    },
    {
        id: '3',
        title: 'Ifood',
        subtitle: 'Cartão final 4021 • 24 Out, 20:45',
        amount: '- R$ 68,50',
        type: 'expense',
        icon: 'food',
    },
];

// 🍩 Gráfico de rosca
function DonutChart({ percent }: { percent: number }) {
    const size = 96;
    const stroke = 12;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent / 100);

    return (
        <View style={styles.donut}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={C.track}
                    strokeWidth={stroke}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={C.primary}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                />
            </Svg>
            <View style={styles.donutCenter}>
                <Text style={styles.donutLabel}>Gastos</Text>
                <Text style={styles.donutValue}>{percent}%</Text>
            </View>
        </View>
    );
}

// 🧾 Ícone de cada transação
function TransactionIconBadge({ icon }: { icon: TransactionIcon }) {
    if (icon === 'income') {
        return (
            <View style={[styles.txIcon, { backgroundColor: C.primarySoft }]}>
                <Feather name="arrow-down" size={18} color={C.primary} />
            </View>
        );
    }

    return (
        <View style={styles.txIcon}>
            {icon === 'shopping' ? (
                <Feather name="shopping-bag" size={17} color={C.text} />
            ) : (
                <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={C.text} />
            )}
        </View>
    );
}

export function DashboardScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();

    function handleFullStatement() {
        navigation.navigate('Statement');
    }

    function handleAddTransaction() {
        navigation.navigate('AddTransaction');
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Título */}
                <Text style={styles.title}>Dashboard</Text>

                {/* Saldo */}
                <View style={[styles.card, styles.balanceCard]}>
                    <Text style={styles.balanceLabel}>Saldo Atual</Text>
                    <Text style={styles.balanceValue}>{MOCK.balance}</Text>
                </View>

                {/* Entradas e Saídas */}
                <View style={styles.row}>
                    <View style={[styles.card, styles.smallCard]}>
                        <View style={styles.smallCardHeader}>
                            <Feather name="arrow-down" size={16} color={C.text} />
                            <Text style={styles.smallCardLabel}>Entradas</Text>
                        </View>
                        <Text style={[styles.smallCardValue, { color: C.primary }]}>
                            {MOCK.income}
                        </Text>
                    </View>

                    <View style={[styles.card, styles.smallCard]}>
                        <View style={styles.smallCardHeader}>
                            <Feather name="arrow-up" size={16} color={C.text} />
                            <Text style={styles.smallCardLabel}>Saídas</Text>
                        </View>
                        <Text style={styles.smallCardValue}>{MOCK.expenses}</Text>
                    </View>
                </View>

                {/* Resumo de Categorias */}
                <View style={[styles.card, styles.categoriesCard]}>
                    <View style={styles.categoriesHeader}>
                        <Text style={styles.categoriesTitle}>Resumo de Categorias</Text>
                        <Feather name="more-horizontal" size={18} color={C.text} />
                    </View>

                    <View style={styles.categoriesBody}>
                        <DonutChart percent={MOCK.spentPercent} />

                        <View style={styles.legend}>
                            {CATEGORIES.map((category) => (
                                <View key={category.id} style={styles.legendRow}>
                                    <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                                    <Text style={styles.legendLabel}>{category.label}</Text>
                                    <Text style={styles.legendAmount}>{category.amount}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Últimas transações */}
                <Text style={styles.sectionTitle}>ÚLTIMAS TRANSAÇÕES</Text>

                <View style={styles.card}>
                    {TRANSACTIONS.map((tx, index) => (
                        <View
                            key={tx.id}
                            style={[styles.txRow, index > 0 && styles.txRowDivider]}
                        >
                            <TransactionIconBadge icon={tx.icon} />

                            <View style={styles.txInfo}>
                                <Text style={styles.txTitle}>{tx.title}</Text>
                                <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                            </View>

                            <Text
                                style={[
                                    styles.txAmount,
                                    tx.type === 'income' && { color: C.primary },
                                ]}
                            >
                                {tx.amount}
                            </Text>
                        </View>
                    ))}

                    <Pressable onPress={handleFullStatement} style={styles.statementButton}>
                        <Text style={styles.statementText}>Ver extrato completo</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Botão flutuante */}
            <Pressable
                onPress={handleAddTransaction}
                style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
            >
                <Feather name="plus" size={26} color={C.surface} />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: C.background,
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    title: {
        fontFamily: F.bold,
        fontSize: 22,
        color: C.primary,
        marginBottom: 16,
    },
    card: {
        backgroundColor: C.surface,
        borderRadius: 16,
    },

    // Saldo
    balanceCard: {
        alignItems: 'center',
        paddingVertical: 36,
        marginBottom: 16,
    },
    balanceLabel: {
        fontFamily: F.medium,
        fontSize: 14,
        color: C.text,
        marginBottom: 8,
    },
    balanceValue: {
        fontFamily: F.bold,
        fontSize: 34,
        color: C.text,
    },

    // Entradas / Saídas
    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    smallCard: {
        flex: 1,
        padding: 14,
    },
    smallCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    smallCardLabel: {
        fontFamily: F.regular,
        fontSize: 13,
        color: C.text,
    },
    smallCardValue: {
        fontFamily: F.medium,
        fontSize: 16,
        color: C.text,
    },

    // Categorias
    categoriesCard: {
        padding: 16,
    },
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    categoriesTitle: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.text,
    },
    categoriesBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donut: {
        width: 96,
        height: 96,
    },
    donutCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutLabel: {
        fontFamily: F.regular,
        fontSize: 11,
        color: C.textSecondary,
    },
    donutValue: {
        fontFamily: F.semibold,
        fontSize: 15,
        color: C.text,
    },
    legend: {
        flex: 1,
        marginLeft: 16,
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendLabel: {
        flex: 1,
        fontFamily: F.regular,
        fontSize: 13,
        color: C.text,
    },
    legendAmount: {
        fontFamily: F.semibold,
        fontSize: 13,
        color: C.text,
    },

    // Transações
    sectionTitle: {
        fontFamily: F.semibold,
        fontSize: 11,
        letterSpacing: 0.8,
        color: C.text,
        marginTop: 24,
        marginBottom: 10,
        marginLeft: 4,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    txRowDivider: {
        borderTopWidth: 1,
        borderTopColor: C.divider,
    },
    txIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.iconBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontFamily: F.semibold,
        fontSize: 14,
        color: C.text,
        marginBottom: 2,
    },
    txSubtitle: {
        fontFamily: F.regular,
        fontSize: 11,
        color: C.textSecondary,
    },
    txAmount: {
        fontFamily: F.semibold,
        fontSize: 13,
        color: C.text,
    },
    statementButton: {
        borderTopWidth: 1,
        borderTopColor: C.divider,
        paddingVertical: 14,
        alignItems: 'center',
    },
    statementText: {
        fontFamily: F.medium,
        fontSize: 13,
        color: C.primary,
    },

    // Botão flutuante
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
});