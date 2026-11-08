package com.moneywise.groups.infrastructure;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

import com.moneywise.groups.application.port.InvitationCodeGenerator;

/**
 * Código de 10 caracteres sem símbolos ambíguos (0/O, 1/I/L), fácil de digitar ou ler num QR Code.
 * São 31^10 (cerca de 8 × 10^14) combinações; a coluna {@code code} é única no banco.
 */
@Component
public class SecureRandomInvitationCodeGenerator implements InvitationCodeGenerator {

    private static final char[] ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int LENGTH = 10;

    private final SecureRandom random = new SecureRandom();

    @Override
    public String generate() {
        char[] code = new char[LENGTH];
        for (int i = 0; i < LENGTH; i++) {
            code[i] = ALPHABET[random.nextInt(ALPHABET.length)];
        }
        return new String(code);
    }
}
