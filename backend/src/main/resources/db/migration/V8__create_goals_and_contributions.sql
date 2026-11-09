CREATE TABLE goals (
    id                  UUID           NOT NULL,
    group_id            UUID           NOT NULL,
    name                VARCHAR(100)   NOT NULL,
    target_amount       NUMERIC(19,2)  NOT NULL,
    currency            CHAR(3)        NOT NULL,
    deadline            DATE,
    icon                VARCHAR(50),
    category            VARCHAR(50),
    monthly_reminder    BOOLEAN        NOT NULL DEFAULT FALSE,
    milestones_enabled  BOOLEAN        NOT NULL DEFAULT FALSE,
    archived            BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT pk_goals PRIMARY KEY (id),
    CONSTRAINT fk_goals_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT ck_goals_name_not_blank CHECK (length(trim(name)) > 0),
    CONSTRAINT ck_goals_target_positive CHECK (target_amount > 0),
    CONSTRAINT ck_goals_currency_format CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_goals_group_id ON goals (group_id);

CREATE TABLE contributions (
    id          UUID           NOT NULL,
    goal_id     UUID           NOT NULL,
    user_id     UUID,
    type        VARCHAR(8)     NOT NULL,
    amount      NUMERIC(19,2)  NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT pk_contributions PRIMARY KEY (id),
    CONSTRAINT fk_contributions_goal FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE,

    CONSTRAINT fk_contributions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_contributions_type CHECK (type IN ('ENTRADA', 'RETIRADA')),
    CONSTRAINT ck_contributions_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_contributions_goal_user ON contributions (goal_id, user_id);