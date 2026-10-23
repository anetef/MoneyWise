-- TX-01: transações financeiras
CREATE TABLE transactions (
    id          UUID          NOT NULL,
    user_id     UUID          NOT NULL,
    amount      NUMERIC(19,2) NOT NULL,
    date        DATE          NOT NULL,
    category    TEXT          NOT NULL,
    type        VARCHAR(7)    NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_transactions PRIMARY KEY (id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_transactions_type CHECK (type IN ('INCOME', 'EXPENSE'))
);

CREATE INDEX idx_transactions_user_date ON transactions (user_id, date);
