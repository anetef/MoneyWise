/**
 * Termos de Uso e Política de Privacidade, versão 1.0 (L-19, DOC-01).
 *
 * Texto copiado literalmente de `docs/termos-uso-privacidade.md`,
 * escrito pela dupla de organização. Ao mudar o documento, atualizar
 * aqui também, sem reescrever o texto.
 */
export type LegalDocumentId = 'terms' | 'privacy';

export type LegalBlock =
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'table'; rows: { label: string; description: string }[] };

export type LegalSection = {
    heading: string;
    blocks: LegalBlock[];
};

export type LegalDocument = {
    tabLabel: string;
    title: string;
    intro: LegalBlock[];
    sections: LegalSection[];
};

export const LEGAL_VERSION = 'Versão 1.0 · Última atualização: 10 de novembro de 2026';

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
    terms: {
        tabLabel: 'Termos de Uso',
        title: 'Termos de Uso',
        intro: [
            {
                type: 'paragraph',
                text: 'Ao criar uma conta, você declara que leu e aceitou os Termos de Uso e a Política de Privacidade abaixo.',
            },
            {
                type: 'paragraph',
                text: 'O MoneyWise é um projeto acadêmico. Este texto foi escrito pela equipe em linguagem simples e não substitui uma revisão jurídica.',
            },
        ],
        sections: [
            {
                heading: 'Aceitação dos Termos',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Ao criar uma conta no MoneyWise, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar com algum ponto, não crie a conta.',
                    },
                ],
            },
            {
                heading: 'Sobre o MoneyWise',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'O MoneyWise é um aplicativo de organização financeira pessoal e colaborativa. Com ele, você pode registrar receitas e despesas, separar os gastos por categoria, acompanhar o resumo do mês e criar Caixinhas, que são metas de economia individuais ou compartilhadas com outras pessoas. O progresso de cada meta aparece no Termômetro.',
                    },
                    {
                        type: 'paragraph',
                        text: 'O MoneyWise é um projeto acadêmico desenvolvido por estudantes da Universidade Católica de Brasília. Ele não é um banco e não movimenta dinheiro de verdade. Os valores registrados no aplicativo são apenas anotações feitas por você.',
                    },
                ],
            },
            {
                heading: 'Quem Pode Usar',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Qualquer pessoa pode criar uma conta. Menores de 18 anos só podem usar o MoneyWise com a autorização de um dos pais ou de um responsável legal, que passa a responder pelo uso da conta.',
                    },
                ],
            },
            {
                heading: 'Cadastro e Conta',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Para criar uma conta, você informa nome, e-mail e senha. O aplicativo envia um código para o e-mail informado, e a conta só é liberada depois que você confirma esse código.',
                    },
                    {
                        type: 'paragraph',
                        text: 'Você é responsável por manter sua senha em segredo e por tudo o que for feito na sua conta. Cada pessoa pode ter apenas uma conta por e-mail. Se esquecer a senha, você pode criar uma nova pela opção "Esqueci a senha", usando um código enviado ao seu e-mail.',
                    },
                ],
            },
            {
                heading: 'Caixinhas Compartilhadas',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Quem cria uma Caixinha compartilhada é o Administrador dela. Só o Administrador cria e edita as metas, convida novos membros e exclui membros. Os convites são feitos por um código, que pode ser enviado por link, WhatsApp ou QR Code, e valem por 7 dias.',
                    },
                    {
                        type: 'paragraph',
                        text: 'Todos os membros podem registrar aportes e retiradas. Uma retirada maior que o total da Caixinha não é aceita. Se o Administrador sair da Caixinha, o membro mais antigo passa a ser o Administrador.',
                    },
                    {
                        type: 'paragraph',
                        text: 'Ao entrar em uma Caixinha, você aceita que os outros membros vejam o seu nome e os aportes e as retiradas que você fizer nela.',
                    },
                ],
            },
            {
                heading: 'Uso Adequado',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Ao usar o MoneyWise, você se compromete a não usar a conta de outra pessoa, não tentar acessar dados de outros usuários, não tentar prejudicar o funcionamento do aplicativo e não usar o aplicativo para atividades ilegais.',
                    },
                ],
            },
            {
                heading: 'Limitações',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'O MoneyWise é uma ferramenta de organização. Ele não é uma consultoria financeira, não recomenda investimentos e não garante que você vai atingir suas metas. As decisões sobre o seu dinheiro continuam sendo suas.',
                    },
                ],
            },
            {
                heading: 'Encerramento da Conta',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Você pode excluir a sua conta a qualquer momento pelo botão de excluir conta, no Perfil do aplicativo. Ao excluir a conta:',
                    },
                    {
                        type: 'list',
                        items: [
                            'Você sai de todas as Caixinhas. Se você for o Administrador e houver outros membros, o membro mais antigo passa a ser o Administrador. Se você for o único membro, a Caixinha é excluída.',
                            'Os aportes e as retiradas que você fez em Caixinhas compartilhadas continuam nelas, sem o seu nome, para que o total juntado pelo grupo não mude.',
                            'Os seus outros dados são apagados, como explicado na Política de Privacidade.',
                        ],
                    },
                ],
            },
            {
                heading: 'Alterações nos Termos',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'A equipe pode atualizar estes Termos. Quando isso acontecer, você recebe um e-mail avisando o que mudou. Se continuar usando o aplicativo depois do aviso, você concorda com a nova versão.',
                    },
                ],
            },
        ],
    },
    privacy: {
        tabLabel: 'Privacidade',
        title: 'Política de Privacidade',
        intro: [
            {
                type: 'paragraph',
                text: 'Esta Política explica quais dados o MoneyWise guarda, para que eles são usados e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).',
            },
        ],
        sections: [
            {
                heading: 'Dados que Guardamos',
                blocks: [
                    {
                        type: 'table',
                        rows: [
                            {
                                label: 'Nome e e-mail',
                                description: 'Identificar a sua conta, confirmar o e-mail e mostrar o seu nome nas Caixinhas',
                            },
                            {
                                label: 'Senha',
                                description: 'Fazer o login. A senha é guardada só como um código criptografado, nunca como texto',
                            },
                            {
                                label: 'Moeda preferida',
                                description: 'Mostrar os valores na moeda escolhida',
                            },
                            {
                                label: 'Receitas, despesas e categorias',
                                description: 'Montar o seu extrato, o saldo e o resumo do mês',
                            },
                            {
                                label: 'Caixinhas, metas, aportes e retiradas',
                                description: 'Fazer as Caixinhas funcionarem e mostrar o progresso das metas',
                            },
                            {
                                label: 'Dados de acesso',
                                description: 'Manter você conectado com segurança, encerrar a sessão quando você sair, confirmar o e-mail e recuperar a senha (códigos enviados por e-mail) e registrar a data do seu último acesso',
                            },
                        ],
                    },
                    {
                        type: 'paragraph',
                        text: 'O MoneyWise não acessa a sua conta bancária, o seu cartão nem a sua localização.',
                    },
                ],
            },
            {
                heading: 'Como Usamos os Dados',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Os dados são usados somente para o funcionamento do aplicativo. O MoneyWise não vende dados, não mostra publicidade e não usa os seus dados para outros fins.',
                    },
                ],
            },
            {
                heading: 'Compartilhamento',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Os outros membros de uma Caixinha veem o seu nome e os aportes e as retiradas que você fez nela. Eles nunca veem o seu saldo pessoal nem as suas receitas e despesas.',
                    },
                    {
                        type: 'paragraph',
                        text: 'Fora disso, nenhum dado é compartilhado com outras pessoas ou empresas, a não ser quando a lei exigir.',
                    },
                ],
            },
            {
                heading: 'Armazenamento e Segurança',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Os dados ficam guardados no servidor do MoneyWise, em um banco de dados, e uma cópia fica no seu celular para que o aplicativo funcione sem internet. A comunicação entre o aplicativo e o servidor é protegida (HTTPS), a senha é criptografada e cada pedido ao servidor só devolve os dados da própria conta.',
                    },
                ],
            },
            {
                heading: 'Por Quanto Tempo Guardamos',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Os dados ficam guardados enquanto a sua conta existir. Quando você exclui a conta, os seus dados pessoais são apagados. Ficam apenas os aportes e as retiradas feitos em Caixinhas compartilhadas, sem o seu nome, como explicado nos Termos de Uso.',
                    },
                ],
            },
            {
                heading: 'Menores de Idade',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Menores de 18 anos só podem usar o MoneyWise com a autorização de um dos pais ou de um responsável legal. O responsável pode pedir a qualquer momento para ver, corrigir ou excluir os dados do menor, pelo contato desta Política.',
                    },
                ],
            },
            {
                heading: 'Seus Direitos',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Pela LGPD, você pode, a qualquer momento:',
                    },
                    {
                        type: 'list',
                        items: [
                            'Saber quais dados o MoneyWise guarda sobre você.',
                            'Corrigir dados errados ou desatualizados.',
                            'Pedir a exclusão dos seus dados, excluindo a conta pelo aplicativo.',
                            'Retirar o seu consentimento, o que também leva à exclusão da conta.',
                        ],
                    },
                ],
            },
            {
                heading: 'Contato',
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'Para dúvidas sobre estes Termos ou sobre os seus dados, escreva para app.moneywise.br@gmail.com.',
                    },
                ],
            },
        ],
    },
};
