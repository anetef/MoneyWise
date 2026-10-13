import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

// Dados simulados para desenvolvimento
const transactions = [
    {
        id: '1',
        icon: '▣',
        title: 'Mercado Livre',
        description: 'Cartão final 4021 • Hoje, 14:30',
        amount: '- R$ 149,90',
        positive: false,
    },
    {
        id: '2',
        icon: '↓',
        title: 'Pix Recebido',
        description: 'João Silva • Ontem, 09:15',
        amount: '+ R$ 450,00',
        positive: true,
    },
    {
        id: '3',
        icon: '♜',
        title: 'Ifood',
        description: 'Cartão final 4021 • 24 Out, 20:45',
        amount: '- R$ 68,50',
        positive: false,
    },
];

const categories = [
    {
        name: 'Moradia',
        amount: 'R$ 3.100,00',
        color: colors.primary,
    },
    {
        name: 'Alimentação',
        amount: 'R$ 1.850,50',
        color: '#CFBBB0',
    },
    {
        name: 'Transporte',
        amount: 'R$ 850,00',
        color: '#E3E3E8',
    },
];

export function DashboardScreen() {
    function openTransactionList() {
        Alert.alert(
            'Extrato de transações',
            'A navegação para o extrato será conectada na próxima etapa do MOB-04.',
        );
    }

    function openAddTransaction() {
        Alert.alert(
            'Adicionar transação',
            'A navegação para adicionar transações será conectada na próxima etapa do MOB-04.',
        );
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {/* Cabeçalho */}
                <Text style={styles.headerTitle}>
                    Dashboard
                </Text>

                {/* Saldo principal */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>
                        Saldo Atual
                    </Text>

                    <Text style={styles.balanceValue}>
                        R$ 14.529,80
                    </Text>
                </View>

                {/* Entradas e saídas */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>
                            ↓ Entradas
                        </Text>

                        <Text style={styles.incomeValue}>
                            R$ 8.450,00
                        </Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>
                            ↑ Saídas
                        </Text>

                        <Text style={styles.expenseValue}>
                            R$ 6.337,50
                        </Text>
                    </View>
                </View>

                {/* Resumo por categoria */}
                <View style={styles.categoriesCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.cardTitle}>
                            Resumo de Categorias
                        </Text>

                        <Text style={styles.moreIcon}>•••</Text>
                    </View>

                    <View style={styles.categoriesContent}>
                        <View style={styles.chartCircle}>
                            <View style={styles.chartInner}>
                                <Text style={styles.chartLabel}>
                                    Gastos
                                </Text>
                                <Text style={styles.chartPercentage}>
                                    75%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.categoryList}>
                            {categories.map((category) => (
                                <View
                                    key={category.name}
                                    style={styles.categoryRow}
                                >
                                    <View
                                        style={[
                                            styles.categoryDot,
                                            { backgroundColor: category.color },
                                        ]}
                                    />

                                    <Text style={styles.categoryName}>
                                        {category.name}
                                    </Text>

                                    <Text style={styles.categoryAmount}>
                                        {category.amount}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Últimas transações */}
                <Text style={styles.transactionsHeading}>
                    ÚLTIMAS TRANSAÇÕES
                </Text>

                <View style={styles.transactionsCard}>
                    {transactions.map((transaction, index) => (
                        <View
                            key={transaction.id}
                            style={[
                                styles.transactionRow,
                                index < transactions.length - 1 &&
                                styles.transactionDivider,
                            ]}
                        >
                            <View
                                style={[
                                    styles.transactionIcon,
                                    transaction.positive
                                        ? styles.positiveIcon
                                        : styles.neutralIcon,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.transactionIconText,
                                        transaction.positive &&
                                        styles.positiveIconText,
                                    ]}
                                >
                                    {transaction.icon}
                                </Text>
                            </View>

                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>
                                    {transaction.title}
                                </Text>

                                <Text style={styles.transactionDescription}>
                                    {transaction.description}
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.transactionAmount,
                                    transaction.positive &&
                                    styles.positiveAmount,
                                ]}
                            >
                                {transaction.amount}
                            </Text>
                        </View>
                    ))}

                    <Pressable
                        onPress={openTransactionList}
                        accessibilityRole="button"
                        style={styles.statementButton}
                    >
                        <Text style={styles.statementText}>
                            Ver extrato completo
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Botão flutuante */}
            <Pressable
                style={({ pressed }) => [
                    styles.floatingButton,
                    pressed && styles.pressed,
                ]}
                onPress={openAddTransaction}
                accessibilityRole="button"
                accessibilityLabel="Adicionar transação"
            >
                <Text style={styles.floatingButtonText}>
                    +
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },

    container: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: 100,
        gap: spacing.xl,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },

    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.primary,
        marginBottom: spacing.xs,
    },

    balanceCard: {
        backgroundColor: colors.white,
        borderRadius: radius.xxl,
        padding: spacing.xxxl,
        minHeight: 170,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },

    balanceLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    balanceValue: {
        fontFamily: fontFamily.bold,
        fontSize: 36,
        lineHeight: 44,
        color: '#202124',
        letterSpacing: -1,
        textAlign: 'center',
    },

    summaryRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        minHeight: 92,
        justifyContent: 'center',
    },

    summaryLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    incomeValue: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.lg,
        color: colors.primary,
    },

    expenseValue: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    categoriesCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.xxl,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    cardTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    moreIcon: {
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    categoriesContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },

    chartCircle: {
        width: 102,
        height: 102,
        borderRadius: radius.full,
        borderWidth: 11,
        borderColor: colors.primary,
        borderTopColor: '#EBDDD4',
        justifyContent: 'center',
        alignItems: 'center',
    },

    chartInner: {
        alignItems: 'center',
    },

    chartLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    chartPercentage: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    categoryList: {
        flex: 1,
        gap: spacing.md,
    },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    categoryDot: {
        width: 11,
        height: 11,
        borderRadius: radius.full,
    },

    categoryName: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    categoryAmount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.primary,
    },

    transactionsHeading: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        letterSpacing: 1,
        marginTop: spacing.sm,
    },

    transactionsCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginTop: -spacing.md,
    },

    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
        minHeight: 78,
    },

    transactionDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },

    transactionIcon: {
        width: 42,
        height: 42,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },

    neutralIcon: {
        backgroundColor: '#F3EBE8',
    },

    positiveIcon: {
        backgroundColor: '#FFDED1',
    },

    transactionIconText: {
        fontSize: fontSize.xl,
        color: colors.text.primary,
    },

    positiveIconText: {
        color: colors.primary,
    },

    transactionInfo: {
        flex: 1,
        gap: spacing.xs,
    },

    transactionTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    transactionDescription: {
        fontFamily: fontFamily.regular,
        fontSize: 10,
        color: colors.text.secondary,
    },

    transactionAmount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.primary,
    },

    positiveAmount: {
        color: colors.primary,
    },

    statementButton: {
        minHeight: 48,
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
    },

    statementText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    floatingButton: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 58,
        height: 58,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    floatingButtonText: {
        fontFamily: fontFamily.regular,
        fontSize: 34,
        lineHeight: 40,
        color: colors.white,
    },

    pressed: {
        opacity: 0.8,
    },
});