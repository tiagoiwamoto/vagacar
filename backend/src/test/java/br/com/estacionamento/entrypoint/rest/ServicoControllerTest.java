package br.com.estacionamento.entrypoint.rest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.estacionamento.config.security.SecurityConfig;
import br.com.estacionamento.core.error.RecursoNaoEncontradoException;
import br.com.estacionamento.core.usecase.ServicoUsecase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ServicoController.class)
@Import(SecurityConfig.class)
class ServicoControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    ServicoUsecase usecase;

    @Test
    void entradaSemPlacaRetorna400ComViolacoes() throws Exception {
        mockMvc.perform(post("/api/servicos")
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"veiculo":"Fusca","especie":"HORA"}
                                """))
                .andDo(r -> System.out.println("BODY=" + r.getResponse().getContentAsString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.violacoes").isArray())
                .andExpect(jsonPath("$.violacoes[0].campo").value("placa"));
    }

    @Test
    void fechamentoDeServicoInexistenteRetorna404() throws Exception {
        when(usecase.fechar(eq(99L), any()))
                .thenThrow(new RecursoNaoEncontradoException("Servico", 99L));

        mockMvc.perform(post("/api/servicos/99/fechamento")
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.caminho").value("/api/servicos/99/fechamento"));
    }

    @Test
    void exclusaoSemJustificativaRetorna400() throws Exception {
        mockMvc.perform(delete("/api/servicos/1")
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
