package com.moneywise.Money;
import com.moneywise.shared.Money;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Testes da classe Money
class MoneyTest {
    @Test
    @DisplayName("Soma dois valores na mesma moeda")
    void shouldAddTwoAmountsInSameCurrency() {
        // Arrange (preparar)
        Money a = Money.of("10.00", "BRL");
        Money b = Money.of("5.50", "BRL");

        // Act (agir)
        Money result = a.plus(b);

        // Assert (verificar)
        assertThat(result).isEqualTo(Money.of("15.50", "BRL"));
    }

    @Test
    @DisplayName("Não permite somar moedas diferentes")
    void shouldNotAddDifferentCurrencies() {
        Money real = Money.of("10.00", "BRL");
        Money dolar = Money.of("10.00", "USD");

        assertThatThrownBy(() -> real.plus(dolar))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test 
    @DisplayName("Subtrai dois valores na mesma moeda")
    void shouldSubtractTwoAmountsInSameCurrency() {
        // Arrange (preparar)
        Money a = Money.of("10.00", "BRL");
        Money b = Money.of("5.50", "BRL");

        // Act (agir)
        Money result = a.minus(b);


        // Assert (verificar)
        assertThat(result).isEqualTo(Money.of("4.50", "BRL"));
    }

    @Test
    @DisplayName("Não permite subtrair moedas diferentes")
    void shouldNotSubtractDifferentCurrencies() {
        Money real = Money.of("10.00", "BRL");
        Money dolar = Money.of("5.50", "USD");

        assertThatThrownBy(() -> real.minus(dolar))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test 
    @DisplayName("Valor maior que outro")
    void shouldBeGreaterThanAnotherAmount() {
        // Arrange (preparar)
        Money a = Money.of("10.00", "BRL");
        Money b = Money.of("5.50", "BRL");

        // Act (agir)
        boolean result = a.isGreaterThan(b);

        // Assert (verificar)
        assertThat(result).isTrue();
    }

    @Test 
    @DisplayName("Valor menor que outro")
    void shouldBeLessThanAnotherAmount() {
        // Arrange (preparar)
        Money a = Money.of("10.00", "BRL");
        Money b = Money.of("5.50", "BRL");

        // Act (agir)
        boolean result = a.isLessThan(b);

        // Assert (verificar)
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Considera valores com escalas diferentes como iguais")
    void shouldConsiderAmountsWithDifferentScalesEqual() {
        Money a = Money.of("10.0", "BRL");
        Money b = Money.of("10.00", "BRL");

        assertThat(a).isEqualTo(b);
    }

    @Test
    @DisplayName("Arredonda 10.015 para 10.02")
    void shouldRoundUpToEven() {
        Money money = Money.of("10.015", "BRL");

        assertThat(money).isEqualTo(Money.of("10.02", "BRL"));
    }

    @Test
    @DisplayName("Mantém o valor original após uma soma")
    void shouldKeepOriginalValueAfterAddition() {
        // Arrange (preparar)
        Money a = Money.of("10.00", "BRL");
        Money b = Money.of("5.00", "BRL");

        // Act (agir)
        a.plus(b);

        // Assert (verificar)
        assertThat(a).isEqualTo(Money.of("10.00", "BRL"));
    }

    @Test
    @DisplayName("Identifica resultado negativo após subtração")
    void shouldIdentifyNegativeAmountAfterSubtraction() {
        // Arrange (preparar)
        Money a = Money.of("5.00", "BRL");
        Money b = Money.of("10.00", "BRL");

        // Act (agir)
        Money result = a.minus(b);

        // Assert (verificar)
        assertThat(result.isNegative()).isTrue();
    }   

    @Test
    @DisplayName("Não permite criar Money com moeda nula")
    void shouldNotAllowNullCurrency() {
        assertThatThrownBy(() -> Money.of("10.00", null))
        .isInstanceOf(NullPointerException.class);
    }

}