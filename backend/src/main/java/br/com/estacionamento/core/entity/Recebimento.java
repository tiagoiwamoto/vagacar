package br.com.estacionamento.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "recebimento")
@Getter
@Setter
@NoArgsConstructor
public class Recebimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long entradaN;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    private String cliente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NaturezaRecebimento natureza;

    @Enumerated(EnumType.STRING)
    private FormaPagamento formaPagamento;

    @Column(nullable = false)
    private BigDecimal valor;
}
