package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.usecase.ConfiguracaoUsecase;
import br.com.estacionamento.entrypoint.rest.dto.ConfiguracaoDtos.ConfiguracaoRequest;
import br.com.estacionamento.entrypoint.rest.dto.ConfiguracaoDtos.ConfiguracaoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuracao")
@RequiredArgsConstructor
public class ConfiguracaoController {

    private final ConfiguracaoUsecase usecase;

    @GetMapping
    public ConfiguracaoResponse obter() {
        return ConfiguracaoResponse.of(usecase.obter());
    }

    @PutMapping
    public ConfiguracaoResponse salvar(
            @Valid @RequestBody ConfiguracaoRequest request) {
        return ConfiguracaoResponse.of(usecase.salvar(request.toEntity()));
    }
}
