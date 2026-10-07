package com.moneywise.web;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.web.GlobalExceptionHandler;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Teste da camada web, usando MockMvc, para verificar se o GlobalExceptionHandler transforma cada exceção na resposta HTTP correta.
class GlobalExceptionHandlerTest {

    // Controller falso, só para o teste 
    record SampleRequest(@NotBlank String name, @Email String email) {
    }

    @RestController
    static class FakeController {
        // Endpoint de recurso não encontrado
        @GetMapping("/test/not-found")
        void notFound() {
            throw new ResourceNotFoundException("Transação não encontrada.");
        }

        // Endpoint de acesso proibido
        @GetMapping("/test/forbidden")
        void forbidden() {
            throw new ForbiddenOperationException("Só o Admin pode remover membros.");
        }

        // Endpoint de conflito
        @GetMapping("/test/conflict")
        void conflict() {
            throw new ConflictException("EMAIL_ALREADY_IN_USE", "Este e-mail já está cadastrado.");
        }

        // Provoca uma regra de negocio inválida
        @GetMapping("/test/business-rule")
        void businessRule() {
            throw new BusinessRuleException("MONTH_CLOSED", "Não é possível alterar transações de um mês já fechado.");
        }

        // Erri inesperado
        @GetMapping("/test/unexpected")
        void unexpected() {
            throw new IllegalStateException("detalhe interno que não pode vazar");
        }

        @PostMapping("/test/validation")
        void validation(@Valid @RequestBody SampleRequest request) {
        }
    }

    // Preparação 
    //permite simular requisições HTTP sem precisar subir o servidor da aplicação.
    private MockMvc mockMvc;

    // Executa antes de todo teste
    @BeforeEach
    void setUp() {
        // testa o controller isoladamente
        mockMvc = MockMvcBuilders.standaloneSetup(new FakeController())
                // Usa o GlobalExceptionHandler para tratar as exceções do FakeController.
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // Testes 

    @Test
    @DisplayName("Recurso não encontrado retorna 404")
    void shouldReturn404ForResourceNotFound() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Transação não encontrada."))
                .andExpect(jsonPath("$.fields", hasSize(0)));
    }

    @Test
    @DisplayName("Acesso negado retorna 403")
    void shouldReturn403ForForbiddenOperation() throws Exception {
        mockMvc.perform(get("/test/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("Conflito retorna 409 com o código específico")
    void shouldReturn409ForConflict() throws Exception {
        mockMvc.perform(get("/test/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_IN_USE"))
                .andExpect(jsonPath("$.message").value("Este e-mail já está cadastrado."));
    }

    @Test
    @DisplayName("Regra de negócio violada retorna 422")
    void shouldReturn422ForBusinessRule() throws Exception {
        mockMvc.perform(get("/test/business-rule"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("MONTH_CLOSED"));
    }

    @Test
    @DisplayName("Validação retorna 400 com a lista de campos inválidos")
    void shouldReturn400WithInvalidFields() throws Exception {
        String body = """
                { "name": "", "email": "nao-e-um-email" }
                """;

        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fields", hasSize(2)))
                .andExpect(jsonPath("$.fields[*].field", containsInAnyOrder("name", "email")));
    }

    @Test
    @DisplayName("JSON mal formatado retorna 400")
    void shouldReturn400ForMalformedJson() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ isso não é json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    @DisplayName("Erro inesperado retorna 500 sem expor detalhes internos")
    void shouldReturn500WithoutLeakingDetails() throws Exception {
        mockMvc.perform(get("/test/unexpected"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }
}
