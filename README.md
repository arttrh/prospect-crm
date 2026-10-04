# Prospect CRM

CRM privado e multicanal para organizar leads vindos do Google Maps via datasets do Apify.

## O que já existe

- Kanban arrastável com status: Novo, Enviado, Follow-up, Respondeu, Site enviado, Reunião, Fechado e Desqualificado.
- Interface responsiva construída com Radix UI.
- Importação de dataset existente do Apify sem executar um novo Actor.
- Filtro obrigatório: só persiste leads com WhatsApp provável, e-mail ou Instagram.
- Filtros por status, segmento, canal e busca.
- Abordagem manual por WhatsApp, e-mail e Instagram; nenhuma mensagem é enviada automaticamente.
- Geração opcional de texto com Gemini Flash no backend.
- Adaptador Oracle Cloud e ponte temporária para Supabase.
- Login por senha com cookie HttpOnly assinado.

O projeto foi inspirado em conceitos de funil, follow-up e Kanban do [ProspectOS](https://github.com/nando0x/ProspectOS), distribuído sob licença MIT. O código deste repositório foi implementado separadamente para a arquitetura Vercel/Oracle.

## Execução local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Sem variáveis de banco, o ambiente local usa dois leads de demonstração. Em produção, `CRM_ACCESS_PASSWORD` e `SESSION_SECRET` são obrigatórios.

## Oracle Cloud

1. Crie um Autonomous AI Database.
2. Execute `oracle/schema.sql` no Database Actions/SQL Developer.
3. Configure na Vercel `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING` e, quando necessário, as variáveis do wallet.
4. Não envie wallet, senhas ou chaves para o GitHub.

O schema guarda somente informações de leads e o histórico vinculado a cada lead. Há uma constraint que rejeita empresas sem WhatsApp, e-mail ou Instagram.

## Integrações

- `APIFY_TOKEN`: opcional para datasets privados. A rota devolve apenas o resumo da importação; o dataset bruto não é exposto ao navegador.
- `GEMINI_API_KEY`: chave somente de backend. O Gemini personaliza a mensagem com dados já coletados; não raspa o Google Maps.
- `GEMINI_MODEL`: configurável; padrão `gemini-2.5-flash`.

## Verificação

```bash
npm run lint
npm run build
npm test
```

Os testes Playwright cobrem desktop e viewport móvel. O workflow do GitHub executa lint, build e testes em cada push.

## Segurança de prospecção

O CRM não valida números abrindo conversas, não envia em massa e não automatiza WhatsApp Web. Os botões apenas abrem o canal escolhido com a mensagem preparada para revisão humana.
