package br.com.estacionamento.entrypoint.rest.dto;

import br.com.estacionamento.core.entity.ContaReceber;
import br.com.estacionamento.core.entity.FormaPagamento;
import br.com.estacionamento.core.entity.NaturezaRecebimento;
import br.com.estacionamento.core.entity.Recebimento;
import br.com.estacionamento.core.entity.SituacaoConta;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public final class FinanceiroDtos {

    private FinanceiroDtos() {
    }

    public record RecebimentoResponse(
            Long id,
            Long entradaN,
            LocalDateTime dataHora,
            String cliente,
            NaturezaRecebimento natureza,
            FormaPagamento formaPagamento,
            BigDecimal valor) {

        public static RecebimentoResponse of(Recebimento r) {
            return new RecebimentoResponse(
                    r.getId(), r.getEntradaN(), r.getDataHora(), r.getCliente(),
                    r.getNatureza(), r.getFormaPagamento(), r.getValor());
        }
    }

    public record PagamentoRequest(@NotNull FormaPagamento formaPagamento) {}

    public record ContaReceberResponse(
            Long id,
            LocalDateTime data,
            SituacaoConta situacao,
            Long clienteId,
            String clienteNomeFantasia,
            Long entradaN,
            String placa,
            String veiculo,
            LocalDateTime dataHoraEntrada,
            LocalDateTime dataHoraSaida,
            BigDecimal valor,
            LocalDateTime dataHoraPagamento) {

        public static ContaReceberResponse of(ContaReceber c) {
            return new ContaReceberResponse(
                    c.getId(), c.getData(), c.getSituacao(),
                    c.getCliente() != null ? c.getCliente().getId() : null,
                    c.getCliente() != null ? c.getCliente().getNomeFantasia() : null,
                    c.getEntradaN(), c.getPlaca(), c.getVeiculo(),
                    c.getDataHoraEntrada(), c.getDataHoraSaida(), c.getValor(),
                    c.getDataHoraPagamento());
        }
    }

    public record ResumoCaixaResponse(
            BigDecimal total,
            long quantidade,
            Map<String, BigDecimal> porNatureza,
            Map<String, BigDecimal> porFormaPagamento) {}
}
