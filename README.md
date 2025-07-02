# 🎾 TCBB Fantasy Tennis

Uma plataforma completa de fantasy sports para o torneio interno de tênis do TCBB, onde os participantes podem fazer palpites detalhados nas partidas e competir entre si pelo título de melhor analista de tênis.

## 📋 Visão Geral

O TCBB Fantasy Tennis é um sistema de apostas esportivas virtuais onde os usuários fazem previsões sobre partidas de tênis em diferentes categorias e ganham pontos baseados na precisão dos seus palpites. A plataforma oferece múltiplas formas de pontuação, desde palpites básicos até previsões detalhadas de placares.

## 🎯 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- ✅ Cadastro e login seguro com NextAuth.js
- ✅ Perfil personalizado com estatísticas detalhadas
- ✅ Sistema de permissões (Usuário/Administrador)

### 👥 Gerenciamento de Jogadores
- ✅ Base de dados com 35+ jogadores do torneio
- ✅ Perfis detalhados com ranking e categoria
- ✅ Sistema de nacionalidade e informações pessoais
- ✅ Organização por categorias (A, B, C, ATP, Ranking TCBB)

### 🎮 Sistema de Palpites por Partida
O sistema permite fazer três tipos de palpites para cada partida:

#### 🏆 **Vencedor da Partida (5 pontos)**
- Escolha entre Player 1 ou Player 2
- Pontuação básica garantida para acertos simples

#### 📊 **Placar Detalhado dos Sets (15 pontos)**
- Previsão exata do placar de cada set
- Inclui previsão de tiebreaks quando aplicável
- Formatação: 6-4, 7-6 (10-8), etc.
- **Atenção**: Só pontua se acertar EXATAMENTE todos os sets e tiebreaks

#### 🥇 **Vencedor do Primeiro Set (3 pontos)**
- Palpite específico sobre quem ganha o primeiro set
- Pontuação independente do resultado final da partida

### 🏆 Sistema de Palpites de Torneio
Apostas especiais sobre o desempenho geral dos jogadores:

- **Campeão de Categoria**: Quem será o campeão de cada categoria
- **Vice-campeão**: Quem chegará à final mas não ganhará
- **Semifinalistas**: Jogadores que alcançarão as semifinais
- **Outros palpites especiais**: Maior zebra, partida mais longa, etc.

### 📊 Dashboard e Ranking
- ✅ Dashboard personalizado com estatísticas do usuário
- ✅ Ranking geral em tempo real
- ✅ Estatísticas detalhadas por categoria
- ✅ Taxa de acerto e histórico de pontuação
- ✅ Pódio visual com os top 3 participantes

### 🎪 Visualização do Torneio
- ✅ Chaveamento interativo e dinâmico
- ✅ Acompanhamento de resultados em tempo real
- ✅ Filtros por categoria e fase do torneio
- ✅ Progresso visual de cada eliminatória

### ⚙️ Painel Administrativo
- ✅ Interface para inserção de resultados
- ✅ Gerenciamento completo de jogadores
- ✅ Configuração de torneios e categorias
- ✅ Sistema de debug para recálculo de pontos
- ✅ Relatórios e estatísticas administrativas

## 🚀 Tecnologias e Arquitetura

### 💻 **Stack Tecnológico**
- **Frontend**: Next.js 14 com App Router
- **Linguagem**: TypeScript para type safety completo
- **Estilização**: Tailwind CSS para design responsivo
- **Banco de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento) 
- **ORM**: Prisma para gerenciamento de dados
- **Autenticação**: NextAuth.js com estratégias múltiplas
- **Validação**: Zod para validação de schemas
- **Formulários**: React Hook Form para UX otimizada
- **Ícones**: Lucide React
- **Gráficos**: Recharts para visualizações

### 🏗️ **Arquitetura**
- **Pattern**: Full-stack com API Routes
- **Database-first**: Schema Prisma como fonte da verdade
- **Type-safe**: TypeScript end-to-end
- **Component-based**: React com componentes reutilizáveis
- **Responsive**: Mobile-first design

## 🏆 Categorias do Torneio

