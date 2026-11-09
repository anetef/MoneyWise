# L-10 — Participação em grupos durante a exclusão de conta

## Decisão

Antes de excluir uma conta, a aplicação remove o usuário de todos os grupos dos quais participa. Se ele for Admin e houver outros membros, o membro mais antigo assume o papel de Admin, conforme a regra já implementada no domínio (`joinedAt`, com `userId` como desempate). Se ele for o único membro, o grupo é excluído junto com seus convites.

## Consequências

- O fluxo de exclusão de conta deve carregar e atualizar os grupos pelo domínio antes de excluir o usuário.
- As chaves estrangeiras com `ON DELETE CASCADE` são uma proteção para remover associações e convites órfãos; não substituem a promoção do Admin no fluxo da aplicação.
- O backend ainda não possui um caso de uso de exclusão de conta. Esse caso de uso deverá aplicar esta decisão quando for criado.
