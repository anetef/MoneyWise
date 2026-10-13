package com.moneywise;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import java.util.HashSet;
import java.util.Set;

/**
 * Regras de dependência da Clean Architecture do backend (Documento de Arquitetura, seção 5.2).
 *
 * A única dependência entre módulos autorizada é goals.application ->
 * groups.application.GroupAuthorizationService, para consultar a autorização do grupo
 * antes de operar sobre uma meta (seção 6.3). O teste mantém essa exceção restrita a
 * esse serviço; não libera dependências gerais entre os módulos.
 */
@AnalyzeClasses(
        packages = "com.moneywise",
        importOptions = ImportOption.DoNotIncludeTests.class
)
class ArchitectureRulesTest {

    private static final String GROUPS_APPLICATION_PACKAGE = "com.moneywise.groups.application";
    private static final String GROUP_AUTHORIZATION_SERVICE =
            GROUPS_APPLICATION_PACKAGE + ".GroupAuthorizationService";

    @ArchTest
    static final ArchRule domainDoesNotDependOnFrameworksOrOuterLayers = noClasses()
            .that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..",
                    "jakarta.persistence..",
                    "javax.persistence..",
                    "org.hibernate..",
                    "..application..",
                    "..infrastructure..",
                    "..presentation.."
            ).allowEmptyShould(true);

    @ArchTest
    static final ArchRule domainUsesOnlyFrameworkFreeSharedClasses = noClasses()
            .that().resideInAPackage("..domain..")
            .should(domainMustUseFrameworkFreeSharedTypes())
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule applicationDoesNotDependOnInfrastructureOrPresentation = noClasses()
            .that().resideInAPackage("..application..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..infrastructure..",
                    "..presentation.."
            ).allowEmptyShould(true);

    @ArchTest
    static final ArchRule presentationDoesNotDependOnInfrastructure = noClasses()
            .that().resideInAPackage("..presentation..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule infrastructureDoesNotDependOnPresentation = noClasses()
            .that().resideInAPackage("..infrastructure..")
            .should().dependOnClassesThat().resideInAPackage("..presentation..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule sharedDoesNotDependOnFeatureModules = noClasses()
            .that().resideInAPackage("com.moneywise.shared..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.moneywise.auth..",
                    "com.moneywise.transactions..",
                    "com.moneywise.groups..",
                    "com.moneywise.goals..",
                    "com.moneywise.reports..",
                    "com.moneywise.notifications.."
            );

    @ArchTest
    static final ArchRule goalsApplicationUsesOnlyTheDocumentedGroupAuthorizationService =
            noClasses().that().resideInAPackage("com.moneywise.goals.application..")
                    .should(dependOnNoOtherGroupsApplicationType())
                    .allowEmptyShould(true);

    private static ArchCondition<JavaClass> domainMustUseFrameworkFreeSharedTypes() {
        return new ArchCondition<>("depend only on framework-free types from shared") {
            @Override
            public void check(JavaClass domainClass, ConditionEvents events) {
                for (Dependency dependency : domainClass.getDirectDependenciesFromSelf()) {
                    JavaClass sharedType = dependency.getTargetClass();
                    if (!sharedType.getPackageName().startsWith("com.moneywise.shared")) {
                        continue;
                    }

                    boolean importsFramework = dependsOnFrameworkType(sharedType, new HashSet<>());

                    if (importsFramework) {
                        String message = String.format(
                                "%s depends on %s in shared, which depends on a Spring/JPA type",
                                domainClass.getName(),
                                sharedType.getName()
                        );
                        events.add(SimpleConditionEvent.violated(domainClass, message));
                    }
                }
            }
        };
    }

    private static ArchCondition<JavaClass> dependOnNoOtherGroupsApplicationType() {
        return new ArchCondition<>(
                "depend on groups.application only through GroupAuthorizationService (section 6.3)"
        ) {
            @Override
            public void check(JavaClass goalsClass, ConditionEvents events) {
                for (Dependency dependency : goalsClass.getDirectDependenciesFromSelf()) {
                    JavaClass target = dependency.getTargetClass();
                    if (target.getPackageName().startsWith(GROUPS_APPLICATION_PACKAGE)
                            && !target.getName().equals(GROUP_AUTHORIZATION_SERVICE)) {
                        String message = String.format(
                                "%s depends on %s; only %s is allowed by section 6.3",
                                goalsClass.getName(),
                                target.getName(),
                                GROUP_AUTHORIZATION_SERVICE
                        );
                        events.add(SimpleConditionEvent.violated(goalsClass, message));
                    }
                }
            }
        };
    }

    private static boolean isFrameworkType(JavaClass type) {
        String packageName = type.getPackageName();
        return packageName.startsWith("org.springframework")
                || packageName.startsWith("jakarta.persistence")
                || packageName.startsWith("javax.persistence")
                || packageName.startsWith("org.hibernate");
    }

    private static boolean dependsOnFrameworkType(JavaClass type, Set<String> visitedTypes) {
        if (!visitedTypes.add(type.getName())) {
            return false;
        }

        for (Dependency dependency : type.getDirectDependenciesFromSelf()) {
            JavaClass target = dependency.getTargetClass();
            if (isFrameworkType(target)) {
                return true;
            }
            if (target.getPackageName().startsWith("com.moneywise.shared")
                    && dependsOnFrameworkType(target, visitedTypes)) {
                return true;
            }
        }
        return false;
    }
}
