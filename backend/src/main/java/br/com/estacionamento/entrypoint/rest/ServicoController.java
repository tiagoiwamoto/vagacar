package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.usecase.ServicoUsecase;
import br.com.estacionamento.entrypoint.rest.dto.ServicoDtos.EntradaRequest;
import br.com.estacionamento.entrypoint.rest.dto.ServicoDtos.ExclusaoRequest;
import br.com.estacionamento.entrypoint.rest.dto.ServicoDtos.FechamentoRequest;
import br.com.estacionamento.entrypoint.rest.dto.ServicoDtos.FechamentoResponse;
import br.com.estacionamento.entrypoint.rest.dto.ServicoDtos.ServicoResponse;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/servicos")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoUsecase usecase;

    @GetMapping
    public List<ServicoResponse> listar(
            @RequestParam(required = false) Boolean abertos,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return usecase.listar(abertos, inicio, fim).stream()
                .map(ServicoResponse::of)
                .toList();
    }

    @GetMapping("/{id}")
    public ServicoResponse buscar(@PathVariable Long id) {
        return ServicoResponse.of(usecase.buscar(id));
    }

    @PostMapping
    public ResponseEntity<ServicoResponse> registrarEntrada(
            @Valid @RequestBody EntradaRequest request) {
        var command = new ServicoUsecase.EntradaCommand(
                request.placa(), request.veiculo(), request.tipo(), request.especie(),
                request.clienteId(), request.itens(), request.vrItens(),
                Boolean.TRUE.equals(request.comCera()), request.vrCera(),
                Boolean.TRUE.equals(request.comMotor()),
                request.vrMotor(), request.vrTerceiro(), request.complemento(),
                request.qtdHora(), request.qtdDias(),
                request.vrHoraUnit(), request.vrDiariaUnit(),
                request.vaga(), request.formaPagamento());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ServicoResponse.of(usecase.registrarEntrada(command)));
    }

    @PostMapping("/{id}/fechamento")
    public FechamentoResponse fechar(@PathVariable Long id,
            @Valid @RequestBody(required = false) FechamentoRequest request) {
        var req = request != null ? request : new FechamentoRequest(
                null, null, null, null, null, null, null, null, null);
        var command = new ServicoUsecase.FechamentoCommand(
                req.dataHoraSaida(), req.desconto(), req.vrHoraUnit(),
                req.vrDiariaUnit(), req.vrItens(), req.vrCera(), req.vrMotor(),
                req.vrTerceiro(), req.formaPagamento());
        var resultado = usecase.fechar(id, command);
        return new FechamentoResponse(
                ServicoResponse.of(resultado.servico()),
                resultado.servicoComplementar() != null
                        ? ServicoResponse.of(resultado.servicoComplementar()) : null);
    }

    @GetMapping("/vagas/mapa")
    public List<ServicoUsecase.VagaStatus> vagas() {
        return usecase.mapaVagas();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
            @Valid @RequestBody ExclusaoRequest request) {
        usecase.excluir(id, request.justificativa());
        return ResponseEntity.noContent().build();
    }
}
