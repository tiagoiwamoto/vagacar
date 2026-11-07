package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.usecase.ClienteUsecase;
import br.com.estacionamento.entrypoint.rest.dto.ClienteDtos.ClienteRequest;
import br.com.estacionamento.entrypoint.rest.dto.ClienteDtos.ClienteResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteUsecase usecase;

    @GetMapping
    public List<ClienteResponse> listar() {
        return usecase.listar().stream().map(ClienteResponse::of).toList();
    }

    @GetMapping("/{id}")
    public ClienteResponse buscar(@PathVariable Long id) {
        return ClienteResponse.of(usecase.buscar(id));
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ClienteResponse.of(usecase.criar(request.toEntity())));
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Long id,
            @Valid @RequestBody ClienteRequest request) {
        return ClienteResponse.of(usecase.atualizar(id, request.toEntity()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        usecase.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
