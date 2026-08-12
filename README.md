# 🧮 Calculadora de Jornada de Trabalho — União Supermercados

Sistema web leve, moderno e rápido desenvolvido sob medida para o **União Supermercados**, substituindo o controle manual por planilhas Excel (`CALCULADORA - SOMA DE HORAS.xlsx` e `CALCULADORA - SOMA DE HORAS - 7-20.xlsx`) por uma aplicação intuitiva de apuração de horas trabalhadas e saldo diário.

---

## 📌 Visão Geral do Projeto

* **Empresa:** União Supermercados (CNPJ: 08.892.383/0001-61)
* **Objetivo:** Calcular o saldo diário de horas trabalhadas (Horas Extras, Débito de Horas ou Jornada Completa) com suporte aos modelos de 4 e 6 batidas de ponto.
* **Repositório GitHub:** [https://github.com/YANLUCCA0205/Calculadora-de-Horas-Extras](https://github.com/YANLUCCA0205/Calculadora-de-Horas-Extras.git)
* **Stack Tecnológico:** React 18, TypeScript, Vite, Vanilla CSS e Lucide React.

---

## 🎨 Identidade Visual e Ativos

* **Cores da Marca:**
  * Azul União: `#003B71`
  * Vermelho União: `#E52E2D`
  * Fundo da Aplicação: `#F8FAFC`
* **Logotipo do Topo:** `UNIÃO LOGO NOVO - HORIZONTAL COLORIDO` (`public/assets/logo_horizontal_oficial.png`).
* **Favicon da Aba:** Ícone do Coração Oficial (`public/assets/coracao.png`).
* **Tipografia:** Google Fonts — *Montserrat* (pesos 400, 600, 700, 800).

---

## ⚙️ Funcionalidades e Regras de Negócio

### 1. Jornadas Previstas
* **07:20 diárias (Selecionada por padrão):** Carga horária padrão do setor operacional de supermercados (44h semanais em escala 6x1).
* **08:00 diárias:** Carga horária padrão para expediente administrativo de 8 horas.
* **Personalizada:** Permite que o operador informe qualquer carga horária diária específica no formato `HH:MM`.

### 2. Modelos de Batidas de Ponto
* **4 Batidas (Padrão):** Entrada 1 (`e1`), Saída 1 (`s1`), Entrada 2 (`e2`), Saída 2 (`s2`).
* **6 Batidas:** Entrada 1 (`e1`), Saída 1 (`s1`), Entrada 2 (`e2`), Saída 2 (`s2`), Entrada 3 (`e3`), Saída 3 (`s3`).

### 3. Formatação dos Resultados
* **Substituição de Rótulos:** O antigo cabeçalho "SALDO APURADO" é dinamicamente alterado para **`HORAS EXTRAS`** (quando o saldo for positivo) ou **`HORAS FALTAS`** (quando o saldo for negativo).
* **Resultado por Extenso:** Exibe o tempo amigável em português (ex: `50 Minutos`, `1 Hora`, `1 Hora e 10 Minutos`, `Jornada Completa`).
* **Sinalizador Digital:** Exibe o formato em relógio digital (ex: `(+01:10)`, `(-00:50)`).

---

## ⚖️ Validações e Conformidade Trabalhista (CLT)

A calculadora possui validações de preenchimento, coerência e alertas de conformidade legal com a Consolidação das Leis do Trabalho (CLT):

### 🚫 Validações Bloqueantes (Impedem o Cálculo em Caso de Erro de Digitação)
1. **Preenchimento Completo:** Valida se todos os campos correspondentes ao modelo selecionado (4 ou 6 batidas) foram informados.
2. **Formato do Horário:** Valida se todas as horas foram inseridas no padrão válido `HH:MM` (00:00 às 23:59).
3. **Coerência Cronológica:** Bloqueia batidas fora de ordem (ex: Saída 1 anterior à Entrada 1 ou Entrada 2 anterior à Saída 1).

### ⚠️ Painel de Alertas de Infrações da CLT (Não Bloqueiam a Apuração do Saldo Total)
1. **Art. 59 da CLT (Limite de Horas Extras):** Se o saldo de horas extras ultrapassar 2 horas no dia (jornada total > 10h), o sistema apura o valor total de horas extras normalmente e exibe um alerta de infração do Art. 59 no painel de resultados.
2. **Art. 66 da CLT (Descanso Interjornada):** Permite informar a *Saída do Expediente Anterior* para validar se o colaborador cumpriu o descanso mínimo obrigatório de **11 horas consecutivas** antes do novo expediente.
3. **Art. 71 da CLT (Intervalo para Refeição e Almoço):**
   * Exige intervalo mínimo de **1 hora (60 minutos)** de almoço para jornadas superiores a 6 horas.
   * Emite alerta se qualquer turno contínuo ultrapassar **6 horas seguidas** de trabalho sem intervalo.
4. **Art. 73 da CLT (Adicional Noturno):** Mapeia automaticamente o trabalho realizado entre **22:00 e 05:00**, emitindo um aviso no painel informando a incidência de Adicional Noturno (mínimo de 20%) e hora reduzida noturna (52m30s).

---

## 📁 Estrutura de Arquivos da Aplicação

```
Calculadora-de-Horas-Extras/
├── index.html                                # HTML principal com Favicon coracao.png
├── package.json                              # Configuração de dependências e scripts
├── tsconfig.json                             # Configuração do TypeScript
├── vite.config.ts                            # Configuração do Vite
├── CALCULADORA - SOMA DE HORAS.xlsx          # Planilha oficial de referência (8h/7h20)
├── CALCULADORA - SOMA DE HORAS - 7-20.xlsx   # Planilha oficial de referência (7h20)
├── MANUAL DE MARCA.pdf                       # Manual oficial de marca do União Supermercados
├── public/
│   └── assets/
│       ├── logo_horizontal_oficial.png       # Logotipo Horizontal Oficial em alta resolução
│       └── coracao.png                       # Ícone Favicon do coração transparente
└── src/
    ├── main.tsx                              # Ponto de entrada do React
    ├── App.tsx                               # Interface da Calculadora e manipuladores
    ├── index.css                             # Design System (Variáveis HSL, botões, inputs)
    ├── types/
    │   └── index.ts                          # Tipagens TypeScript (WorkloadType, CalculationResult, etc.)
    ├── components/
    │   └── StatusBadge.tsx                   # Badge visual de situação (Hora Extra, Débito, Jornada Completa)
    └── services/
        └── workloadCalculator.ts             # Motor de cálculo matemático das jornadas e turnos noturnos
```

---

## 🚀 Como Executar o Projeto Localmente

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/YANLUCCA0205/Calculadora-de-Horas-Extras.git
   cd Calculadora-de-Horas-Extras
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000` (ou porta disponível).

4. **Gerar a versão de produção (Build):**
   ```bash
   npm run build
   ```

---

*União Supermercados — Ferramenta Interna de Controle e Apuração de Jornadas.*
