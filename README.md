# Copy2HTML

Copy2HTML é uma ferramenta pública e client-side para transformar copy do Word em HTML limpo, previsível e pronto para colar diretamente em módulos Liferay.

## Fluxo principal

`Word → Ctrl+C → Copy2HTML → Ctrl+V → ajustes → Copiar para Liferay → módulo Liferay`

VS Code é opcional e não faz parte do fluxo necessário de publicação.

## O que a v0.1 faz

- editor visual com Tiptap;
- limpeza determinística do HTML copiado do Word;
- preservação de ênfases e links suportados;
- HTML Liferay sincronizado em tempo real;
- preview isolado do HTML sanitizado;
- validação com estados válido, aviso e bloqueado;
- presets oficiais versionados;
- pack Smiles ativo por padrão;
- presets pessoais armazenados apenas no `localStorage` do navegador;
- cópia final do HTML sanitizado para o clipboard.

## Privacidade

A copy é processada no navegador. A v0.1 não possui backend, banco de dados ou autenticação e não precisa enviar o conteúdo editado para um servidor do Copy2HTML.

O fluxo de dados esperado é:

```text
Word
  ↓
Clipboard do navegador
  ↓
Copy2HTML (client-side)
  ↓
Clipboard do navegador
  ↓
Liferay
```

Nunca adicione ao repositório ou aos preset packs credenciais, senhas, dados de VPN, tokens, segredos operacionais ou conteúdo sensível de arquivos históricos.

## Preset packs

O core da aplicação é genérico. Packs oficiais ficam em `src/preset-packs/` e apenas descrevem presets e snippets suportados.

Atualmente:

- `base`: formatações HTML genéricas;
- `smiles`: primeiro pack oficial e default da v0.1.

Dados Smiles não devem ser importados para editor, serializer, sanitizer, validator ou clipboard core.

Snippets históricos marcados como `reviewBeforeUse` exigem confirmação antes de serem inseridos.

## Desenvolvimento local

Requer Node.js 22+.

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Qualidade

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

O E2E principal cobre o caminho Word → Smiles presets → HTML validado → clipboard para Liferay.

## Estrutura principal

```text
src/
├── app/
├── core/
│   ├── clipboard/
│   ├── presets/
│   ├── sanitizer/
│   ├── serializer/
│   └── validator/
├── features/
│   ├── editor/
│   ├── html-output/
│   ├── presets/
│   ├── preview/
│   └── workspace/
└── preset-packs/
    ├── base/
    └── smiles/
```

## Escopo futuro

Importação direta de DOCX, sugestões determinísticas, novos packs e outros formatos de saída ficam fora da v0.1 e devem ser tratados como evolução separada.
