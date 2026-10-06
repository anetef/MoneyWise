package com.moneywise;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requer PostgreSQL. Reativar quando a tarefa do banco estiver pronta.")
class MoneyWiseApplicationTests {

    @Test
    void contextLoads() {
    }
}