# 🌿 Sistema PMAA – Barcarena/PA

Sistema web de gestão do **Programa Municipal de Aquisição de Alimentos (PMAA)**, modelado a partir do programa da Prefeitura de Barcarena – PA.

> **Status:** Projeto acadêmico. Desenvolvido como Trabalho de Conclusão de Curso em Engenharia de Software (UNINTER), sobre um domínio real da administração pública municipal. Não está implantado em produção.

**Por que este domínio:** o PMAA compra alimentos da agricultura familiar e os redistribui a entidades socioassistenciais. O controle costuma ser feito em papel e planilha, o que torna lento o pagamento ao agricultor e frágil a rastreabilidade da entrega. O sistema ataca esses dois pontos.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 + Spring Boot 3.2 |
| Persistência | Spring Data JPA (Hibernate) + PostgreSQL |
| Segurança | Spring Security + JWT |
| Frontend | HTML5, CSS3, JavaScript puro (servido pelo próprio Spring) |
| Build | Maven |

## Funcionalidades

- ✅ Login com autenticação JWT e papéis (Funcionário / Administrador)
- ✅ Cadastro de agricultores familiares (CPF, DAP, endereço, validade)
- ✅ Cadastro de produtos com preço por kg
- ✅ Cadastro de entidades beneficiárias (público atendido, refeições)
- ✅ Registro de entregas de agricultores (múltiplos itens, preço automático)
- ✅ Registro de entregas de cestas às entidades
- ✅ Comprovantes imprimíveis (entrega, cesta e pagamento)
- ✅ Geração de pagamento mensal consolidado (apenas Administrador)
- ✅ Gestão de funcionários com controle de acesso (apenas Administrador)
- ✅ Dashboard com indicadores do mês

---

## 🚀 Como executar localmente

### 1. Pré-requisitos

Instale (se ainda não tiver):

| Programa | Onde baixar | Verificar instalação |
|---|---|---|
| **Java 17 (JDK)** | https://adoptium.net (Temurin 17 LTS) | `java -version` |
| **Maven 3.8+** | https://maven.apache.org/download.cgi | `mvn -version` |
| **PostgreSQL 14+** | https://www.postgresql.org/download | `psql --version` |

> 💡 No Windows, o instalador do PostgreSQL pede uma senha para o usuário `postgres` durante a instalação — anote essa senha.

### 2. Criar o banco de dados

Abra o terminal do PostgreSQL (`psql` ou pgAdmin) e execute:

```sql
CREATE DATABASE pmaa;
```

As tabelas são criadas automaticamente pelo Hibernate na primeira execução (`ddl-auto=update`).

### 3. Configurar a conexão

As credenciais e a chave JWT vêm de **variáveis de ambiente** — nada sensível é versionado.

Copie o arquivo de exemplo e preencha com seus valores locais:

```bash
cp .env.example .env
```

```env
DB_URL=jdbc:postgresql://localhost:5432/pmaa
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_do_postgres
JWT_SECRET=gere-uma-chave-aleatoria-longa-aqui
```

> Para gerar uma chave JWT segura: `openssl rand -base64 48`

Se você não definir nada, o `application.properties` cai em valores padrão de desenvolvimento e o sistema roda mesmo assim — mas **nunca** use esses padrões fora da sua máquina.

### 4. Executar

Na pasta raiz do projeto (onde está o `pom.xml`):

```bash
mvn spring-boot:run
```

> ⏳ A **primeira execução demora alguns minutos** — o Maven baixa todas as dependências. Nas próximas será rápido.

Quando aparecer `Started PmaaApplication`, o sistema está no ar.

### 5. Acessar

Abra o navegador em:

```
http://localhost:8080
```

**Login inicial (criado automaticamente):**

| Login | Senha |
|---|---|
| `admin` | `admin123` |

> 🔐 **Importante:** após o primeiro acesso, crie seu próprio usuário administrador em **Funcionários** e desative ou troque a senha do usuário padrão antes de qualquer uso real.

### 6. Fluxo de teste sugerido

1. **Produtos** → cadastre 2–3 produtos (ex: Farinha de mandioca – R$ 8,00/kg)
2. **Agricultores** → cadastre um agricultor com CPF e DAP
3. **Entregas Agricultores** → registre uma entrega com itens
4. Imprima o **comprovante** da entrega (🖨️)
5. **Beneficiários** → cadastre uma entidade
6. **Entregas Cestas** → registre a distribuição de uma cesta
7. **Pagamentos** → gere o pagamento do mês do agricultor
8. **Funcionários** → crie um usuário sem permissão de admin e teste o acesso restrito

---

## 📁 Estrutura do projeto

```
pmaa/
├── pom.xml
├── src/main/java/com/barcarena/pmaa/
│   ├── PmaaApplication.java
│   ├── config/          # Segurança e inicialização de dados
│   ├── controller/      # Endpoints REST
│   ├── exception/       # Tratamento global de erros
│   ├── model/           # Entidades JPA (+ enums)
│   ├── repository/      # Interfaces Spring Data
│   ├── security/        # JWT (geração e filtro)
│   └── service/         # Regras de negócio
└── src/main/resources/
    ├── application.properties
    └── static/          # Frontend (HTML/CSS/JS)
```

## 🌐 API REST (principais endpoints)

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `/api/auth/login` | Público |
| GET/POST/PUT/DELETE | `/api/agricultores` | Autenticado |
| GET/POST/PUT/DELETE | `/api/produtos` | Autenticado |
| GET/POST/PUT/DELETE | `/api/beneficiarios` | Autenticado |
| GET/POST | `/api/entregas-agricultor` | Autenticado |
| GET/POST | `/api/entregas-cesta` | Autenticado |
| GET / POST `/gerar` | `/api/pagamentos` | **Admin** |
| GET/POST/PUT | `/api/funcionarios` | **Admin** |

## ☁️ Próximos passos (evolução prevista no TCC)

- Otimização de rotas de distribuição (integração com APIs de mapas)
- Deploy em nuvem (Railway / Render) com PostgreSQL gerenciado
- Relatórios gerenciais em PDF
- Autenticação de dois fatores
