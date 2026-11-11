
package com.moneywise.auth.presentation;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class UserControllerIntegrationTest {

    @Autowired
    WebApplicationContext context;

    @Autowired
    UserRepository users;

    @Autowired
    TokenService tokens;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnOnlyAuthenticatedUser() throws Exception {
        UUID id = UUID.randomUUID();

        users.save(User.restore(
                id,
                "Ana",
                Email.of("ana-" + id + "@example.com"),
                "hash-de-teste",
                Currency.getInstance("BRL"),
                Instant.now()
        ));

        String jwt = tokens.issueAccessToken(id);

        mvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Ana"))
                .andExpect(jsonPath("$.currency").value("BRL"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }
}
