package br.com.estacionamento.core.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.estacionamento.core.entity.Cliente;
import br.com.estacionamento.core.entity.Configuracao;
import br.com.estacionamento.core.entity.ContaReceber;
import br.com.estacionamento.config.VagaCatalog;
import br.com.estacionamento.core.entity.EspecieCobranca;
import br.com.estacionamento.core.entity.FormaPagamento;
import br.com.estacionamento.core.entity.Exclusao;
import br.com.estacionamento.core.entity.NaturezaRecebimento;
import br.com.estacionamento.core.entity.Recebimento;
import br.com.estacionamento.core.entity.Servico;
import br.com.estacionamento.core.entity.TipoServico;
import br.com.estacionamento.core.error.NegocioException;
import br.com.estacionamento.core.error.ServicoJaFechadoException;
import br.com.estacionamento.core.repository.ClienteRepository;
import br.com.estacionamento.core.repository.ContaReceberRepository;
import br.com.estacionamento.core.repository.ExclusaoRepository;
import br.com.estacionamento.core.repository.RecebimentoRepository;
import br.com.estacionamento.core.repository.ServicoRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ServicoUsecaseTest {

    @Mock ServicoRepository servicoRepository;
    @Mock ClienteRepository clienteRepository;
    @Mock RecebimentoRepository recebimentoRepository;
    @Mock ContaReceberRepository contaReceberRepository;
    @Mock ExclusaoRepository exclusaoRepository;
    @Mock ConfiguracaoUsecase configuracaoUsecase;

    CalculoTarifa calculoTarifa = new CalculoTarifa(10);
    VagaCatalog vagaCatalog = new VagaCatalog(java.util.List.of("A1", "A2", "B1"));

    ServicoUsecase usecase;

    @BeforeEach
    void setUp() {
        usecase = new ServicoUsecase(servicoRepository, clienteRepository,
                recebimentoRepository, contaReceberRepository, exclusaoRepository,
                configuracaoUsecase, calculoTarifa, vagaCatalog);

        Configuracao config = new Configuracao();
        config.setVrHora(new BigDecimal("10.00"));
        config.setVrDiaria(new BigDecimal("50.00"));
        org.mockito.Mockito.lenient().when(configuracaoUsecase.obter())
                .thenReturn(config);
        org.mockito.Mockito.lenient()
                .when(servicoRepository.save(any(Servico.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    private ServicoUsecase.EntradaCommand entrada(TipoServico tipo,
            EspecieCobranca especie, Long clienteId, Integer qtdHora,
            Integer qtdDias) {
        return new ServicoUsecase.EntradaCommand(
                "ABC1D23", "Fusca", tipo, especie, clienteId,
                null, null, false, null, false, null, null,
                null, qtdHora, qtdDias, null, null, null,
                FormaPagamento.DINHEIRO);
    }

    private ServicoUsecase.FechamentoCommand fechamento(
            java.time.LocalDateTime saida) {
        return new ServicoUsecase.FechamentoCommand(
                saida, null, null, null, null, null, null, null,
                FormaPagamento.PIX);
    }

    private Servico servicoAberto(TipoServico tipo, EspecieCobranca especie,
            LocalDateTime entrada) {
        Servico s = new Servico();
        s.setId(1L);
        s.setEntradaN(7L);
        s.setPlaca("ABC1D23");
        s.setVeiculo("Fusca");
        s.setTipo(tipo);
        s.setEspecie(especie);
        s.setDataHoraEntrada(entrada);
        s.setDesconto(BigDecimal.ZERO);
        return s;
    }

    @Test
    void entradaAtribuiNumeroSequencial() {
        when(servicoRepository.maxEntradaN()).thenReturn(41L);

        Servico salvo = usecase.registrarEntrada(
                entrada(TipoServico.PARTICULAR, EspecieCobranca.HORA, null, null, null));

        assertThat(salvo.getEntradaN()).isEqualTo(42L);
        assertThat(salvo.isAberto()).isTrue();
    }

    @Test
    void entradaComPlacaJaAbertaFalha() {
        when(servicoRepository.existsByPlacaIgnoreCaseAndDataHoraSaidaIsNull("ABC1D23"))
                .thenReturn(true);

        assertThatThrownBy(() -> usecase.registrarEntrada(
                entrada(TipoServico.PARTICULAR, EspecieCobranca.HORA, null, null, null)))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("ABC1D23");
    }

    @Test
    void entradaConvenioSemClienteFalha() {
        assertThatThrownBy(() -> usecase.registrarEntrada(
                entrada(TipoServico.CONVENIO, EspecieCobranca.HORA, null, null, null)))
                .isInstanceOf(NegocioException.class);
    }

    @Test
    void fechamentoParticularCalculaTotalEGeraRecebimento() {
        LocalDateTime entrada = LocalDateTime.now().minusHours(3).minusMinutes(20);
        Servico servico = servicoAberto(TipoServico.PARTICULAR,
                EspecieCobranca.HORA, entrada);
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        var resultado = usecase.fechar(1L, fechamento(entrada.plusHours(3).plusMinutes(20)));

        Servico fechado = resultado.servico();
        assertThat(fechado.getQtdHora()).isEqualTo(4);
        assertThat(fechado.getVrHora()).isEqualByComparingTo("40.00");
        assertThat(fechado.getTotal()).isEqualByComparingTo("40.00");

        ArgumentCaptor<Recebimento> captor = ArgumentCaptor.forClass(Recebimento.class);
        verify(recebimentoRepository).save(captor.capture());
        assertThat(captor.getValue().getNatureza())
                .isEqualTo(NaturezaRecebimento.PARTICULAR);
        assertThat(captor.getValue().getValor()).isEqualByComparingTo("40.00");
        assertThat(captor.getValue().getEntradaN()).isEqualTo(7L);
    }

    @Test
    void fechamentoConvenioGeraContaReceberSemRecebimento() {
        Cliente cliente = new Cliente();
        cliente.setId(5L);
        cliente.setNomeFantasia("Empresa X");

        Servico servico = servicoAberto(TipoServico.CONVENIO,
                EspecieCobranca.HORA, LocalDateTime.now().minusHours(2));
        servico.setCliente(cliente);
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        usecase.fechar(1L, fechamento(LocalDateTime.now()));

        ArgumentCaptor<ContaReceber> captor = ArgumentCaptor.forClass(ContaReceber.class);
        verify(contaReceberRepository).save(captor.capture());
        assertThat(captor.getValue().getCliente()).isSameAs(cliente);
        assertThat(captor.getValue().getEntradaN()).isEqualTo(7L);
        verify(recebimentoRepository, never()).save(any());
    }

    @Test
    void fechamentoDeContaJaFechadaFalha() {
        Servico servico = servicoAberto(TipoServico.PARTICULAR,
                EspecieCobranca.HORA, LocalDateTime.now().minusHours(2));
        servico.setDataHoraSaida(LocalDateTime.now());
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        assertThatThrownBy(() -> usecase.fechar(1L, fechamento(null)))
                .isInstanceOf(ServicoJaFechadoException.class);
    }

    @Test
    void entradaPrePagoDefineVencimentoEGeraRecebimento() {
        when(servicoRepository.maxEntradaN()).thenReturn(0L);

        Servico salvo = usecase.registrarEntrada(
                entrada(TipoServico.PRE_PAGO, EspecieCobranca.HORA, null, 3, null));

        assertThat(salvo.getVencimentoPrePago())
                .isEqualTo(salvo.getDataHoraEntrada().plusHours(3));
        assertThat(salvo.getVrHora()).isEqualByComparingTo("30.00");

        ArgumentCaptor<Recebimento> captor = ArgumentCaptor.forClass(Recebimento.class);
        verify(recebimentoRepository).save(captor.capture());
        assertThat(captor.getValue().getNatureza())
                .isEqualTo(NaturezaRecebimento.PRE_PAGO);
    }

    @Test
    void entradaPrePagoSemQuantidadeFalha() {
        when(servicoRepository.maxEntradaN()).thenReturn(0L);

        assertThatThrownBy(() -> usecase.registrarEntrada(
                entrada(TipoServico.PRE_PAGO, EspecieCobranca.HORA, null, null, null)))
                .isInstanceOf(NegocioException.class)
                .hasMessageContaining("horas");
    }

    @Test
    void exclusaoSemJustificativaFalha() {
        assertThatThrownBy(() -> usecase.excluir(1L, "  "))
                .isInstanceOf(NegocioException.class);
        verify(exclusaoRepository, never()).save(any());
    }

    @Test
    void exclusaoRegistraHistoricoERemoveRecebimentos() {
        Servico servico = servicoAberto(TipoServico.PARTICULAR,
                EspecieCobranca.HORA, LocalDateTime.now().minusHours(1));
        servico.setTotal(new BigDecimal("20.00"));
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        usecase.excluir(1L, "Lancamento duplicado");

        ArgumentCaptor<Exclusao> captor = ArgumentCaptor.forClass(Exclusao.class);
        verify(exclusaoRepository).save(captor.capture());
        assertThat(captor.getValue().getJustificativa())
                .isEqualTo("Lancamento duplicado");
        assertThat(captor.getValue().getPlaca()).isEqualTo("ABC1D23");
        verify(recebimentoRepository).deleteByEntradaN(7L);
        verify(servicoRepository).delete(servico);
    }
}
