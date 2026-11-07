package br.com.estacionamento.entrypoint.rest.dto;

import br.com.estacionamento.core.entity.Exclusao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ExclusaoResponse(
        Long id,
        LocalDateTime dataHoraExclusao,
        String justificativa,
        BigDecimal valor,
        String veiculo,
        String placa) {

    public static ExclusaoResponse of(Exclusao e) {
        return new ExclusaoResponse(
                e.getId(), e.getDataHoraExclusao(), e.getJustificativa(),
                e.getValor(), e.getVeiculo(), e.getPlaca());
    }
}
