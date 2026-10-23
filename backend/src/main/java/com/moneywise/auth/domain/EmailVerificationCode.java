package com.moneywise.auth.domain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Objects;
import java.util.UUID;

public final class EmailVerificationCode {

    public static final Duration VALIDITY = Duration.ofMinutes(15);
    public static final Duration RESEND_COOLDOWN = Duration.ofMinutes(1);
    public static final int MAX_ATTEMPTS = 5;

    private final UUID id;
    private final UUID userId;
    private String codeHash;
    private Instant expiresAt;
    private int attempts;
    private Instant lastSentAt;

    private EmailVerificationCode(UUID id, UUID userId, String codeHash,
                                  Instant expiresAt, int attempts, Instant lastSentAt) {
        this.id = Objects.requireNonNull(id);
        this.userId = Objects.requireNonNull(userId);
        this.codeHash = Objects.requireNonNull(codeHash);
        this.expiresAt = Objects.requireNonNull(expiresAt);
        this.attempts = attempts;
        this.lastSentAt = Objects.requireNonNull(lastSentAt);
    }

    /** Cria o primeiro código de um usuário. Guarda só o hash do código. */
    public static EmailVerificationCode issue(UUID userId, String rawCode, Instant now) {
        return new EmailVerificationCode(UUID.randomUUID(), userId, hash(rawCode),
                now.plus(VALIDITY), 0, now);
    }

    /** Remonta um código que veio do banco. */
    public static EmailVerificationCode restore(UUID id, UUID userId, String codeHash,
                                                Instant expiresAt, int attempts, Instant lastSentAt) {
        return new EmailVerificationCode(id, userId, codeHash, expiresAt, attempts, lastSentAt);
    }

    /** Reenvio: troca o código, renova o prazo e zera as tentativas. */
    public void replace(String rawCode, Instant now) {
        this.codeHash = hash(rawCode);
        this.expiresAt = now.plus(VALIDITY);
        this.attempts = 0;
        this.lastSentAt = now;
    }

    public boolean canResendAt(Instant now) {
        return !now.isBefore(lastSentAt.plus(RESEND_COOLDOWN));
    }

    public boolean isExpiredAt(Instant now) {
        return !now.isBefore(expiresAt);
    }

    public boolean hasExhaustedAttempts() {
        return attempts >= MAX_ATTEMPTS;
    }

    public boolean matches(String rawCode) {
        if (rawCode == null) {
            return false;
        }
        return MessageDigest.isEqual(
                hash(rawCode).getBytes(StandardCharsets.UTF_8),
                codeHash.getBytes(StandardCharsets.UTF_8));
    }

    public void registerFailedAttempt() {
        attempts++;
    }

    static String hash(String rawCode) {
        Objects.requireNonNull(rawCode);
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawCode.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getCodeHash() { return codeHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public int getAttempts() { return attempts; }
    public Instant getLastSentAt() { return lastSentAt; }
}
