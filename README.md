# TCBB Fantasy Tennis

Um site completo de fantasy para o torneio interno de tênis do TCBB, onde os participantes podem fazer palpites nas partidas e competir entre si pelo título de melhor analista.

## 🎾 Funcionalidades

### Sistema de Usuários
- ✅ Cadastro/Login com NextAuth.js
- ✅ Perfil com estatísticas pessoais
- ✅ Ranking geral dos participantes

### Gerenciamento de Jogadores
- ✅ 35 jogadores do torneio
- ✅ Perfil de cada jogador com estatísticas
- ✅ Sistema de favoritos

### Sistema de Palpites Completo
- ✅ **Palpites por Partida:**
  - Vencedor da partida (5 pontos)
  - Placar exato em sets - 2-0, 2-1 (15 pontos)
  - Se vai para 3º set - Sim/Não (8 pontos)
  - Vencedor do 1º set (3 pontos)
  - Se terá tie-break - Sim/Não (5 pontos)
  - Margem de vitória - Apertado/Tranquilo (7 pontos)

- ✅ **Palpites de Torneio:**
  - Campeão (25 pontos)
  - Vice-campeão (15 pontos)
  - Semifinalistas (10 pontos cada)
  - Quartas de final (5 pontos cada)
  - Maior zebra do torneio (12 pontos)
  - Partida mais longa (10 pontos)
  - Jogador com mais aces (8 pontos)
  - Melhor comeback (8 pontos)

### Dashboard e Ranking
- ✅ Dashboard com resumo dos palpites e pontuação atual
- ✅ Ranking em tempo real com posições
- ✅ Estatísticas detalhadas (% acertos, pontos por categoria)
- ✅ Pódio com top 3 participantes

### Chaveamento do Torneio
- ✅ Visualização interativa do chaveamento
- ✅ Acompanhamento dos resultados em tempo real
- ✅ Filtros por fase (1ª rodada, oitavas, quartas, etc.)
- ✅ Progresso visual de cada fase

### Área Administrativa
- ✅ Painel para inserir resultados das partidas
- ✅ Gerenciamento de jogadores e usuários
- ✅ Configuração do torneio
- ✅ Relatórios e estatísticas
- ✅ Exportação de dados

## 🚀 Tecnologias Utilizadas

- **Next.js 14** with App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização responsiva
- **Prisma** como ORM
- **SQLite** para banco de dados
- **NextAuth.js** para autenticação
- **Lucide React** para ícones
- **React Hook Form** para formulários
- **Zod** para validação

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/arthurangelici/tcbb-fantasy.git
cd tcbb-fantasy
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Configure o banco de dados:
```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar migrations
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 👥 Usuários de Teste

Após executar o seed, você terá acesso a:

- **Admin:** admin@tcbb.com / admin123
- **Usuários:** user1@tcbb.com / user1123, user2@tcbb.com / user2123, etc.

## 📱 Características Técnicas

- **Responsivo** - Design mobile-first otimizado
- **PWA Ready** - Pronto para instalação no celular
- **Type Safety** - TypeScript em todo o projeto
- **Modern UI** - Interface limpa e intuitiva
- **Real-time Updates** - Atualização automática de pontuações

## 🎯 Como Usar

### Para Participantes

1. **Cadastre-se** ou faça login
2. **Explore os jogadores** e adicione seus favoritos
3. **Faça palpites** nas partidas disponíveis
4. **Acompanhe o ranking** e sua posição
5. **Veja suas estatísticas** no dashboard

### Para Administradores

1. Acesse `/admin` com conta de administrador
2. **Gerencie partidas** - registre resultados
3. **Monitore usuários** - veja estatísticas
4. **Configure o torneio** - ajuste datas e configurações
5. **Exporte dados** - faça backup dos dados

## 🎮 Sistema de Pontuação

| Tipo de Palpite | Pontos |
|------------------|--------|
| Vencedor da partida | 5 |
| Placar exato | 15 |
| Vai para 3º set | 8 |
| Vencedor do 1º set | 3 |
| Terá tie-break | 5 |
| Margem de vitória | 7 |
| Campeão | 25 |
| Vice-campeão | 15 |
| Semifinalista | 10 |
| Quarterfinalist | 5 |
| Maior zebra | 12 |
| Partida mais longa | 10 |
| Mais aces | 8 |
| Melhor comeback | 8 |

### Bônus Especiais
- **Sequência perfeita:** 5 acertos seguidos (+5 pontos)
- **Dia perfeito:** acertar todos os jogos do dia (+10 pontos)
- **Palpite corajoso:** apostar no azarão (x2 pontos)

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automaticamente

### Outros Provedores

O projeto é compatível com qualquer provedor que suporte Next.js:
- Netlify
- Railway
- Heroku
- Digital Ocean

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema ao banco
npm run db:seed      # Popular banco com dados
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença Apache 2.0. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato:

- Email: admin@tcbb.com
- Website: [TCBB Fantasy](https://tcbb-fantasy.vercel.app)

---

**TCBB Fantasy Tennis** - Transformando palpites em diversão! 🎾🏆
