package com.moneywise.transactions.presentation;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class CategoryControllerIntegrationTest {

    private static final String URL = "/api/v1/categories";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository users;

    @Autowired
    private TokenService tokens;

    @Autowired
    private JdbcTemplate jdbc;

    private MockMvc mvc;

    private record Actor(UUID id, String token) {}

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private Actor createUser() {
        UUID id = UUID.randomUUID();

        users.save(User.restore(
                id,
                "Usuario Teste",
                Email.of("user-" + id + "@example.com"),
                "hash-de-teste",
                Currency.getInstance("BRL"),
                Instant.now()
        ));

        return new Actor(id, tokens.issueAccessToken(id));
    }

    private void insertTransaction(Actor actor, String category) {
        jdbc.update("""
            INSERT INTO transactions
                (id, user_id, amount, date, category, type)
            VALUES (?, ?, 10.00, CURRENT_DATE, ?, 'EXPENSE')
            """,
            UUID.randomUUID(),
            actor.id(),
            category
        );
    }

    private org.springframework.test.web.servlet.ResultActions
            createCategory(Actor actor, String name) throws Exception {

        return mvc.perform(post(URL)
                .header("Authorization", "Bearer " + actor.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"" + name + "\"}"));
    }

    @Test
    void rejectsRequestsWithoutToken() throws Exception {
        mvc.perform(get(URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listsSixFixedCategoriesInCorrectOrder() throws Exception {
        Actor actor = createUser();

        mvc.perform(get(URL)
                .header("Authorization", "Bearer " + actor.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[0].name").value("Comida"))
                .andExpect(jsonPath("$[1].name").value("Transporte"))
                .andExpect(jsonPath("$[2].name").value("Compras"))
                .andExpect(jsonPath("$[3].name").value("Casa"))
                .andExpect(jsonPath("$[4].name").value("Saúde"))
                .andExpect(jsonPath("$[5].name").value("Outros"))
                .andExpect(jsonPath("$[0].fixed").value(true));
    }

    @Test
    void createsCategoryWithoutTransaction() throws Exception {
        Actor actor = createUser();

        createCategory(actor, "Pet")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Pet"))
                .andExpect(jsonPath("$.fixed").value(false));

        mvc.perform(get(URL)
                .header("Authorization", "Bearer " + actor.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)))
                .andExpect(jsonPath("$[6].name").value("Pet"));
    }

    @Test
    void ordersCustomCategoriesByUsage() throws Exception {
        Actor actor = createUser();

        createCategory(actor, "Pet")
                .andExpect(status().isCreated());

        createCategory(actor, "Arte")
                .andExpect(status().isCreated());

        insertTransaction(actor, "Viagem");
        insertTransaction(actor, "Viagem");
        insertTransaction(actor, "Pet");

        mvc.perform(get(URL)
                .header("Authorization", "Bearer " + actor.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(9)))
                .andExpect(jsonPath("$[6].name").value("Viagem"))
                .andExpect(jsonPath("$[7].name").value("Pet"))
                .andExpect(jsonPath("$[8].name").value("Arte"));
    }

    @Test
    void preventsDuplicateAndFixedCategories() throws Exception {
        Actor actor = createUser();

        createCategory(actor, "Pet")
                .andExpect(status().isCreated());

        createCategory(actor, "pEt")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code")
                        .value("CATEGORY_ALREADY_EXISTS"));

        createCategory(actor, "comida")
                .andExpect(status().isConflict());
    }

    @Test
    void isolatesCategoriesBetweenUsers() throws Exception {
        Actor ana = createUser();
        Actor bruno = createUser();

        createCategory(ana, "Segredos")
                .andExpect(status().isCreated());

        mvc.perform(get(URL)
                .header("Authorization", "Bearer " + bruno.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));

        mvc.perform(get(URL)
                .header("Authorization", "Bearer " + ana.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[6].name").value("Segredos"));
    }

    @Test
    void validatesCategoryName() throws Exception {
        Actor actor = createUser();

        createCategory(actor, "")
                .andExpect(status().isBadRequest());

        createCategory(actor, "A".repeat(51))
                .andExpect(status().isBadRequest());
    }
}
