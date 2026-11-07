package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.usecase.VeiculoCatalogUsecase;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/veiculos")
@RequiredArgsConstructor
public class VeiculoController {

    private final VeiculoCatalogUsecase usecase;

    @GetMapping("/marcas")
    public List<VeiculoCatalogUsecase.Item> marcas() {
        return usecase.marcas();
    }

    @GetMapping("/modelos")
    public List<VeiculoCatalogUsecase.Item> modelos(
            @RequestParam String marca) {
        return usecase.modelos(marca);
    }
}
