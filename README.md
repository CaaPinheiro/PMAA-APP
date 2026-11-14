# 🌿 Integra PMAA

Software de gestão do **Programa Municipal de Aquisição de Alimentos (PMAA)** da Prefeitura Municipal de Barcarena – PA.

Projeto Final de Curso – Engenharia de Software – UNINTER.

---

## ⚡ Início rápido

**Windows — dê dois cliques em `EXECUTAR-INTEGRA-PMAA.bat`.** Pronto.

Na primeira vez ele prepara o sistema sozinho (alguns minutos, precisa de internet). Depois disso, abre em segundos e o navegador é aberto automaticamente em `http://localhost:8080`.

| Login | Senha |
|---|---|
| `admin` | `admin123` |

> Único requisito: **Java 17** instalado ([adoptium.net](https://adoptium.net)). Se faltar, o próprio script avisa.
> Para **encerrar**, feche a janela preta.
> 🔐 Troque a senha padrão antes de qualquer uso real (menu **Funcionários**).

Linux / Mac: `./iniciar-integra-pmaa.sh`

---

## Requisitos funcionais atendidos

O sistema implementa integralmente o Quadro 1 do artigo:

| ID | Requisito | Onde está no sistema |
|---|---|---|
| **RF01** | Cadastro de agricultores | Menu *Agricultores* — nome, CPF, endereço, e-mail, telefone, nº DAP, validade DAP, **produtos fornecidos** e observações |
| **RF02** | Cadastro de beneficiários | Menu *Beneficiários* — entidade, responsável, contato, endereço, público atendido e refeições ofertadas |
| **RF03** | Cadastro de produtos | Menu *Produtos* — nome e preço por kg |
| **RF04** | Comprovante de entrega de cestas | Menu *Entrega de cestas* → botão 🖨️ (sem valores financeiros) |
| **RF05** | Saldo dos produtos vendidos | Menu *Saldo mensal* — valor a receber **discriminado por produto**, quantidade, preço unitário e total final |
| **RF06** | Comprovante de recebimento | Menu *Recebimentos* → botão 🖨️ (com valores) |
| **RF07** | Controle administrativo | Menu *Funcionários* — conceder, **editar nível de acesso**, redefinir senha e remover acesso |
| **RF08** | Geração de relatórios | Menu *Relatórios* — consolidação mensal, impressão e exportação em PDF |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 + Spring Boot 3.2.5 |
| Persistência | Spring Data JPA (Hibernate) |
| Banco de dados | **H2 embutido** — arquivo local, zero instalação |
| Segurança | Spring Security + JWT (BCrypt para senhas) |
| Frontend | HTML5, CSS3 e JavaScript puro |
| Build | Maven (via Maven Wrapper — não precisa instalar) |

---

## 💾 Banco de dados

O sistema usa **H2 em arquivo**. Na primeira execução cria a pasta `data/` com `integrapmaa.mv.db` — é ali que ficam todos os registros.

- **Backup:** copie a pasta `data/` (ao rodar pelo `.exe`, ela fica dentro de `instalador\Integra PMAA\`)
- **Zerar tudo:** apague a pasta `data/` — o sistema recria vazio, com o usuário `admin` de novo
- **Inspecionar as tabelas:** `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/integrapmaa` · Usuário: `sa` · Senha: em branco

---

## 📦 Gerar o executável (.exe)

**Dê dois cliques em `CRIAR-EXECUTAVEL.bat`.**

Gera `instalador\Integra PMAA\Integra PMAA.exe` com o Java embutido e cria um atalho na Área de Trabalho. A pasta pode ser copiada para **qualquer computador Windows, mesmo sem Java**, e roda com dois cliques.

> Requisito para gerar: **JDK 17** (não apenas o Java comum), pois usa a ferramenta `jpackage`.

| Quero | Faça |
|---|---|
| Rodar sem a janela preta de log | remova a linha `--win-console ^` do script |
| Instalador com atalho no Menu Iniciar | instale o [WiX Toolset v3](https://wixtoolset.org) e troque `--type app-image` por `--type exe` |
| Trocar o ícone | substitua o arquivo `integra-pmaa.ico` |

Apenas o `.jar`: `mvnw.cmd clean package -DskipTests` → `target/integra-pmaa-1.0.0.jar`

---

## 🔒 Regras de negócio implementadas

Além dos cadastros, o sistema aplica regras que protegem a integridade da apuração:

- **Preço congelado na entrega** — cada item guarda o preço praticado no momento do recebimento, de modo que reajustes no catálogo não alteram valores já apurados
- **Período travado após o pagamento** — autorizado o pagamento de um mês, as entregas daquele agricultor no período não podem mais ser incluídas nem excluídas
- **Pagamento único por período** — impedido em banco por restrição de unicidade e validado no serviço
- **Último administrador protegido** — não é possível rebaixar ou desativar a única conta de administrador ativa
- **Autoproteção** — ninguém altera o próprio nível de acesso nem desativa o próprio usuário
- **Exclusão lógica** — agricultores, produtos e entidades saem das listas, mas o histórico permanece íntegro
- **Alerta de DAP vencida** — sinalizado no início e no momento de registrar um recebimento

---

## 📁 Onde editar cada coisa

```
integra-pmaa/
├── EXECUTAR-INTEGRA-PMAA.bat      <- DOIS CLIQUES para rodar
├── CRIAR-EXECUTAVEL.bat           <- DOIS CLIQUES para gerar o .exe
├── integra-pmaa.ico               <- icone do programa
├── pom.xml                        <- dependencias
├── mvnw / mvnw.cmd                <- Maven Wrapper (nao precisa mexer)
├── src/main/java/com/barcarena/integrapmaa/
│   ├── IntegraPmaaApplication.java  <- ponto de entrada
│   ├── model/                       <- entidades JPA (+ enums)
│   ├── dto/                         <- saldos e relatorios
│   ├── repository/                  <- consultas ao banco
│   ├── service/                     <- REGRAS DE NEGOCIO
│   ├── controller/                  <- endpoints REST
│   ├── security/                    <- JWT
│   ├── config/                      <- seguranca, dados iniciais
│   └── exception/                   <- tratamento de erros
└── src/main/resources/
    ├── application.properties       <- banco, porta, JWT
    └── static/                      <- FRONTEND
        ├── index.html               <- telas e menu
        ├── css/app.css              <- cores e layout
        └── js/                      <- um arquivo por modulo
```

| Quero mudar... | Edite |
|---|---|
| Cores do sistema | `static/css/app.css` (variáveis no topo) |
| Um campo do cadastro de agricultor | `model/Agricultor.java` + `js/agricultores.js` |
| Cálculo do saldo mensal | `service/SaldoService.java` |
| Conteúdo dos relatórios | `service/RelatorioService.java` + `js/relatorios.js` |
| Layout de um comprovante | o `js/` do módulo correspondente |
| Porta do sistema | `application.properties` → `server.port` |

> Alterações em `.css`, `.js` e `.html` aparecem recarregando a página (Ctrl+F5). Alterações em `.java` exigem reiniciar o sistema.

---

## 🌐 API REST

| Método | Endpoint | Acesso |
|---|---|---|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/trocar-senha` | Autenticado |
| GET POST PUT DELETE | `/api/agricultores` | Autenticado |
| GET POST PUT DELETE | `/api/produtos` | Autenticado |
| GET POST PUT DELETE | `/api/beneficiarios` | Autenticado |
| GET POST DELETE | `/api/entregas-agricultor` | Autenticado |
| GET POST DELETE | `/api/entregas-cesta` | Autenticado |
| GET | `/api/saldos/agricultor/{id}?mes=&ano=` | Autenticado |
| GET | `/api/relatorios/entregas-agricultores?mes=&ano=` | Autenticado |
| GET | `/api/relatorios/distribuicao-cestas?mes=&ano=` | Autenticado |
| GET POST DELETE | `/api/pagamentos` | **Administrador** |
| GET POST PUT | `/api/funcionarios` | **Administrador** |

---

## 👥 Autoria

Trabalho desenvolvido para a disciplina de Projeto Final de Curso — Engenharia de Software — Centro Universitário Internacional UNINTER.

---

## Se a compilacao falhar com "cannot find symbol: method getX()"

Dezenas de erros do tipo `cannot find symbol` apontando para getters,
setters ou `builder()` nas classes de `model/` significam **uma coisa so**:
o Lombok nao rodou. O codigo esta correto — o que faltou foi o processador
de anotacoes gerar os metodos durante a compilacao.

A partir do **JDK 23** o `javac` deixou de procurar processadores de
anotacao no classpath automaticamente. O `pom.xml` deste projeto ja declara
o Lombok explicitamente em `annotationProcessorPaths`, o que resolve o
problema. Se ainda assim falhar:

1. Rode `java -version` e confira. O projeto foi feito para o **Java 17**.
2. Se voce tem varias versoes instaladas, aponte o build para a 17:
   ```
   set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17...
   ```
3. No IntelliJ, habilite *Settings > Build > Compiler > Annotation
   Processors > Enable annotation processing* e instale o plugin Lombok.

Apague a pasta `target\` antes de tentar de novo.

---

## Atualizei os arquivos e nada mudou

O `EXECUTAR-INTEGRA-PMAA.bat` so compila quando **nao existe** um
`target\integra-pmaa-1.0.0.jar`. Se ja houver um jar antigo ali, ele sobe
o jar antigo e ignora o codigo novo.

Depois de qualquer atualizacao, rode o **RECOMPILAR.bat**. Ele apaga a
compilacao anterior e gera uma nova a partir do codigo atual.

## Erro: Feature not supported "AUTO_SERVER=TRUE && DB_CLOSE_ON_EXIT=FALSE"

O H2 2.x nao aceita essas duas opcoes juntas na URL de conexao. A URL
correta esta no `application.properties`, sem o `AUTO_SERVER`:

```
spring.datasource.url=jdbc:h2:file:./data/integrapmaa;DB_CLOSE_ON_EXIT=FALSE
```

Se o sistema ja tentou subir com a URL antiga, apague tambem a pasta
`data\` antes de recompilar — ela pode conter um banco incompleto.

---

# Seguranca: onde ficam as senhas

## Como as senhas sao guardadas

As senhas **nao sao guardadas**. O que fica no banco e um hash BCrypt,
gerado pelo `BCryptPasswordEncoder` do Spring Security. BCrypt e um
algoritmo de mao unica e com salt proprio por senha: nao existe operacao
que leia o hash e devolva a senha original, e duas pessoas com a mesma
senha produzem hashes diferentes.

Na pratica: nem voce, nem o administrador do sistema, nem quem abrir o
arquivo do banco consegue ver a senha de um funcionario. So e possivel
definir uma nova.

## Onde esse hash fica

Na tabela `funcionario`, dentro do arquivo:

```
<pasta do sistema>\data\integrapmaa.mv.db
```

E um arquivo comum do H2, no disco da propria maquina. Nada vai para a
internet e nao existe servidor externo envolvido. **Backup do sistema =
copiar a pasta `data`.**

## O que isso protege, e o que nao protege

Protege contra o caso mais comum: alguem obter o banco e sair usando as
senhas em outros sistemas, aproveitando que muita gente repete senha.

Nao protege contra quem tem acesso ao arquivo e quer **alterar** dados.
O arquivo em si nao e criptografado. Quem copia a pasta `data` leva junto
nomes, CPFs e valores de pagamento em texto legivel. Por isso a maquina
que roda o sistema precisa de senha de usuario no Windows, e a pasta
`data` deve entrar na rotina de backup da secretaria, de preferencia
cifrada.

## Limitacoes conhecidas desta versao

Vale declarar isso no artigo, em vez de esperar que a banca pergunte:

1. **Senha inicial publica.** O primeiro acesso e `admin` / `admin123`,
   criado automaticamente quando o banco esta vazio. Trocar essa senha
   e o primeiro passo da implantacao, nao uma sugestao.
2. **Chave do JWT em texto no `application.properties`.** Quem le esse
   arquivo consegue forjar um token valido e entrar como qualquer
   usuario. Numa implantacao real a chave deve vir de variavel de
   ambiente e ser trocada.
3. **Trafego em HTTP, sem TLS.** Aceitavel porque o sistema so responde
   em `127.0.0.1`, ou seja, o trafego nao sai da maquina. Deixa de ser
   aceitavel no momento em que ele for exposto na rede.
4. **Sem trilha de auditoria de login.** O sistema registra quem alterou
   pagamentos, mas nao registra tentativas de acesso malsucedidas.
5. **Console do H2 desligado.** Ele dava acesso total ao banco sem pedir
   login do sistema. Se precisar liga-lo para depurar, lembre de desligar
   depois.

Para o porte atual (uso interno, uma maquina, dados que ja circulam em
planilhas sem nenhuma protecao) esse conjunto e um avanco grande sobre a
situacao de hoje. Para expor o sistema na rede da prefeitura, os itens 2
e 3 precisam ser resolvidos antes.

---

# Ordem de uso dos arquivos

| Arquivo | Quando usar |
|---|---|
| `EXECUTAR-INTEGRA-PMAA.bat` | Dia a dia. Abre o sistema. |
| `RECOMPILAR.bat` | Depois de receber arquivos atualizados. |
| `PARAR-INTEGRA-PMAA.bat` | Quando acusar banco em uso e nao achar a janela. |
| `CRIAR-EXECUTAVEL.bat` | Uma vez, para gerar o `.exe` com atalho. |

---

## Erro: "C:\Users\Fulano" nao e reconhecido como um comando

O nome de usuario do Windows tem espaco (por exemplo `C:\Users\Carlos Alberto`).
O script do Maven Wrapper invocava o comando sem aspas, entao o `cmd` cortava o
caminho no primeiro espaco e tentava executar so o primeiro pedaco.

Ja corrigido no `mvnw.cmd`. Se voce tiver uma copia antiga, a linha correta e:

```
@IF NOT "%__MVNW_CMD__%"=="" ("%__MVNW_CMD__%" %*)
```

As aspas em volta de `%__MVNW_CMD__%` sao o conserto.

## Java 8 ou qualquer versao abaixo da 17

Nao tem contorno: o Spring Boot 3 nao roda em Java anterior ao 17. Os scripts
agora verificam isso antes de compilar e param com uma mensagem clara.

Duas formas de resolver:

1. **Com permissao de administrador** — instale o Java 17 em
   https://adoptium.net marcando "Add to PATH".

2. **Sem permissao de administrador** — baixe o pacote `.zip` do Java 17 no
   mesmo site, extraia, renomeie a pasta extraida para `jdk17` e coloque-a
   dentro da pasta do sistema, ao lado do `EXECUTAR-INTEGRA-PMAA.bat`. Os
   scripts detectam essa pasta e usam o Java dela, sem instalar nada no
   Windows e sem mexer no PATH da maquina.

A estrutura fica assim:

```
integra-pmaa\
├── jdk17\
│   └── bin\java.exe
├── EXECUTAR-INTEGRA-PMAA.bat
├── RECOMPILAR.bat
└── pom.xml
```
