package br.com.estacionamento.core.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.estacionamento.core.entity.EspecieCobranca;
import br.com.estacionamento.core.error.NegocioException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class CalculoTarifaTest {

    private static final LocalDateTime ENTRADA =
            LocalDateTime.of(2026, 11, 6, 8, 0, 0);
    private static final BigDecimal HORA_10 = new BigDecimal("10.00");
    private static final BigDecimal DIARIA_50 = new BigDecimal("50.00");

    private final CalculoTarifa tarifa = new CalculoTarifa(10);

    @Test
    void permanenciaMenorQueUmaHoraCobraHoraMinima() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusMinutes(45),
                EspecieCobranca.HORA, HORA_10, null, false);

        assertThat(r.qtdHoras()).isEqualTo(1);
        assertThat(r.vrHora()).isEqualByComparingTo("10.00");
    }

    @Test
    void fracaoAteDezMinutosNaoCobraHoraExtra() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusHours(2).plusMinutes(10),
                EspecieCobranca.HORA, HORA_10, null, false);

        assertThat(r.qtdHoras()).isEqualTo(2);
        assertThat(r.vrHora()).isEqualByComparingTo("20.00");
    }

    @Test
    void fracaoAcimaDeDezMinutosCobraHoraExtra() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusHours(2).plusMinutes(11),
                EspecieCobranca.HORA, HORA_10, null, false);

        assertThat(r.qtdHoras()).isEqualTo(3);
        assertThat(r.vrHora()).isEqualByComparingTo("30.00");
    }

    @Test
    void diariaCobraDiasCheiosMaisHorasRestantes() {
        var r = tarifa.calcular(ENTRADA,
                ENTRADA.plusDays(1).plusHours(2).plusMinutes(11),
                EspecieCobranca.DIARIA, HORA_10, DIARIA_50, false);

        assertThat(r.qtdDias()).isEqualTo(1);
        assertThat(r.qtdHoras()).isEqualTo(3);
        assertThat(r.vrDiaria()).isEqualByComparingTo("50.00");
        assertThat(r.vrHora()).isEqualByComparingTo("30.00");
    }

    @Test
    void diariaIgnoraRestoAteDezMinutos() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusDays(2).plusMinutes(9),
                EspecieCobranca.DIARIA, HORA_10, DIARIA_50, false);

        assertThat(r.qtdDias()).isEqualTo(2);
        assertThat(r.qtdHoras()).isNull();
        assertThat(r.vrHora()).isNull();
        assertThat(r.vrDiaria()).isEqualByComparingTo("100.00");
    }

    @Test
    void lavacaoComPermanenciaLongaBonificaDuasHoras() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusHours(4),
                EspecieCobranca.HORA, HORA_10, null, true);

        assertThat(r.qtdHoras()).isEqualTo(2);
        assertThat(r.vrHora()).isEqualByComparingTo("20.00");
    }

    @Test
    void lavacaoComPermanenciaCurtaNaoCobraEstacionamento() {
        var r = tarifa.calcular(ENTRADA, ENTRADA.plusHours(1),
                EspecieCobranca.HORA, HORA_10, null, true);

        assertThat(r.qtdHoras()).isNull();
        assertThat(r.vrHora()).isNull();
    }

    @Test
    void valorUnitarioAusenteFalhaDeFormaExplicita() {
        assertThatThrownBy(() -> tarifa.calcular(ENTRADA, ENTRADA.plusHours(3),
                EspecieCobranca.HORA, null, null, false))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("hora");
    }

    @Test
    void saidaAnteriorAEntradaFalha() {
        assertThatThrownBy(() -> tarifa.calcular(ENTRADA, ENTRADA.minusMinutes(1),
                EspecieCobranca.HORA, HORA_10, null, false))
                .isInstanceOf(NegocioException.class);
    }
}
