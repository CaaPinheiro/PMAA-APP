package com.barcarena.integrapmaa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IntegraPmaaApplication {

    public static void main(String[] args) {
        // Permite abrir o navegador automaticamente ao iniciar
        System.setProperty("java.awt.headless", "false");
        try {
            SpringApplication.run(IntegraPmaaApplication.class, args);
        } catch (Exception e) {
            explicarFalha(e);
            System.exit(1);
        }
    }

    /**
     * Traduz as falhas de inicializacao mais comuns para uma mensagem que o
     * usuario final consegue entender, em vez de deixar so o rastro de pilha.
     */
    private static void explicarFalha(Throwable erro) {
        String causas = encadearCausas(erro);

        System.out.println();
        System.out.println("=============================================================");
        System.out.println("   O INTEGRA PMAA NAO CONSEGUIU INICIAR");
        System.out.println("=============================================================");
        System.out.println();

        if (causas.contains("file is locked") || causas.contains("already in use")) {
            System.out.println("  MOTIVO: o banco de dados ja esta aberto por outro");
            System.out.println("  processo. Quase sempre isso significa que o sistema");
            System.out.println("  ja esta rodando nesta maquina.");
            System.out.println();
            System.out.println("  O QUE FAZER:");
            System.out.println("   1. Procure outra janela preta do Integra PMAA");
            System.out.println("      e use aquela, ela ja esta funcionando.");
            System.out.println("   2. Se nao encontrar nenhuma, execute o arquivo");
            System.out.println("      PARAR-INTEGRA-PMAA.bat e abra o sistema de novo.");
        } else if (causas.contains("Port 8080") || causas.contains("Web server failed to start")) {
            System.out.println("  MOTIVO: a porta 8080 esta ocupada por outro programa.");
            System.out.println();
            System.out.println("  O QUE FAZER:");
            System.out.println("   1. Execute o PARAR-INTEGRA-PMAA.bat e tente de novo.");
            System.out.println("   2. Se o problema continuar, troque a linha");
            System.out.println("      server.port=8080 no application.properties.");
        } else {
            System.out.println("  Role a janela para cima e procure a primeira linha");
            System.out.println("  que comeca com ERROR. Ela diz a causa real.");
            System.out.println();
            System.out.println("  Resumo tecnico:");
            System.out.println("  " + erro.getMessage());
        }

        System.out.println();
        System.out.println("=============================================================");
        System.out.println();
    }

    /** Junta a mensagem de cada excecao encadeada num texto unico. */
    private static String encadearCausas(Throwable erro) {
        StringBuilder texto = new StringBuilder();
        Throwable atual = erro;
        int limite = 0;
        while (atual != null && limite < 25) {
            texto.append(atual.getClass().getSimpleName())
                 .append(": ")
                 .append(atual.getMessage())
                 .append('\n');
            atual = atual.getCause();
            limite++;
        }
        return texto.toString();
    }
}
