# Mayer — Futebol Society

Site com reserva online de Fut5/Fut7 e painel de gestão, preparado para revisão privada. A marca e a foto de capa são fictícias; os modelos Blender foram incorporados como imagens e GLBs interativos. Os prompts de geração estão em `ASSETS.md`.

## Funcionalidades

- Agenda independente por campo, em horário de Brasília, com consultas até 90 dias à frente.
- Reservas de 60, 120 ou 180 minutos, com preço calculado no servidor e pagamento no local.
- Registro persistente no banco Cloudflare D1. Ocupação por hora com chave única e operações atômicas, inclusive para reservas semanais.
- Consulta protegida por conta, cancelamento com antecedência configurável e arquivo de calendário `.ics`.
- Administração com agenda diária/semanal, cadastro manual, bloqueios, recorrência até 12 semanas, remarcação, controle de recebimentos e exportação CSV do período selecionado.
- Horários, dias, preços, contatos, imagem da arena e política de cancelamento editáveis.
- Equipe cadastrada por e-mail: funcionários gerenciam reservas e pagamentos; administradores também gerenciam regras e equipe. Histórico de alterações gravado no banco.
- Interface responsiva, navegação por teclado, diálogos nativos e respeito à preferência de movimento reduzido.

## Revisão privada e acesso administrativo

Este Site está publicado com acesso restrito ao proprietário no Sites. A autenticação é gerenciada pela plataforma. No ambiente inicial, `PRIVATE_REVIEW=1` atribui ao primeiro proprietário autenticado o acesso administrativo no banco, protegido por uma chave única.

Antes de mudar a audiência para pública, o proprietário deve acessar o site uma vez, confirmar seu acesso à gestão e remover `PRIVATE_REVIEW` nas variáveis de ambiente do Sites. Depois publique uma versão para aplicar a nova configuração. Essa variável pertence apenas à revisão privada. A lista de equipe passa a controlar o acesso, e clientes consultam exclusivamente as próprias reservas.

O login de teste local é fornecido pelo starter em `/signin-with-chatgpt?return_to=/`. Ele está disponível apenas no desenvolvimento em loopback e não faz parte do build de produção.

## Dados provisórios

Funcionamento inicial: todos os dias, das 08h às 23h. Fut5: R$120/h e R$150/h a partir das 18h. Fut7: R$180/h e R$220/h a partir das 18h. Antecedência mínima: 1 hora. Cancelamento online: 24 horas antes. São valores demonstrativos editáveis, sem promessa de preço real. Endereço e WhatsApp permanecem vazios até serem informados.

O pagamento no local funciona com registro manual de recebimento. Não há cobrança Pix/cartão, envio automático de e-mail ou WhatsApp conectado nesta versão. A confirmação é exibida no site e pode ser adicionada ao calendário. Esses serviços externos exigem escolher e configurar provedores antes de ativá-los.

Reservas pagas não são canceladas automaticamente pelo cliente: ele deve combinar o reembolso com a equipe. O administrador pode cancelar, e o histórico do pagamento fica preservado para conferência.

## Desenvolvimento

Node >=22.13. As dependências seguem o lockfile do starter Sites/Vinext. Execute `npm run install:ci` na primeira instalação. O ambiente Windows utilizado nesta entrega precisou de um shim de npm local, na pasta ignorada `.sites-runtime/bin`, para os helpers Sites; a aplicação não depende dele.

1. Gere migrações com `npm run db:generate` após alterar `db/schema.ts`.
2. Compile com `npm run build` ou com o helper `build-site.mjs` do plugin Sites.
3. Aplique cada migração pendente localmente conforme o README do starter. Não reaplique SQL já executado.
4. Use `npm run dev` para iniciar em `http://127.0.0.1:5173/`.
5. Para revisão administrativa local, crie `.dev.vars` com `PRIVATE_REVIEW="1"`; este arquivo é ignorado pelo Git.

Arquivos principais: `app/components/Mayer.tsx`, `Admin.tsx`, `Team.tsx`, `lib/service.ts`, `lib/domain.ts`, `db/schema.ts`, `app/globals.css`.

## Validação realizada

`node tests/system.mjs` verifica concorrência, sobreposição, isolamento dos campos, remarcação, cancelamento, bloqueio, recorrência, autenticação e rejeição de dados inválidos. Ele usa apenas o banco local de desenvolvimento e cancela as reservas que cria. Os dados locais de teste não são enviados ao banco hospedado.

O fluxo de reserva também foi concluído pelo formulário no navegador. Foram conferidos desktop, celular de 390 px, ausência de rolagem horizontal, erros do navegador e contraste acessível. O teste automático de acessibilidade não encontrou violações WCAG A/AA na página inicial após os ajustes; texto sobre fotos foi revisado visualmente.

## Fotos reais e modelos

Substitua `public/images/mayer-arena.png` quando receber a foto real ou altere a URL nas configurações. Os arquivos `fut5.png`, `fut7.png` e `public/models/*.glb` correspondem aos modelos criados anteriormente. O visualizador carrega model-viewer sob demanda, com alternativa de download caso a conexão externa falhe. As fontes usam Google Fonts e têm fallback local.