O TCBB Fantasy Tennis abrange múltiplas categorias de competição:

### 🎾 **Categorias Principais**
- **Categoria A**: Jogadores de alto nível
- **Categoria B**: Jogadores de nível intermediário  
- **Categoria C**: Jogadores de nível iniciante
- **ATP**: Categoria especial com formato diferenciado
- **Ranking TCBB**: Sistema de pontuação corrida (9 rodadas)

### 📊 **Estrutura dos Torneios**
- **Categorias A, B, C**: Formato eliminatório tradicional
  - Primeira rodada → Oitavas → Quartas → Semifinais → Final
- **ATP**: Formato especial
- **Ranking TCBB**: 9 rodadas consecutivas com pontuação acumulativa

### 🎯 **Como Participar**
1. Faça palpites em qualquer categoria
2. Suas pontuações de todas as categorias são somadas
3. O ranking final é geral (não por categoria)
4. Estratégia: diversifique seus palpites entre categorias

## 📦 Instalação e Configuração

### ✅ **Pré-requisitos**
- **Node.js** 18+ (recomendado: versão LTS mais recente)
- **npm** ou **yarn** como gerenciador de pacotes
- **PostgreSQL** (produção) ou **SQLite** (desenvolvimento)

### 🚀 **Instalação Passo a Passo**

#### 1️⃣ **Clone o Repositório**
```bash
git clone https://github.com/arthurangelici/tcbb-fantasy.git
cd tcbb-fantasy
```

#### 2️⃣ **Instale as Dependências**
```bash
npm install
# ou
yarn install
```

#### 3️⃣ **Configure as Variáveis de Ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/tcbb_fantasy"
# Para desenvolvimento local, use SQLite:
# DATABASE_URL="file:./dev.db"

# Autenticação NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura-aqui"

# Opcional: Configurações adicionais
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4️⃣ **Configure o Banco de Dados**
```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar o schema ao banco
npm run db:push

# Popular com dados de exemplo (opcional)
npm run db:seed
```

#### 5️⃣ **Execute o Servidor**
```bash
npm run dev
```

🎉 **Sucesso!** Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### 🔑 **Usuários de Teste** (após executar seed)

Após executar `npm run db:seed`, você terá acesso a:

- **👨‍💼 Admin**: `admin@tcbb.com` / `admin123`
- **👤 Usuários**: `user1@tcbb.com` / `user1123`, `user2@tcbb.com` / `user2123`, etc.

### ⚙️ **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build otimizado para produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Verificação de código com ESLint |
| `npm run db:generate` | Regenerar cliente Prisma após mudanças no schema |
| `npm run db:push` | Aplicar mudanças do schema ao banco |
| `npm run db:seed` | Popular banco com dados de exemplo |

## 🎯 Guia de Uso Completo

### 👤 **Para Participantes**

#### 1️⃣ **Primeiros Passos**
1. **Cadastre-se** na plataforma ou faça login
2. **Complete seu perfil** com informações básicas
3. **Explore a interface** e familiarize-se com os menus

#### 2️⃣ **Fazendo Palpites**
1. **Acesse "Fazer Palpites"** no menu principal
2. **Escolha a categoria** que deseja apostar
3. **Para cada partida disponível**:
   - Selecione o **vencedor** (5 pontos garantidos)
   - Opcionalmente, preveja o **placar detalhado** (15 pontos extras)
   - Escolha o **vencedor do 1º set** (3 pontos extras)
4. **Salve seus palpites** antes do início da partida

#### 3️⃣ **Acompanhando Performance**
1. **Dashboard**: Veja suas estatísticas gerais
2. **Ranking**: Compare sua posição com outros participantes
3. **Histórico**: Revise seus palpites anteriores
4. **Estatísticas**: Analise sua taxa de acerto por categoria

#### 4️⃣ **Estratégias Recomendadas**
- 🎯 **Conservadora**: Foque apenas no vencedor (5 pontos seguros)
- 📊 **Equilibrada**: Vencedor + 1º set (8 pontos médios)  
- 🎲 **Arriscada**: Tente o placar exato para 23 pontos máximos
- 🌐 **Diversificada**: Aposte em múltiplas categorias

