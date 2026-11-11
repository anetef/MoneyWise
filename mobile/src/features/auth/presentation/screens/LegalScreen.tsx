import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

import {
    LEGAL_DOCUMENTS,
    LEGAL_VERSION,
    type LegalBlock,
    type LegalDocumentId,
} from '../legal/legalTexts';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'Legal'
>;

const TABS: LegalDocumentId[] = ['terms', 'privacy'];

/** Parágrafo, lista numerada ou tabela (no celular, linhas empilhadas). */
function Block({ block }: { block: LegalBlock }) {
    if (block.type === 'paragraph') {
        return <Text style={styles.paragraph}>{block.text}</Text>;
    }

    if (block.type === 'list') {
        return (
            <View style={styles.list}>
                {block.items.map((item, index) => (
                    <View key={item} style={styles.listItem}>
                        <Text style={styles.listNumber}>{index + 1}.</Text>
                        <Text style={styles.listText}>{item}</Text>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.table}>
            {block.rows.map((row, index) => (
                <View
                    key={row.label}
                    style={[styles.tableRow, index > 0 && styles.tableRowDivider]}
                >
                    <Text style={styles.tableLabel}>{row.label}</Text>
                    <Text style={styles.tableDescription}>{row.description}</Text>
                </View>
            ))}
        </View>
    );
}

/**
 * Termos e privacidade (L-19), aberta pelos links do cadastro.
 * Layout do Figma novo com o visual das telas Entrar e Criar conta;
 * o texto completo vem de `legalTexts.ts` (versão 1.0).
 */
export function LegalScreen({ navigation, route }: Props) {
    const [selected, setSelected] = useState<LegalDocumentId>(
        route.params?.document ?? 'terms',
    );

    const document = LEGAL_DOCUMENTS[selected];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </Pressable>

                <Text style={styles.headerTitle} accessibilityRole="header">
                    Termos e privacidade
                </Text>
            </View>

            {/* Abas */}
            <View style={styles.tabs} accessibilityRole="tablist">
                {TABS.map((id) => {
                    const isSelected = id === selected;

                    return (
                        <Pressable
                            key={id}
                            onPress={() => setSelected(id)}
                            accessibilityRole="tab"
                            aria-selected={isSelected}
                            style={[styles.tab, isSelected && styles.tabSelected]}
                        >
                            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                                {LEGAL_DOCUMENTS[id].tabLabel}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.updatedRow}>
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.updatedText}>{LEGAL_VERSION}</Text>
                    </View>

                    <Text style={styles.title} accessibilityRole="header">
                        {document.title}
                    </Text>

                    {document.intro.map((block, index) => (
                        <Block key={`intro-${index}`} block={block} />
                    ))}

                    {document.sections.map((section) => (
                        <View key={section.heading} style={styles.section}>
                            <Text style={styles.sectionHeading} accessibilityRole="header">
                                {section.heading}
                            </Text>
                            {section.blocks.map((block, index) => (
                                <Block key={`${section.heading}-${index}`} block={block} />
                            ))}
                        </View>
                    ))}
                </View>

                <View style={styles.privacyNote}>
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={18}
                        color={colors.status.success}
                    />
                    <Text style={styles.privacyNoteText}>
                        Seus dados financeiros são privados e protegidos.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
        paddingHorizontal: spacing.lg,
    },

    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },

    backIcon: {
        fontSize: 38,
        lineHeight: 42,
        color: colors.text.primary,
    },

    headerTitle: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.md,
        padding: spacing.xs,
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        width: 'auto',
        maxWidth: 480,
        alignSelf: 'stretch',
    },

    tab: {
        flex: 1,
        minHeight: 44,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabSelected: {
        backgroundColor: colors.white,
    },

    tabText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    tabTextSelected: {
        color: colors.primary,
    },

    container: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
        gap: spacing.lg,
    },

    card: {
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.xl,
        gap: spacing.lg,
    },

    updatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    updatedText: {
        ...typography.caption,
        flex: 1,
        color: colors.text.secondary,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.text.primary,
    },

    section: {
        gap: spacing.sm,
    },

    sectionHeading: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    paragraph: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 24,
    },

    list: {
        gap: spacing.sm,
    },

    listItem: {
        flexDirection: 'row',
        gap: spacing.sm,
    },

    listNumber: {
        ...typography.body,
        fontFamily: fontFamily.semiBold,
        color: colors.primary,
        lineHeight: 24,
    },

    listText: {
        ...typography.body,
        flex: 1,
        color: colors.text.secondary,
        lineHeight: 24,
    },

    table: {
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.md,
    },

    tableRow: {
        padding: spacing.md,
        gap: spacing.xxs,
    },

    tableRowDivider: {
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },

    tableLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    tableDescription: {
        ...typography.caption,
        color: colors.text.secondary,
        lineHeight: 20,
    },

    privacyNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.xs,
    },

    privacyNoteText: {
        ...typography.caption,
        flex: 1,
        color: colors.text.secondary,
    },
});
