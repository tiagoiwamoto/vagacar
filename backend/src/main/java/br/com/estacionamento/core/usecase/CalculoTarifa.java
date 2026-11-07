package br.com.estacionamento.core.usecase;

import br.com.estacionamento.core.entity.EspecieCobranca;
import br.com.estacionamento.core.error.NegocioException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CalculoTarifa {

    private static final long SEGUNDOS_POR_DIA = 86_400L;
    private static final long SEGUNDOS_POR_HORA = 3_600L;
    private static final long TOLERANCIA_LAVACAO_SEGUNDOS = 13L * 600L;
    private static final int HORAS_BONIFICADAS_LAVACAO = 2;

    private final long toleranciaSegundos;

    public CalculoTarifa(@Value("${estacionamento.tolerancia-minutos:10}") long toleranciaMinutos) {
        this.toleranciaSegundos = toleranciaMinutos * 60L;
    }

    public record Resultado(
            Integer qtdHoras,
            Integer qtdDias,
            BigDecimal vrHora,
            BigDecimal vrDiaria) {}

    public Resultado calcular(
            LocalDateTime entrada,
            LocalDateTime saida,
            EspecieCobranca especie,
            BigDecimal vrHoraUnit,
            BigDecimal vrDiariaUnit,
            boolean comLavacao) {

        if (saida == null) {
            throw new NegocioException("Data/hora de saida obrigatoria para fechamento.");
        }
        if (!saida.isAfter(entrada)) {
            throw new NegocioException("Data/hora de saida deve ser posterior a entrada.");
        }

        long segundos = Duration.between(entrada, saida).getSeconds();

        return switch (especie) {
            case HORA -> cobrarPorHora(segundos, vrHoraUnit, comLavacao);
            case DIARIA -> cobrarPorDiaria(segundos, vrHoraUnit, vrDiariaUnit);
        };
    }

    private Resultado cobrarPorHora(long segundos, BigDecimal vrHoraUnit, boolean comLavacao) {
        long horas = horasCobradas(segundos);
        if (horas < 1) {
            horas = 1;
        }

        if (comLavacao) {
            if (segundos > TOLERANCIA_LAVACAO_SEGUNDOS) {
                horas = Math.max(0, horas - HORAS_BONIFICADAS_LAVACAO);
            } else {
                horas = 0;
            }
        }

        BigDecimal vrHora = horas == 0 ? null : valorUnitario(vrHoraUnit, "hora")
                .multiply(BigDecimal.valueOf(horas));
        return new Resultado(horas == 0 ? null : (int) horas, null, vrHora, null);
    }

    private Resultado cobrarPorDiaria(long segundos, BigDecimal vrHoraUnit, BigDecimal vrDiariaUnit) {
        long dias = segundos / SEGUNDOS_POR_DIA;
        long resto = segundos % SEGUNDOS_POR_DIA;

        Integer qtdHora = null;
        BigDecimal vrHora = null;
        if (resto > toleranciaSegundos) {
            long horas = horasCobradas(resto);
            qtdHora = (int) horas;
            vrHora = valorUnitario(vrHoraUnit, "hora").multiply(BigDecimal.valueOf(horas));
        }

        BigDecimal vrDiaria = dias == 0 ? BigDecimal.ZERO
                : valorUnitario(vrDiariaUnit, "diaria").multiply(BigDecimal.valueOf(dias));

        return new Resultado(qtdHora, (int) dias, vrHora, vrDiaria);
    }

    private long horasCobradas(long segundos) {
        long horas = segundos / SEGUNDOS_POR_HORA;
        if (segundos % SEGUNDOS_POR_HORA > toleranciaSegundos) {
            horas++;
        }
        return horas;
    }

    private BigDecimal valorUnitario(BigDecimal valor, String descricao) {
        if (valor == null) {
            throw new NegocioException(
                    "Valor unitario de " + descricao + " nao informado nem configurado.");
        }
        return valor;
    }
}