### 👨‍💼 **Para Administradores**

#### 1️⃣ **Acesso Administrativo**
1. Faça login com conta de administrador
2. Acesse `/admin` na URL ou use o menu admin

#### 2️⃣ **Gerenciamento de Partidas**
1. **Criar partidas**: Configure jogadores, horários e categorias
2. **Atualizar resultados**: Insira placares quando partidas terminarem
3. **Monitorar status**: Acompanhe partidas agendadas/finalizadas

#### 3️⃣ **Sistema de Pontuação**
- ⚡ **Automático**: Pontos calculados automaticamente ao inserir resultados
- 🔧 **Debug**: Use `/api/debug/points` para verificar estado
- 🔄 **Recálculo**: Use `/api/debug/recalculate-points` se necessário

#### 4️⃣ **Relatórios e Estatísticas**
1. **Ranking geral**: Monitore liderança
2. **Estatísticas por usuário**: Veja performance individual
3. **Dados do torneio**: Acompanhe progresso das competições

## 🎮 Sistema de Pontuação Detalhado

### 📊 Pontuação por Partida

| Tipo de Palpite | Pontos | Descrição |
|------------------|--------|-----------|
| **Vencedor da Partida** | **5 pontos** | Acertar qual jogador vencerá a partida |
| **Placar Exato dos Sets** | **15 pontos** | Acertar o placar exato de TODOS os sets, incluindo tiebreaks |
| **Vencedor do 1º Set** | **3 pontos** | Acertar quem ganha especificamente o primeiro set |

### 🏆 Pontuação Máxima
- **Por partida**: 23 pontos (5 + 15 + 3)
- **Estratégia**: Quanto mais específico e preciso o palpite, maior a pontuação

### ⚠️ Regras Importantes de Pontuação

#### 🎯 **Vencedor da Partida (5 pontos)**
- ✅ Simples: escolha Player 1 ou Player 2
- ✅ Pontua independentemente do placar
- ✅ Base segura para garantir pontos

#### 📈 **Placar Exato dos Sets (15 pontos)**
- ⚠️ **ATENÇÃO**: Só pontua se acertar TUDO perfeitamente
- ✅ Deve acertar o placar de cada set: 6-4, 7-5, etc.
- ✅ Deve acertar tiebreaks quando houver: 7-6 (10-8)
- ✅ Deve acertar a quantidade correta de sets (2 ou 3 sets)
- ❌ Se errar qualquer detalhe, não pontua

#### 🥇 **Primeiro Set (3 pontos)**
- ✅ Independente do resultado final da partida
- ✅ Pontua mesmo se o jogador perder a partida
- ✅ Complementa a estratégia de pontuação

### 📋 **Exemplos Práticos**

#### Exemplo 1: Palpite Conservador
```
Palpite: Player 1 vence, 1º set Player 1
Resultado: Player 1 vence 6-4, 6-3
Pontos: 5 (vencedor) + 3 (1º set) = 8 pontos
```

#### Exemplo 2: Palpite Arriscado
```
Palpite: Player 2 vence 7-6(7-5), 4-6, 6-4, 1º set Player 2  
Resultado: Player 2 vence 7-6(7-5), 4-6, 6-4
Pontos: 5 + 15 + 3 = 23 pontos (pontuação máxima!)
```

#### Exemplo 3: Palpite Parcialmente Correto
```
Palpite: Player 1 vence 6-4, 6-2, 1º set Player 1
Resultado: Player 1 vence 6-4, 7-5  
Pontos: 5 (vencedor) + 3 (1º set) = 8 pontos
(Não pontua os 15 pontos pois o 2º set foi 7-5, não 6-2)
```

## 🚀 Deploy e Produção

### ⭐ **Vercel (Recomendado)**

O TCBB Fantasy foi otimizado para deploy no Vercel:

1. **Conecte o repositório** no painel do Vercel
2. **Configure variáveis de ambiente**:
   ```env
   DATABASE_URL="sua-url-postgresql"
   NEXTAUTH_URL="https://seu-dominio.vercel.app"
   NEXTAUTH_SECRET="sua-chave-super-secreta"
   ```
