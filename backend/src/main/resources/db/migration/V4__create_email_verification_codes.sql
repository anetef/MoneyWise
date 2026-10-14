CREATE TABLE email_verification_codes (
    id            UUID         NOT NULL,
    user_id       UUID         NOT NULL,
    code_hash     VARCHAR(64)  NOT NULL,
    expires_at    TIMESTAMPTZ  NOT NULL,
    attempts      INTEGER      NOT NULL DEFAULT 0,
    last_sent_at  TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_email_verification_codes PRIMARY KEY (id),
    CONSTRAINT fk_email_verification_codes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_email_verification_codes_user_id UNIQUE (user_id),
    CONSTRAINT ck_email_verification_codes_attempts CHECK (attempts >= 0)
);