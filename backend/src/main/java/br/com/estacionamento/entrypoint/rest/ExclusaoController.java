package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.usecase.ExclusaoUsecase;
import br.com.estacionamento.entrypoint.rest.dto.ExclusaoResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exclusoes")
@RequiredArgsConstructor
public class ExclusaoController {

    private final ExclusaoUsecase usecase;

    @GetMapping
    public List<ExclusaoResponse> listar() {
        return usecase.listar().stream().map(ExclusaoResponse::of).toList();
    }
}
