import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { DashboardStackParamList } from '../../../core/navigation/types';
import { colors } from '../../../core/theme';

// 🎨 Cores do Figma (depois trocamos pelos tokens do core/theme)
const C = {
    primary: '#823B18',
    hero: '#A0573A',
    background: '#FDF6F3',
    surface: '#FFFFFF',
    text: '#1E1E24',
    textSecondary: '#6B6A73',
    categoryBg: '#F1E4DE',
    categoryActiveBg: '#FCD3C4',
    detailIconBg: '#FBE7DF',
    divider: '#ECE6E3',
    attachmentBg: '#F3E4DF',
    attachmentBorder: '#D9C4BB',
    whiteSoft: 'rgba(255, 255, 255, 0.8)',
    whiteGlass: 'rgba(255, 255, 255, 0.2)',
};

// 🔤 Mesmos nomes de fonte das outras telas
const F = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

// 📊 Tipos e dados mockados
type TransactionType = 'expense' | 'income';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Category = {
    id: string;
    label: string;
    icon: IconName;
};

const CATEGORIES: Category[] = [
    { id: 'food', label: 'Comida', icon: 'silverware-fork-knife' },
    { id: 'transport', label: 'Transporte', icon: 'car-outline' },
    { id: 'shopping', label: 'Compras', icon: 'shopping-outline' },
    { id: 'home', label: 'Casa', icon: 'home-outline' },
    { id: 'health', label: 'Saúde', icon: 'heart-pulse' },
    { id: 'leisure', label: 'Lazer', icon: 'gamepad-variant-outline' },
];

type Navigation = NativeStackNavigationProp<DashboardStackParamList>;

type FormErrors = {
    amount?: string;
    category?: string;
};

// Mesmo limite de dígitos do valor usado nos formulários de Caixinhas.
const MAX_AMOUNT_DIGITS = 11;

// Tempo em que a confirmação da simulação fica visível antes de voltar.
const SIMULATION_FEEDBACK_MS = 1500;

/** Mantém só os dígitos do valor digitado, em centavos. */
function toAmountDigits(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .slice(0, MAX_AMOUNT_DIGITS);
}

