package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.entity.SituacaoConta;
import br.com.estacionamento.core.usecase.FinanceiroUsecase;
import br.com.estacionamento.entrypoint.rest.dto.FinanceiroDtos.ContaReceberResponse;
import br.com.estacionamento.entrypoint.rest.dto.FinanceiroDtos.PagamentoRequest;
import br.com.estacionamento.entrypoint.rest.dto.FinanceiroDtos.RecebimentoResponse;
import br.com.estacionamento.entrypoint.rest.dto.FinanceiroDtos.ResumoCaixaResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroUsecase usecase;

    @GetMapping("/recebimentos")
    public List<RecebimentoResponse> recebimentos(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return usecase.listarRecebimentos(inicio, fim).stream()
                .map(RecebimentoResponse::of)
                .toList();
    }

    @GetMapping("/caixa/resumo")
    public ResumoCaixaResponse resumoCaixa(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        var resumo = usecase.resumoCaixa(inicio, fim);
        return new ResumoCaixaResponse(
                resumo.total(), resumo.quantidade(), resumo.porNatureza(),
                resumo.porFormaPagamento());
    }

    @GetMapping("/contas-receber")
    public List<ContaReceberResponse> contas(
            @RequestParam(required = false) SituacaoConta situacao) {
        return usecase.listarContas(situacao).stream()
                .map(ContaReceberResponse::of)
                .toList();
    }

    @PostMapping("/contas-receber/{id}/pagamento")
    public ContaReceberResponse pagar(@PathVariable Long id,
            @Valid @RequestBody PagamentoRequest request) {
        return ContaReceberResponse.of(
                usecase.pagarConta(id, request.formaPagamento()));
    }
}
