-- GRP-01: grupos, participantes e convites por código (convite válido por 7 dias).
CREATE TABLE groups (
    id          UUID          NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    admin_id    UUID          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_groups PRIMARY KEY (id),
    CONSTRAINT fk_groups_admin FOREIGN KEY (admin_id) REFERENCES users (id),
    CONSTRAINT ck_groups_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE TABLE group_members (
    group_id   UUID         NOT NULL,
    user_id    UUID         NOT NULL,
    role       VARCHAR(6)   NOT NULL,
    joined_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_group_members PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT ck_group_members_role CHECK (role IN ('ADMIN', 'MEMBER'))
);

CREATE INDEX idx_group_members_user_id ON group_members (user_id, joined_at);

CREATE TABLE group_invitations (
    id            UUID          NOT NULL,
    code          VARCHAR(64)   NOT NULL,
    group_id      UUID          NOT NULL,
    invited_by    UUID          NOT NULL,
    status        VARCHAR(9)    NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ   NOT NULL DEFAULT (now() + INTERVAL '7 days'),

    CONSTRAINT pk_group_invitations PRIMARY KEY (id),
    CONSTRAINT uq_group_invitations_code UNIQUE (code),
    CONSTRAINT fk_group_invitations_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES users (id),
    CONSTRAINT ck_group_invitations_status CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    CONSTRAINT ck_group_invitations_expiration CHECK (expires_at = created_at + INTERVAL '7 days')
);

CREATE INDEX idx_group_invitations_group_status ON group_invitations (group_id, status);
