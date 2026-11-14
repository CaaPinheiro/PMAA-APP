package com.barcarena.integrapmaa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.net.URI;
import java.util.Locale;

/** Abre o navegador quando o sistema termina de subir. */
@Component
public class AberturaNavegador {

    @Value("${app.abrir-navegador:false}")
    private boolean abrirNavegador;

    @Value("${server.port:8080}")
    private int porta;

    @EventListener(ApplicationReadyEvent.class)
    public void aoIniciar() {
        String url = "http://localhost:" + porta;

        System.out.println();
        System.out.println("=============================================================");
        System.out.println("   INTEGRA PMAA - no ar!");
        System.out.println("   Acesse: " + url);
        System.out.println("   Login inicial: admin / admin123");
        System.out.println("=============================================================");
        System.out.println();

        if (!abrirNavegador) return;

        if (tentarAbrir(url)) return;

        System.out.println("  [AVISO] Nao foi possivel abrir o navegador automaticamente.");
        System.out.println("  Abra o endereco acima manualmente. O sistema esta funcionando.");
        System.out.println();
    }

    /** Tenta cada estrategia na ordem ate uma funcionar. */
    private boolean tentarAbrir(String url) {
        String so = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);

        // 1) API padrao do Java. So funciona se o modo headless estiver desligado
        //    (ver spring.main.headless=false no application.properties).
        try {
            if (Desktop.isDesktopSupported()
                    && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                return true;
            }
        } catch (Exception e) {
            System.out.println("  [INFO] Desktop.browse indisponivel: " + e.getMessage());
        }

        // 2) Comando nativo do sistema operacional.
        String[][] tentativas;
        if (so.contains("win")) {
            tentativas = new String[][]{
                    {"cmd", "/c", "start", "", url},
                    {"rundll32", "url.dll,FileProtocolHandler", url}
            };
        } else if (so.contains("mac")) {
            tentativas = new String[][]{{"open", url}};
        } else {
            tentativas = new String[][]{{"xdg-open", url}};
        }

        for (String[] comando : tentativas) {
            try {
                new ProcessBuilder(comando).start();
                return true;
            } catch (Exception e) {
                System.out.println("  [INFO] Falhou: " + comando[0] + " - " + e.getMessage());
            }
        }
        return false;
    }
}
