package com.moneywise.transactions.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.ZoneId;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TransactionUseCaseConfigTest {

    @Test
    @DisplayName("Usa o fuso de São Paulo para as regras de mês das transações")
    void usesSaoPauloForTransactionBusinessClock() {
        var clock = new TransactionUseCaseConfig().transactionBusinessClock();

        assertThat(clock.getZone()).isEqualTo(ZoneId.of("America/Sao_Paulo"));
    }
}
