package br.com.estacionamento.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "configuracao")
@Getter
@Setter
@NoArgsConstructor
public class Configuracao {

    public static final long ID_UNICO = 1L;

    @Id
    private Long id = ID_UNICO;

    private String nomeEmpresa;

    private String endereco;

    private String fone;

    private String email;

    @Column(columnDefinition = "text")
    private String clausula;

    @Column(columnDefinition = "text")
    private String comentario1;

    @Column(columnDefinition = "text")
    private String comentario2;

    @Column(columnDefinition = "text")
    private String comentario3;

    private BigDecimal vrInterna;

    private BigDecimal vrExterna;

    private BigDecimal vrCompleta;

    private BigDecimal vrCera;

    private BigDecimal vrMotor;

    private BigDecimal vrHora;

    private BigDecimal vrDiaria;

    private BigDecimal vrTerceiro;

    private Integer capacidade;
}
