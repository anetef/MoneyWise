package com.moneywise.shared;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import java.util.Map;
import java.util.function.Predicate;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;

import com.moneywise.shared.doc.ApiVersioningConfiguration;
import com.moneywise.shared.doc.OpenApiConfiguration;

class ApiDocumentationConfigurationTests {

    @Test
    void appliesApiVersionPrefixOnlyToRestControllersInMoneyWisePackage() {
        ExposedPathMatchConfigurer configurer = new ExposedPathMatchConfigurer();

        new ApiVersioningConfiguration().configurePathMatch(configurer);

        assertEquals(1, configurer.pathPrefixes().size());
        Predicate<Class<?>> prefixPredicate = configurer.pathPrefixes().get("/api/v1");
        assertNotNull(prefixPredicate);
        assertTrue(prefixPredicate.test(ProbeController.class));
        assertFalse(prefixPredicate.test(NonController.class));
    }

    @Test
    void declaresMoneyWiseOpenApiMetadataAndBearerAuthentication() {
        OpenAPIDefinition definition = OpenApiConfiguration.class
                .getAnnotation(OpenAPIDefinition.class);
        SecurityScheme securityScheme = OpenApiConfiguration.class
                .getAnnotation(SecurityScheme.class);

        assertNotNull(definition);
        assertEquals("MoneyWise API", definition.info().title());
        assertEquals("1.0.0", definition.info().version());

        assertNotNull(securityScheme);
        assertEquals("BearerAuth", securityScheme.name());
        assertEquals("bearer", securityScheme.scheme());
        assertEquals("JWT", securityScheme.bearerFormat());
    }

    @RestController
    static class ProbeController {
    }

    static class NonController {
    }

    private static class ExposedPathMatchConfigurer extends PathMatchConfigurer {

        Map<String, Predicate<Class<?>>> pathPrefixes() {
            return getPathPrefixes();
        }
    }
}
