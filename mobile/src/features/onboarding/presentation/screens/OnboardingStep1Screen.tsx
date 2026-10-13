
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import type { AuthStackParamList } from '../../../../core/navigation/types';
import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'OnboardingStep1'
>;

export function OnboardingStep1Screen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.brand}>MoneyWise</Text>

                    <Pressable
                        onPress={() => navigation.replace('Welcome')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.skip}>Pular</Text>
                    </Pressable>
                </View>

                {/* Ilustração financeira */}
                <View style={styles.financialPreview}>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balance}>
                            R$ 12.834
                            <Text style={styles.cents}>,50</Text>
                        </Text>

                        <Text style={styles.sharedText}>
                            ⇄ 3 cofrinhos compartilhados ativos
                        </Text>
                    </View>

                    <View style={styles.monthCard}>
                        <View style={styles.monthHeader}>
                            <Text style={styles.monthTitle}>
                                Divisão do mês
                            </Text>
                            <Text style={styles.monthTotal}>
                                R$ 4.250 total
                            </Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={styles.housingProgress} />
                            <View style={styles.foodProgress} />
                            <View style={styles.transportProgress} />
                        </View>

                        <View style={styles.categories}>
                            <Category
                                label="Moradia"
                                percentage="46%"
                                color="#087A58"
                            />
                            <Category
                                label="Alimentação"
                                percentage="32%"
                                color="#149B76"
                            />
                            <Category
                                label="Transporte"
                                percentage="22%"
                                color="#B4BEDD"
                            />
                        </View>
                    </View>

                    <View style={styles.transactionCard}>
                        <Transaction
                            icon="🛒"
                            title="Mercado Semanal"
                            subtitle="Dividido igualmente"
                            amount="- R$ 342,80"
                        />

                        <Transaction
                            icon="✓"
                            title="Aporte Caixinha Viagem"
                            subtitle="Mari & Você"
                            amount="+ R$ 500,00"
                            positive
                        />
                    </View>
                </View>

                {/* Apresentação */}
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Suas finanças pessoais e coletivas em sintonia
                    </Text>

                    <Text style={styles.description}>
                        Centralize seus gastos diários, compartilhe
                        metas com quem você ama e acompanhe cada
                        centavo com total clareza e autonomia.
                    </Text>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <View style={styles.indicators}>
                        <View style={styles.activeIndicator} />
                        <View style={styles.inactiveIndicator} />
                        <View style={styles.inactiveIndicator} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('OnboardingStep2')}
                    >
                        <Text style={styles.buttonText}>
                            Continuar →
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Category({
                      label,
                      percentage,
                      color,
                  }: {
    label: string;
    percentage: string;
    color: string;
}) {
    return (
        <View style={styles.category}>
            <View style={styles.categoryHeading}>
                <View
                    style={[
                        styles.categoryDot,
                        { backgroundColor: color },
                    ]}
                />
                <Text style={styles.categoryName}>{label}</Text>
            </View>

            <Text style={styles.categoryPercentage}>
                {percentage}
            </Text>
        </View>
    );
}

function Transaction({
                         icon,
                         title,
                         subtitle,
                         amount,
                         positive = false,
                     }: {
    icon: string;
    title: string;
    subtitle: string;
    amount: string;
    positive?: boolean;
}) {
    return (
        <View style={styles.transaction}>
            <View style={styles.transactionIcon}>
                <Text style={styles.transactionIconText}>
                    {icon}
                </Text>
            </View>

            <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                    {title}
                </Text>
                <Text style={styles.transactionSubtitle}>
                    {subtitle}
                </Text>
            </View>

            <Text
                style={[
                    styles.transactionAmount,
                    positive && styles.positiveAmount,
                ]}
            >
                {amount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    container: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },

    brand: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    skip: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    financialPreview: {
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        marginBottom: spacing.xxxl,
    },

    balanceCard: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        minHeight: 88,
        justifyContent: 'center',
    },

    balance: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.text.primary,
    },

    cents: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xl,
        color: colors.text.secondary,
    },

    sharedText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.primary,
        marginTop: spacing.xs,
    },

    monthCard: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.lg,
        gap: spacing.md,
    },

    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    monthTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    monthTotal: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    progressTrack: {
        height: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: radius.full,
    },

    housingProgress: {
        width: '46%',
        backgroundColor: '#087A58',
    },

    foodProgress: {
        width: '32%',
        backgroundColor: '#149B76',
    },

    transportProgress: {
        width: '22%',
        backgroundColor: '#B4BEDD',
    },

    categories: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.xs,
    },

    category: {
        flex: 1,
        gap: spacing.xs,
    },

    categoryHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
    },

    categoryName: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.text.secondary,
    },

    categoryPercentage: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    transactionCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: radius.md,
        gap: spacing.md,
    },

    transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    transactionIcon: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    transactionIconText: {
        color: colors.white,
        fontSize: fontSize.md,
    },

    transactionInfo: {
        flex: 1,
    },

    transactionTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.primary,
    },

    transactionSubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: 10,
        color: colors.text.secondary,
    },

    transactionAmount: {
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
        color: colors.text.primary,
    },

    positiveAmount: {
        color: colors.primary,
    },

    content: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: spacing.md,
        gap: spacing.sm,
    },

    title: {
        ...typography.heading,
        fontSize: 29,
        lineHeight: 36,
        letterSpacing: -0.8,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 23,
    },

    footer: {
        marginTop: spacing.xxl,
        gap: spacing.xxxl,
    },

    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },

    activeIndicator: {
        width: 24,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
    },

    inactiveIndicator: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: '#B8C5E6',
    },

    button: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        ...typography.button,
        color: colors.white,
    },

    pressed: {
        opacity: 0.8,
    },
});
