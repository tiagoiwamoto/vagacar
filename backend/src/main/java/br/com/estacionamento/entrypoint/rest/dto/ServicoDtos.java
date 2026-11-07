package br.com.estacionamento.entrypoint.rest.dto;

import br.com.estacionamento.core.entity.EspecieCobranca;
import br.com.estacionamento.core.entity.FormaPagamento;
import br.com.estacionamento.core.entity.Servico;
import br.com.estacionamento.core.entity.TipoLavacao;
import br.com.estacionamento.core.entity.TipoServico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class ServicoDtos {

    private ServicoDtos() {
    }

    public record EntradaRequest(
            @NotBlank String placa,
            @NotBlank String veiculo,
            TipoServico tipo,
            @NotNull EspecieCobranca especie,
            Long clienteId,
            TipoLavacao itens,
            @PositiveOrZero BigDecimal vrItens,
            Boolean comCera,
            @PositiveOrZero BigDecimal vrCera,
            Boolean comMotor,
            @PositiveOrZero BigDecimal vrMotor,
            @PositiveOrZero BigDecimal vrTerceiro,
            String complemento,
            Integer qtdHora,
            Integer qtdDias,
            @PositiveOrZero BigDecimal vrHoraUnit,
            @PositiveOrZero BigDecimal vrDiariaUnit,
            String vaga,
            FormaPagamento formaPagamento) {}

    public record FechamentoRequest(
            LocalDateTime dataHoraSaida,
            @PositiveOrZero BigDecimal desconto,
            @PositiveOrZero BigDecimal vrHoraUnit,
            @PositiveOrZero BigDecimal vrDiariaUnit,
            @PositiveOrZero BigDecimal vrItens,
            @PositiveOrZero BigDecimal vrCera,
            @PositiveOrZero BigDecimal vrMotor,
            @PositiveOrZero BigDecimal vrTerceiro,
            FormaPagamento formaPagamento) {}

    public record ExclusaoRequest(@NotBlank String justificativa) {}

    public record ServicoResponse(
            Long id,
            Long entradaN,
            String placa,
            String veiculo,
            TipoServico tipo,
            EspecieCobranca especie,
            LocalDateTime dataHoraEntrada,
            LocalDateTime dataHoraSaida,
            boolean aberto,
            Integer qtdHora,
            Integer qtdDias,
            BigDecimal vrHora,
            BigDecimal vrDiaria,
            BigDecimal vrItens,
            BigDecimal vrCera,
            BigDecimal vrMotor,
            BigDecimal vrTerceiro,
            BigDecimal subTotal,
            BigDecimal desconto,
            BigDecimal total,
            TipoLavacao itens,
            String complemento,
            Long clienteId,
            String convenio,
            LocalDateTime vencimentoPrePago,
            String vaga) {

        public static ServicoResponse of(Servico s) {
            return new ServicoResponse(
                    s.getId(), s.getEntradaN(), s.getPlaca(), s.getVeiculo(),
                    s.getTipo(), s.getEspecie(), s.getDataHoraEntrada(),
                    s.getDataHoraSaida(), s.isAberto(), s.getQtdHora(),
                    s.getQtdDias(), s.getVrHora(), s.getVrDiaria(), s.getVrItens(),
                    s.getVrCera(), s.getVrMotor(), s.getVrTerceiro(),
                    s.getSubTotal(), s.getDesconto(), s.getTotal(), s.getItens(),
                    s.getComplemento(),
                    s.getCliente() != null ? s.getCliente().getId() : null,
                    s.getCliente() != null ? s.getCliente().getNomeFantasia() : null,
                    s.getVencimentoPrePago(), s.getVaga());
        }
    }

    public record FechamentoResponse(
            ServicoResponse servico,
            ServicoResponse servicoComplementar) {}
}
