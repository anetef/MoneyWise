-- TX-07: categorias personalizadas persistem mesmo sem transacoes.
CREATE TABLE user_categories (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_user_categories PRIMARY KEY (id),
    CONSTRAINT fk_user_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT ck_user_categories_name
        CHECK (length(btrim(name)) > 0)
);

-- Impede duplicidade ignorando maiusculas e espacos externos.
CREATE UNIQUE INDEX uq_user_categories_user_name
ON user_categories (user_id, lower(btrim(name)));

CREATE INDEX idx_user_categories_user
ON user_categories (user_id);
