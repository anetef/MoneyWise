-- V3: data de confirmação do e-mail (decisão da equipe: só entra quem confirmou o e-mail)
-- NULL = e-mail ainda não confirmado.

ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;