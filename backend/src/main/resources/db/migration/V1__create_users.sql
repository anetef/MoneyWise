-- V1: tabela de usuários (DB-02 / SEC-01)
CREATE TABLE users (
    id             UUID          NOT NULL,
    email          VARCHAR(254)  NOT NULL,
    password_hash  VARCHAR(255)  NOT NULL,
    name           VARCHAR(100)  NOT NULL,
    currency       CHAR(3)       NOT NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_users PRIMARY KEY (id),

    -- e-mail único (garantia final, mesmo que o caso de uso falhe)
    CONSTRAINT uq_users_email UNIQUE (email),

    -- O domínio sempre guarda o e-mail em minúsculas; o banco garante isso também,
    -- senão Maria@x.com e maria@x.com passariam pela constraint UNIQUE
    CONSTRAINT ck_users_email_lowercase CHECK (email = lower(email)),

    -- código de moeda ISO 4217 (ex.: BRL, USD)
    CONSTRAINT ck_users_currency_format CHECK (currency ~ '^[A-Z]{3}$')
);