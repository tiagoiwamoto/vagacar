package br.com.estacionamento.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "exclusao")
@Getter
@Setter
@NoArgsConstructor
public class Exclusao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataHoraExclusao;

    @Column(nullable = false, columnDefinition = "text")
    private String justificativa;

    private BigDecimal valor;

    private String veiculo;

    private String placa;
}
