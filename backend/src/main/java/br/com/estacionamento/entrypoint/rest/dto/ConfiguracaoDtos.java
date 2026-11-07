package br.com.estacionamento.entrypoint.rest.dto;

import br.com.estacionamento.core.entity.Configuracao;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public final class ConfiguracaoDtos {

    private ConfiguracaoDtos() {
    }

    public record ConfiguracaoRequest(
            String nomeEmpresa,
            String endereco,
            String fone,
            String email,
            String clausula,
            String comentario1,
            String comentario2,
            String comentario3,
            @PositiveOrZero BigDecimal vrInterna,
            @PositiveOrZero BigDecimal vrExterna,
            @PositiveOrZero BigDecimal vrCompleta,
            @PositiveOrZero BigDecimal vrCera,
            @PositiveOrZero BigDecimal vrMotor,
            @PositiveOrZero BigDecimal vrHora,
            @PositiveOrZero BigDecimal vrDiaria,
            @PositiveOrZero BigDecimal vrTerceiro,
            @PositiveOrZero Integer capacidade) {

        public Configuracao toEntity() {
            Configuracao c = new Configuracao();
            c.setNomeEmpresa(nomeEmpresa);
            c.setEndereco(endereco);
            c.setFone(fone);
            c.setEmail(email);
            c.setClausula(clausula);
            c.setComentario1(comentario1);
            c.setComentario2(comentario2);
            c.setComentario3(comentario3);
            c.setVrInterna(vrInterna);
            c.setVrExterna(vrExterna);
            c.setVrCompleta(vrCompleta);
            c.setVrCera(vrCera);
            c.setVrMotor(vrMotor);
            c.setVrHora(vrHora);
            c.setVrDiaria(vrDiaria);
            c.setVrTerceiro(vrTerceiro);
            c.setCapacidade(capacidade);
            return c;
        }
    }

    public record ConfiguracaoResponse(
            String nomeEmpresa,
            String endereco,
            String fone,
            String email,
            String clausula,
            String comentario1,
            String comentario2,
            String comentario3,
            BigDecimal vrInterna,
            BigDecimal vrExterna,
            BigDecimal vrCompleta,
            BigDecimal vrCera,
            BigDecimal vrMotor,
            BigDecimal vrHora,
            BigDecimal vrDiaria,
            BigDecimal vrTerceiro,
            Integer capacidade) {

        public static ConfiguracaoResponse of(Configuracao c) {
            return new ConfiguracaoResponse(
                    c.getNomeEmpresa(), c.getEndereco(), c.getFone(), c.getEmail(),
                    c.getClausula(), c.getComentario1(), c.getComentario2(),
                    c.getComentario3(), c.getVrInterna(), c.getVrExterna(),
                    c.getVrCompleta(), c.getVrCera(), c.getVrMotor(),
                    c.getVrHora(), c.getVrDiaria(), c.getVrTerceiro(),
                    c.getCapacidade());
        }
    }
}
