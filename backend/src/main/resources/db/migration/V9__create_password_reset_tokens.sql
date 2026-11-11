CREATE TABLE password_reset_tokens (
    id            UUID         NOT NULL,
    user_id       UUID         NOT NULL,
    code_hash     VARCHAR(64)  NOT NULL,
    expires_at    TIMESTAMPTZ  NOT NULL,
    attempts      INTEGER      NOT NULL DEFAULT 0,
    last_sent_at  TIMESTAMPTZ  NOT NULL,
    used_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_password_reset_tokens_user_id UNIQUE (user_id),
    CONSTRAINT ck_password_reset_tokens_attempts CHECK (attempts >= 0)
);