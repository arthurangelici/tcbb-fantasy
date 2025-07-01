# Instruções para Administrador - Sistema de Pontos

## Problema Identificado
O sistema de pontos não estava funcionando devido a uma validação faltante no processo de atualização de resultados de partidas.

## Correção Implementada
- Adicionada validação rigorosa para o campo "vencedor" nas atualizações de partidas
- O vencedor deve ser obrigatoriamente 'PLAYER1' ou 'PLAYER2'
- Corrigido bug que permitia valores nulos/inválidos no vencedor

## Ferramentas de Debug (Apenas para Admin)

### 1. Verificar Estado dos Dados
**Endpoint:** `GET /api/debug/points`
**Descrição:** Mostra estatísticas sobre:
- Total de usuários, partidas e previsões
- Quantas partidas foram finalizadas
- Quantas previsões têm pontos > 0
- Exemplos de dados para análise

### 2. Recalcular Pontos
**Endpoint:** `POST /api/debug/recalculate-points`
**Descrição:** Recalcula pontos para todas as partidas já finalizadas
**Uso recomendado:** Execute uma vez para corrigir partidas antigas que podem não ter pontos calculados

## Como Usar

1. **Primeiro, verifique o estado atual:**
   ```
   Acesse: GET /api/debug/points
   ```

2. **Se houver partidas finalizadas mas sem pontos, recalcule:**
   ```
   Envie POST para: /api/debug/recalculate-points
   ```

3. **Verifique novamente o estado para confirmar a correção:**
   ```
   Acesse: GET /api/debug/points
   ```

## Funcionamento Futuro
- Todas as novas atualizações de resultados de partidas irão calcular pontos automaticamente
- A validação agora garante que o vencedor seja sempre especificado corretamente
- O ranking será atualizado imediatamente após cada atualização de partida

## Pontuação por Previsão
- **Vencedor correto:** 5 pontos
- **Placar exato de todos os sets:** 15 pontos  
- **Vencedor do primeiro set:** 3 pontos
- **Total máximo por partida:** 23 pontos