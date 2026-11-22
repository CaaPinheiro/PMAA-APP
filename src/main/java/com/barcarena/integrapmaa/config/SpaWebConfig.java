package com.barcarena.integrapmaa.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.util.List;

/**
 * Suporte ao roteamento com History API da nova SPA.
 *
 * Durante a transicao a nova implementacao vive em /novo e o frontend legado
 * continua em /. Por isso o fallback responde SOMENTE em /novo/**: tudo o que
 * nao for um arquivo real e for uma navegacao GET sem extensao recebe
 * index-novo.html. Prefixos como /api/**, /css/**, /js/** e Swagger nunca
 * passam por este handler.
 *
 * Depois do corte, basta trocar o prefixo para "/**" e apontar o indice para
 * index.html, mantendo as mesmas regras.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    private static final String PREFIXO = "/novo";
    private static final String INDICE = "index-novo.html";

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController(PREFIXO)
                .setViewName("forward:" + PREFIXO + "/" + INDICE);
        registry.addViewController(PREFIXO + "/")
                .setViewName("forward:" + PREFIXO + "/" + INDICE);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(PREFIXO + "/**")
                .addResourceLocations("classpath:/static" + PREFIXO + "/")
                .resourceChain(false)
                .addResolver(new FallbackSpaResolver());
    }

    /**
     * Tenta servir o arquivo real. Se nao existir:
     * - requisicoes nao-GET nao sao encaminhadas (evita mascarar metodos);
     * - caminhos com extensao (arquivos) continuam 404;
     * - demais caminhos recebem o indice da SPA.
     */
    private static final class FallbackSpaResolver extends PathResourceResolver {

        @Override
        protected Resource resolveResourceInternal(HttpServletRequest request,
                                                   String requestPath,
                                                   List<? extends Resource> locations,
                                                   ResourceResolverChain chain) {

            Resource recurso = super.resolveResourceInternal(request, requestPath, locations, chain);
            if (recurso != null) {
                return recurso;
            }

            if (!"GET".equalsIgnoreCase(request.getMethod())) {
                return null;
            }

            if (requestPath != null && requestPath.contains(".")) {
                return null;
            }

            return super.resolveResourceInternal(request, INDICE, locations, chain);
        }
    }
}
