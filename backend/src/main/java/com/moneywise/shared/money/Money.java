package com.moneywise.shared.money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.Objects;


// Classe que representa o tipo oficial de dinheiro do MoneyWise.
public record Money(BigDecimal amount, Currency currency) implements Comparable<Money> { 
    // Até quantas casas decimais o valor pode ter
    public static final int SCALE = 2;

    // Arredondar o valor para o numero mais proximo
    public static final RoundingMode ROUNDING = RoundingMode.HALF_EVEN;

    // Construtor da classe
    public Money {
        // Se o valor for nulo lança uma exceção com a mensgaem pedindo o valor
        Objects.requireNonNull(amount, "O valor é obrigatório.");

        // Se o valor for nulo lança uma exceção com a mensgaem pedindo o valor
        Objects.requireNonNull(currency, "A moeda é obrigatória.");

        //Força 2 casas decimais. 
        amount = amount.setScale(SCALE, ROUNDING);
    }

    // forma prática de criar um objeto Money a partir de duas String.
    public static Money of(String amount, String currencyCode) {
        // Cria um novo money e transforma essa String em um BigDecimal.
        return new Money(new BigDecimal(amount), Currency.getInstance(currencyCode));
    }

    // Serve para criar um Money com valor zero, mas mantendo a moeda informada.
    public static Money zero(Currency currency) {
        return new Money(BigDecimal.ZERO, currency);
    }


    // Somar dois objetos money e devolve um novo
    public Money plus(Money other) {
        // Verifica se as duas moedas são iguais.
        assertSameCurrency(other);

        // Retorna um novo money 
        return new Money(amount.add(other.amount), currency);
    }


    // Subtração entre dois objetos Money.
    public Money minus(Money other) {
        // Verifica se as duas moedas são iguais.
        assertSameCurrency(other);

        // Retorna um novo money 
        return new Money(amount.subtract(other.amount), currency);
    }

    // Verifica se um valor é maior que outro
     public boolean isGreaterThan(Money other) {

        return compareTo(other) > 0;
    }

    // Verifica se um valor é menor que outro
    public boolean isLessThan(Money other) {
        return compareTo(other) < 0;
    }
    // Verifica se um valor é maior que zero
    public boolean isZero() {
        return amount.signum() == 0;
    }

    //Ccomparar o valor de dois Money e descobrir se um é menor, igual ou maior que o outro.
    @Override
    public int compareTo(Money other) {
        // Verifica se as duas moedas são iguais.
        assertSameCurrency(other);

        return amount.compareTo(other.amount);
    }

    // Verifica se um valor é maior que negativo
    public boolean isNegative() {
        return amount.signum() < 0;
    }

    // Verifica se está tentando fazer uma operação com duas moedas iguais.
    private void assertSameCurrency(Money other) {
        // Verifica se other não é nulo
        Objects.requireNonNull(other, "O valor a comparar é obrigatório.");

        // Compara as duas moedas
        if (!currency.equals(other.currency)) {
            // Se as moedas forem diferentes lança uma excecao falando que as moedas não são iguais
            throw new IllegalArgumentException(
                "Não é possível operar valores em moedas diferentes: "
                + currency + " e " + other.currency + ".");
        }
    }
}