/** Ex.: "4590" → "45,90"; "123456" → "1.234,56". */
function formatAmount(digits: string): string {
    if (!digits) {
        return '';
    }

    const padded = digits.padStart(3, '0');
    const integerPart = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${integerPart},${padded.slice(-2)}`;
}

/** Largura aproximada do valor, para "R$ + valor" ficar centralizado. */
function amountInputWidth(text: string): number {
    const shown = text || '0,00';
    const digits = shown.replace(/\D/g, '').length;
    const separators = shown.length - digits;

    return Math.min(digits * 27 + separators * 12 + 8, 270);
}

export function AddTransactionScreen() {
    const navigation = useNavigation<Navigation>();

    const [type, setType] = useState<TransactionType>('expense');
    const [amountDigits, setAmountDigits] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSimulated, setIsSimulated] = useState(false);

    // Evita duas confirmações com toques seguidos.
    const submittedRef = useRef(false);
    const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cancela o retorno automático se a tela for fechada antes.
    useEffect(() => () => {
        if (backTimerRef.current) {
            clearTimeout(backTimerRef.current);
        }
    }, []);

    const amountText = formatAmount(amountDigits);

    function changeAmount(value: string) {
        setAmountDigits(toAmountDigits(value));
        setErrors((current) => ({ ...current, amount: undefined }));
    }

    function selectCategory(id: string) {
        setCategoryId(id);
        setErrors((current) => ({ ...current, category: undefined }));
    }

    /**
     * Correção intermediária da MTX-03: valida o formulário e mostra
     * uma confirmação de simulação. Nada é gravado; o registro real
     * depende da MTX-01 (useTransactions e Repository).
     */
    function handleSave() {
        if (submittedRef.current) {
            return;
        }

        const nextErrors: FormErrors = {};

        if (Number(amountDigits || '0') <= 0) {
            nextErrors.amount = 'Informe um valor maior que zero.';
        }

        if (!categoryId) {
            nextErrors.category = 'Selecione uma categoria.';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        submittedRef.current = true;
        setIsSimulated(true);
        backTimerRef.current = setTimeout(() => navigation.goBack(), SIMULATION_FEEDBACK_MS);
    }

    function handleDate() {
        Alert.alert('Em breve', 'A seleção de data será implementada em breve.');
    }

    function handleAttachment() {
        Alert.alert('Em breve', 'Os anexos serão implementados em breve.');
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        hitSlop={12}
                        style={styles.backButton}
                    >
                        <Feather name="chevron-left" size={26} color={C.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Adicionar Transação</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Bloco terracota */}
                    <View style={styles.hero}>
                        <View style={styles.toggle}>
                            <Pressable
                                onPress={() => setType('expense')}
                                style={[styles.toggleItem, type === 'expense' && styles.toggleItemActive]}
                            >
                                <Feather
                                    name="arrow-down"
                                    size={16}
                                    color={type === 'expense' ? C.primary : C.whiteSoft}
                                />
                                <Text
                                    style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}
                                >
                                    Gasto
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setType('income')}
                                style={[styles.toggleItem, type === 'income' && styles.toggleItemActive]}
                            >
                                <Feather
                                    name="arrow-up"
                                    size={16}
                                    color={type === 'income' ? C.primary : C.whiteSoft}
                                />
                                <Text
                                    style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}
                                >
                                    Entrada
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={styles.amountLabel}>VALOR DA TRANSAÇÃO</Text>

                        <View style={styles.amountRow}>
                            <Text style={styles.currency}>R$</Text>
                            <TextInput
                                value={amountText}
                                onChangeText={changeAmount}
                                keyboardType="number-pad"
                                placeholder="0,00"
                                placeholderTextColor={C.whiteSoft}
                                selectionColor={C.surface}
                                accessibilityLabel="Valor da transação"
                                style={[
                                    styles.amountInput,
                                    { width: amountInputWidth(amountText) },
                                ]}
                            />
                        </View>
                    </View>

                    {errors.amount && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.amount}
                        </Text>
                    )}

                    {/* Categoria */}
                    <Text style={styles.sectionTitle}>Categoria</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categories}
                    >
                        {CATEGORIES.map((category) => {
                            const isActive = category.id === categoryId;
                            return (
                                <Pressable
                                    key={category.id}
                                    onPress={() => selectCategory(category.id)}
                                    accessibilityRole="button"
                                    aria-selected={isActive}
                                    style={styles.categoryItem}
                                >
                                    <View
                                        style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}
                                    >
                                        <MaterialCommunityIcons
                                            name={category.icon}
                                            size={24}
                                            color={isActive ? C.primary : C.text}
                                        />
                                    </View>
                                    <Text
                                        style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
                                    >
                                        {category.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {errors.category && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.category}
                        </Text>
                    )}

                    {/* Detalhes */}
                    <Text style={styles.sectionTitle}>Detalhes</Text>

                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <MaterialCommunityIcons name="playlist-edit" size={20} color={C.text} />
                            </View>
                            <View style={[styles.detailContent, styles.detailContentDivider]}>
                                <Text style={styles.detailLabel}>Descrição</Text>
                                <TextInput
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Ex.: Jantar com amigos"
                                    placeholderTextColor={C.textSecondary}
                                    selectionColor={C.primary}
                                    style={styles.detailInput}
                                />
                            </View>
                        </View>

                        <Pressable onPress={handleDate} style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Feather name="calendar" size={19} color={C.text} />
                            </View>
                            <View style={[styles.detailContent, styles.detailContentDivider]}>
                                <Text style={styles.detailLabel}>Data</Text>
                                <View style={styles.dateRow}>
                                    <Text style={styles.detailValue}>Hoje, 24 Out</Text>
                                    <Feather name="chevron-right" size={20} color={C.textSecondary} />
                                </View>
                            </View>
                        </Pressable>
                    </View>

                    {/* Anexos */}
                    <View style={styles.attachmentsHeader}>
                        <Text style={styles.sectionTitleInline}>Anexos</Text>
                        <Pressable onPress={handleAttachment} hitSlop={8}>
                            <Text style={styles.addLink}>Adicionar</Text>
                        </Pressable>
                    </View>

                    <View style={styles.attachments}>
                        {/* Comprovante (placeholder até termos a imagem) */}
                        <View style={styles.receipt}>
                            <MaterialCommunityIcons name="receipt" size={34} color={C.textSecondary} />
                            <View style={styles.expandBadge}>
                                <MaterialCommunityIcons name="arrow-expand" size={12} color={C.text} />
                            </View>
                        </View>

                        {/* Câmera */}
                        <Pressable onPress={handleAttachment} style={styles.cameraBox}>
                            <MaterialCommunityIcons
                                name="camera-plus-outline"
                                size={24}
                                color={C.textSecondary}
                            />
                            <Text style={styles.cameraText}>Câmera</Text>
                        </Pressable>
                    </View>
                </ScrollView>

                {/* Botão salvar fixo */}
                <View style={styles.footer}>
                    {isSimulated && (
                        <View
                            style={styles.simulationNotice}
                            accessibilityRole="alert"
                            accessibilityLiveRegion="polite"
                        >
                            <Feather name="info" size={16} color={C.primary} />
                            <Text style={styles.simulationText}>
                                Simulação: os dados são válidos, mas a transação
                                ainda não é gravada nesta versão.
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleSave}
                        disabled={isSimulated}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isSimulated }}
                        style={({ pressed }) => [
                            styles.saveButton,
                            (pressed || isSimulated) && { opacity: 0.85 },
                        ]}
                    >
                        <Feather name="check-circle" size={20} color={C.surface} />
                        <Text style={styles.saveText}>Salvar Transação</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: C.background,
    },
    flex: {
        flex: 1,
    },

    // Cabeçalho
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: C.background,
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontFamily: F.semibold,
        fontSize: 17,
        color: C.text,
    },
    content: {
        paddingBottom: 24,
    },

    // Bloco terracota
    hero: {
        backgroundColor: C.hero,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingHorizontal: 32,
        paddingTop: 24,
        paddingBottom: 32,
        alignItems: 'center',
    },
    toggle: {
        flexDirection: 'row',
        backgroundColor: C.whiteGlass,
        borderRadius: 22,
        padding: 4,
        alignSelf: 'stretch',
        marginBottom: 24,
    },
    toggleItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 9,
        borderRadius: 18,
    },
    toggleItemActive: {
        backgroundColor: C.surface,
    },
    toggleText: {
        fontFamily: F.semibold,
        fontSize: 15,
        color: C.whiteSoft,
    },
    toggleTextActive: {
        color: C.primary,
    },
    amountLabel: {
        fontFamily: F.medium,
        fontSize: 12,
        letterSpacing: 1,
        color: C.whiteSoft,
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currency: {
        fontFamily: F.regular,
        fontSize: 24,
        color: C.surface,
        marginRight: 10,
    },
    amountInput: {
        fontFamily: F.bold,
        fontSize: 44,
        color: C.surface,
        padding: 0,
    },
    errorText: {
        fontFamily: F.regular,
        fontSize: 12,
        color: colors.status.error,
        textAlign: 'center',
        marginTop: 8,
        marginHorizontal: 24,
    },

    // Seções
    sectionTitle: {
        fontFamily: F.medium,
        fontSize: 15,
        color: C.text,
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 24,
    },
    sectionTitleInline: {
        fontFamily: F.medium,
        fontSize: 15,
        color: C.text,
    },

    // Categorias
    categories: {
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryItem: {
        alignItems: 'center',
        width: 72,
    },
    categoryCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: C.categoryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    categoryCircleActive: {
        backgroundColor: C.categoryActiveBg,
        shadowColor: C.primary,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    categoryLabel: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.textSecondary,
    },
    categoryLabelActive: {
        fontFamily: F.semibold,
        color: C.text,
    },

    // Detalhes
    detailsCard: {
        backgroundColor: C.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        paddingLeft: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.detailIconBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    detailContent: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 16,
    },
    detailContentDivider: {
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
    },
    detailLabel: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.textSecondary,
        marginBottom: 4,
    },
    detailInput: {
        fontFamily: F.regular,
        fontSize: 16,
        color: C.text,
        padding: 0,
    },
    detailValue: {
        fontFamily: F.regular,
        fontSize: 16,
        color: C.text,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Anexos
    attachmentsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 28,
        marginBottom: 12,
        marginHorizontal: 24,
    },
    addLink: {
        fontFamily: F.medium,
        fontSize: 13,
        color: C.primary,
    },
    attachments: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
    },
    receipt: {
        width: 96,
        height: 96,
        borderRadius: 8,
        backgroundColor: '#DDD8D4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandBadge: {
        position: 'absolute',
        right: 6,
        bottom: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBox: {
        width: 96,
        height: 96,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: C.attachmentBorder,
        backgroundColor: C.attachmentBg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    cameraText: {
        fontFamily: F.regular,
        fontSize: 11,
        color: C.textSecondary,
    },

    // Rodapé
    footer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 8,
    },
    simulationNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: C.detailIconBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    simulationText: {
        flex: 1,
        fontFamily: F.medium,
        fontSize: 13,
        color: C.primary,
    },
    saveButton: {
        height: 56,
        borderRadius: 14,
        backgroundColor: C.hero,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: C.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    saveText: {
        fontFamily: F.semibold,
        fontSize: 16,
        color: C.surface,
    },
});