3. **Deploy automático** a cada push na branch main

### 🌐 **Outros Provedores**

A aplicação é compatível com qualquer provedor que suporte Next.js:

- **Netlify**: Funciona com adaptações
- **Railway**: Excelente para PostgreSQL integrado
- **Heroku**: Deploy tradicional
- **Digital Ocean**: App Platform
- **AWS**: Amplify ou EC2

### 📊 **Requisitos de Produção**
- **Banco**: PostgreSQL (recomendado) ou MySQL
- **Node.js**: Versão 18+
- **Variáveis**: Configurar todas as env vars necessárias
- **HTTPS**: Essencial para NextAuth funcionar

## 🔧 Troubleshooting e Debug

### 🐛 **Problemas Comuns**

#### **Pontos não calculando**
```bash
# Verifique estado atual
GET /api/debug/points

# Recalcule pontos se necessário  
POST /api/debug/recalculate-points
```

#### **Erro de autenticação**
- Verifique `NEXTAUTH_SECRET` no .env
- Confirme `NEXTAUTH_URL` correto
- Limpe cookies do navegador

#### **Banco de dados**
```bash
# Resetar banco (CUIDADO: apaga dados)
npm run db:push --force-reset

# Recriar com dados de exemplo
npm run db:seed
```

### 📋 **Logs e Monitoramento**
- Logs detalhados no console durante desenvolvimento
- Sistema de debug integrado para administradores
- Validação automática de dados críticos

## 🤝 Contribuição e Desenvolvimento

### 🔄 **Como Contribuir**

1. **Fork** o projeto no GitHub
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
4. **Faça suas alterações** seguindo os padrões do projeto
5. **Teste localmente** antes de submeter
6. **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: adiciona nova funcionalidade'
   ```
7. **Push** para sua branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
8. **Abra um Pull Request** descrevendo suas alterações

### 📏 **Padrões do Projeto**
- **TypeScript**: Tipagem rigorosa obrigatória
- **ESLint**: Siga as regras configuradas
- **Prisma**: Use migrations para mudanças no banco
- **Components**: Crie componentes reutilizáveis
- **API Routes**: Mantenha consistência nas rotas

### 🧪 **Antes de Submeter**
```bash
# Verificar código
npm run lint

# Testar build
npm run build

# Testar localmente
npm run dev
```

## 📄 Licença

Este projeto está sob a **Licença Apache 2.0**. 

Consulte o arquivo [LICENSE](LICENSE) para mais detalhes sobre direitos e limitações.

## 📞 Suporte e Contato

### 🆘 **Precisa de Ajuda?**

- **🐛 Bugs**: Abra uma [issue no GitHub](https://github.com/arthurangelici/tcbb-fantasy/issues)
- **💡 Sugestões**: Use as discussions do GitHub
- **📧 Email**: admin@tcbb.com
- **🌐 Website**: [TCBB Fantasy](https://tcbb-fantasy.vercel.app)

### 📊 **Status do Projeto**
- ✅ **Ativo**: Em desenvolvimento constante
- 🚀 **Produção**: Funcionando com usuários reais
- 📈 **Melhorias**: Sempre adicionando novas funcionalidades

---

## 🏆 Sobre o TCBB Fantasy Tennis

**Desenvolvido com ❤️ para a comunidade de tênis do TCBB**

Uma plataforma moderna que combina a paixão pelo tênis com a emoção das apostas esportivas virtuais, criando uma experiência única de engagement para torneios internos.

### 🎯 **Missão**
Transformar a experiência de acompanhar torneios de tênis, permitindo que todos os participantes se sintam parte da ação através de palpites inteligentes e competição saudável.

### 💪 **Valores**
- **Transparência**: Sistema de pontuação claro e aberto
- **Fairness**: Todos competem em igualdade de condições  
- **Diversão**: O foco está na experiência positiva
- **Comunidade**: Fortalecendo laços entre jogadores e torcedores

---

**🎾 TCBB Fantasy Tennis - Onde cada palpite conta! 🏆**
