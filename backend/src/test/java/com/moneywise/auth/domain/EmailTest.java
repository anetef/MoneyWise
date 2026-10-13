package com.moneywise.auth.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;;

// Testes da classe Email
public class EmailTest {

    @Test
    @DisplayName("Cria um e-mail válido e guarda o valor")    void shouldAddTwoAmountsInSameCurrency() {
        // Arrange (preparar)

        String value = "maria@gmail.com";        

        // Act (agir)
        Email email = Email.of(value);

        // Assert (verificar)
        assertThat(email.value()).isEqualTo("maria@gmail.com");    
    }

    @Test
    @DisplayName("Converte o e-mail para letras minúsculas")
    void shouldConvertEmailToLowercase() {
        // Arrange (preparar)
        String value = "Maria@Gmail.COM";
        // Act (agir)
        Email email = Email.of(value);
        // Assert (verificar)
        assertThat(email.value()).isEqualTo("maria@gmail.com");
    }

    @Test
    @DisplayName("Remove espaços das pontas do e-mail")
    void shouldRemoveSpacesFromEmail() {
        // Arrange (preparar)
        String value = " maria@gmail.com ";

        // Act (agir)
        Email email = Email.of(value);

        // Assert (verificar)
        assertThat(email.value()).isEqualTo("maria@gmail.com");
    }

    @Test 
    @DisplayName("Dois emails que se diferem em maiúsculas devem ser considerados iguais")
    void shouldConsiderEmailsWithDifferentCasesAsEqual() {
        // Arrange (preparar)
        Email email1 = Email.of("maria@gmail.com");
        Email email2 = Email.of("maria@gmail.com");

        // Act e Assert (agir e verificar)        
        assertThat(email1).isEqualTo(email2);
    }

    @Test 
    @DisplayName("Deve recusar email sem @")
    void shouldRejectEmailWithoutAtSign() {
        // Arrange (preparar)
        String value = "mariagmail.com";


        // Assert
        assertThatThrownBy(() -> Email.of(value))
        .isInstanceOf(BusinessRuleException.class)
        .hasFieldOrPropertyWithValue("code", "INVALID_EMAIL");
    }

    @Test 
    @DisplayName("Deve recusar email sem dominio")
    void shouldRejectEmailWithoutDomain() {
        // Arrange (preparar)
        String value = "maria@g";


        // Assert
        assertThatThrownBy(() -> Email.of(value))
        .isInstanceOf(BusinessRuleException.class)
        .hasFieldOrPropertyWithValue("code", "INVALID_EMAIL");
    }

    @Test 
    @DisplayName("Deve recusar email sem ponto no dominio")
    void shouldRejectEmailWithoutDotInDomain() {
        // Arrange (preparar)
        String value = "maria@gmail";
        
        // Assert
        assertThatThrownBy(() -> Email.of(value))
        .isInstanceOf(BusinessRuleException.class)
        .hasFieldOrPropertyWithValue("code", "INVALID_EMAIL");
    }

    @Test 
    @DisplayName("Deve recusar email com espaco no meio")
    void shouldRejectEmailWithSpaceInTheMiddle() {
        // Arrange (preparar)
        String value = "maria silva@gmail.com";

         // Assert
        assertThatThrownBy(() -> Email.of(value))
        .isInstanceOf(BusinessRuleException.class)
        .hasFieldOrPropertyWithValue("code", "INVALID_EMAIL");

    }

    @Test 
    @DisplayName("Deve recusar email em branco")
    void shouldRejectEmailBlank() {
        // Arrange (preparar)
        String value = " ";

         // Assert
        assertThatThrownBy(() -> Email.of(value))
        .isInstanceOf(BusinessRuleException.class)
        .hasFieldOrPropertyWithValue("code", "INVALID_EMAIL");

    }

    @Test
    @DisplayName("Recusa e-mail null")
    void shouldRejectNullEmail() {
        // Act e Assert (agir e verificar)
        assertThatThrownBy(() -> Email.of(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("O e-mail é obrigatório.");
    }



}

