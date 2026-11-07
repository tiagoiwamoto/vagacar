package br.com.estacionamento.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "servico")
@Getter
@Setter
@NoArgsConstructor
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long entradaN;

    @Column(nullable = false, length = 10)
    private String placa;

    @Column(nullable = false)
    private String veiculo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoServico tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EspecieCobranca especie;

    @Column(nullable = false)
    private LocalDateTime dataHoraEntrada;

    private LocalDateTime dataHoraSaida;

    private Integer qtdHora;

    private Integer qtdDias;

    private BigDecimal vrHora;

    private BigDecimal vrDiaria;

    private BigDecimal vrItens;

    private BigDecimal vrCera;

    private BigDecimal vrMotor;

    private BigDecimal vrTerceiro;

    private BigDecimal subTotal;

    private BigDecimal desconto;

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private TipoLavacao itens;

    private String complemento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private LocalDateTime vencimentoPrePago;

    @Column(length = 10)
    private String vaga;

    public boolean isAberto() {
        return dataHoraSaida == null;
    }
}
