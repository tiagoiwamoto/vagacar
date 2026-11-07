package br.com.estacionamento.core.usecase;

import br.com.estacionamento.config.VagaCatalog;
import br.com.estacionamento.core.entity.Cliente;
import br.com.estacionamento.core.entity.Configuracao;
import br.com.estacionamento.core.entity.ContaReceber;
import br.com.estacionamento.core.entity.EspecieCobranca;
import br.com.estacionamento.core.entity.Exclusao;
import br.com.estacionamento.core.entity.FormaPagamento;
import br.com.estacionamento.core.entity.NaturezaRecebimento;
import br.com.estacionamento.core.entity.Recebimento;
import br.com.estacionamento.core.entity.Servico;
import br.com.estacionamento.core.entity.SituacaoConta;
import br.com.estacionamento.core.entity.TipoLavacao;
import br.com.estacionamento.core.entity.TipoServico;
import br.com.estacionamento.core.error.NegocioException;
import br.com.estacionamento.core.error.RecursoNaoEncontradoException;
import br.com.estacionamento.core.error.ServicoJaFechadoException;
import br.com.estacionamento.core.repository.ClienteRepository;
import br.com.estacionamento.core.repository.ContaReceberRepository;
import br.com.estacionamento.core.repository.ExclusaoRepository;
import br.com.estacionamento.core.repository.RecebimentoRepository;
import br.com.estacionamento.core.repository.ServicoRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ServicoUsecase {

    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;
    private final RecebimentoRepository recebimentoRepository;
    private final ContaReceberRepository contaReceberRepository;
    private final ExclusaoRepository exclusaoRepository;
    private final ConfiguracaoUsecase configuracaoUsecase;
    private final CalculoTarifa calculoTarifa;
    private final VagaCatalog vagaCatalog;

    public record EntradaCommand(
            String placa,
            String veiculo,
            TipoServico tipo,
            EspecieCobranca especie,
            Long clienteId,
            TipoLavacao itens,
            BigDecimal vrItens,
            boolean comCera,
            BigDecimal vrCera,
            boolean comMotor,
            BigDecimal vrMotor,
            BigDecimal vrTerceiro,
            String complemento,
            Integer qtdHora,
            Integer qtdDias,
            BigDecimal vrHoraUnit,
            BigDecimal vrDiariaUnit,
            String vaga,
            FormaPagamento formaPagamento) {}

    public record FechamentoCommand(
            LocalDateTime dataHoraSaida,
            BigDecimal desconto,
            BigDecimal vrHoraUnit,
            BigDecimal vrDiariaUnit,
            BigDecimal vrItens,
            BigDecimal vrCera,
            BigDecimal vrMotor,
            BigDecimal vrTerceiro,
            FormaPagamento formaPagamento) {}

    public record ResultadoFechamento(Servico servico, Servico servicoComplementar) {}

    public record VagaStatus(
            String codigo,
            boolean ocupada,
            Long servicoId,
            String placa,
            String veiculo,
            TipoServico tipo) {}

    @Transactional(readOnly = true)
    public List<Servico> listar(Boolean abertos, LocalDateTime inicio, LocalDateTime fim) {
        if (Boolean.TRUE.equals(abertos)) {
            return servicoRepository.findByDataHoraSaidaIsNullOrderByDataHoraEntradaDesc();
        }
        if (inicio != null && fim != null) {
            return servicoRepository.findByDataHoraEntradaBetweenOrderByDataHoraEntradaDesc(inicio, fim);
        }
        return servicoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Servico buscar(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Servico", id));
    }

    @Transactional
    public Servico registrarEntrada(EntradaCommand command) {
        if (servicoRepository.existsByPlacaIgnoreCaseAndDataHoraSaidaIsNull(command.placa())) {
            throw new NegocioException(
                    "Ja existe uma conta aberta para a placa " + command.placa() + ".");
        }

        Configuracao config = configuracaoUsecase.obter();
        Servico servico = new Servico();
        servico.setEntradaN(servicoRepository.maxEntradaN() + 1);
        servico.setPlaca(command.placa().toUpperCase());
        servico.setVeiculo(command.veiculo());
        servico.setTipo(command.tipo() != null ? command.tipo() : TipoServico.PARTICULAR);
        servico.setEspecie(command.especie());
        servico.setDataHoraEntrada(LocalDateTime.now());
        servico.setComplemento(command.complemento());
        servico.setDesconto(BigDecimal.ZERO);

        if (servico.getTipo() == TipoServico.CONVENIO) {
            servico.setCliente(resolverCliente(command.clienteId()));
        }

        servico.setVaga(resolverVaga(command.vaga()));

        aplicarItens(servico, command, config);

        if (servico.getTipo() == TipoServico.PRE_PAGO) {
            if (command.formaPagamento() == null) {
                throw new NegocioException(
                        "Informe a forma de pagamento do pre-pago.");
            }
            registrarPrePago(servico, command, config);
        }

        recalcularTotais(servico);
        Servico salvo = servicoRepository.save(servico);

        if (servico.getTipo() == TipoServico.PRE_PAGO) {
            registrarRecebimento(salvo, NaturezaRecebimento.PRE_PAGO,
                    "Particular", command.formaPagamento());
        }
        return salvo;
    }

    @Transactional
    public ResultadoFechamento fechar(Long id, FechamentoCommand command) {
        Servico servico = buscar(id);
        if (!servico.isAberto()) {
            throw new ServicoJaFechadoException(servico.getEntradaN());
        }
        if (servico.getTipo() == TipoServico.PRE_PAGO) {
            return fecharPrePago(servico, command);
        }
        if (servico.getTipo() == TipoServico.PARTICULAR
                && command.formaPagamento() == null) {
            throw new NegocioException("Informe a forma de pagamento.");
        }

        Configuracao config = configuracaoUsecase.obter();
        LocalDateTime saida = command.dataHoraSaida() != null
                ? command.dataHoraSaida() : LocalDateTime.now();
        servico.setDataHoraSaida(saida);

        BigDecimal vrHoraUnit = command.vrHoraUnit() != null
                ? command.vrHoraUnit() : config.getVrHora();
        BigDecimal vrDiariaUnit = command.vrDiariaUnit() != null
                ? command.vrDiariaUnit() : config.getVrDiaria();

        CalculoTarifa.Resultado tarifa = calculoTarifa.calcular(
                servico.getDataHoraEntrada(), saida, servico.getEspecie(),
                vrHoraUnit, vrDiariaUnit, servico.getItens() != null);

        servico.setQtdHora(tarifa.qtdHoras());
        servico.setQtdDias(tarifa.qtdDias());
        servico.setVrHora(tarifa.vrHora());
        servico.setVrDiaria(tarifa.vrDiaria());

        if (command.vrItens() != null) servico.setVrItens(command.vrItens());
        if (command.vrCera() != null) servico.setVrCera(command.vrCera());
        if (command.vrMotor() != null) servico.setVrMotor(command.vrMotor());
        if (command.vrTerceiro() != null) servico.setVrTerceiro(command.vrTerceiro());
        servico.setDesconto(command.desconto() != null ? command.desconto() : BigDecimal.ZERO);

        recalcularTotais(servico);
        Servico salvo = servicoRepository.save(servico);

        switch (servico.getTipo()) {
            case PARTICULAR -> registrarRecebimento(salvo,
                    NaturezaRecebimento.PARTICULAR, "Particular",
                    command.formaPagamento());
            case CONVENIO -> gerarContaReceber(salvo);
            default -> { }
        }
        return new ResultadoFechamento(salvo, null);
    }

    @Transactional(readOnly = true)
    public List<VagaStatus> mapaVagas() {
        var ocupados = servicoRepository
                .findByDataHoraSaidaIsNullOrderByDataHoraEntradaDesc().stream()
                .filter(s -> s.getVaga() != null)
                .collect(java.util.stream.Collectors.toMap(
                        Servico::getVaga, s -> s, (a, b) -> a));
        return listaVagas().stream()
                .map(codigo -> {
                    Servico s = ocupados.get(codigo);
                    return s == null
                            ? new VagaStatus(codigo, false, null, null, null, null)
                            : new VagaStatus(codigo, true, s.getId(), s.getPlaca(),
                                    s.getVeiculo(), s.getTipo());
                })
                .toList();
    }

    @Transactional
    public void excluir(Long id, String justificativa) {
        if (!StringUtils.hasText(justificativa)) {
            throw new NegocioException(
                    "E necessario informar uma justificativa para excluir o registro.");
        }
        Servico servico = buscar(id);

        Exclusao exclusao = new Exclusao();
        exclusao.setDataHoraExclusao(LocalDateTime.now());
        exclusao.setJustificativa(justificativa);
        exclusao.setValor(servico.getTotal());
        exclusao.setVeiculo(servico.getVeiculo());
        exclusao.setPlaca(servico.getPlaca());
        exclusaoRepository.save(exclusao);

        recebimentoRepository.deleteByEntradaN(servico.getEntradaN());
        servicoRepository.delete(servico);
    }

    private void registrarPrePago(Servico servico, EntradaCommand command, Configuracao config) {
        if (servico.getEspecie() == EspecieCobranca.HORA) {
            if (command.qtdHora() == null || command.qtdHora() < 1) {
                throw new NegocioException(
                        "Informe a quantidade de horas para o pre-pago.");
            }
            servico.setQtdHora(command.qtdHora());
            servico.setVencimentoPrePago(
                    servico.getDataHoraEntrada().plusHours(command.qtdHora()));
            BigDecimal unit = command.vrHoraUnit() != null
                    ? command.vrHoraUnit() : config.getVrHora();
            servico.setVrHora(unit != null
                    ? unit.multiply(BigDecimal.valueOf(command.qtdHora())) : null);
        } else {
            if (command.qtdDias() == null || command.qtdDias() < 1) {
                throw new NegocioException(
                        "Informe a quantidade de dias para o pre-pago.");
            }
            servico.setQtdDias(command.qtdDias());
            servico.setVencimentoPrePago(
                    servico.getDataHoraEntrada().plusDays(command.qtdDias()));
            BigDecimal unit = command.vrDiariaUnit() != null
                    ? command.vrDiariaUnit() : config.getVrDiaria();
            servico.setVrDiaria(unit != null
                    ? unit.multiply(BigDecimal.valueOf(command.qtdDias())) : null);
        }
    }

    private ResultadoFechamento fecharPrePago(Servico servico,
            FechamentoCommand command) {
        if (servico.getVencimentoPrePago() == null) {
            throw new NegocioException(
                    "Nao foi efetuada a rotina de entrada do veiculo.");
        }

        servico.setDataHoraSaida(LocalDateTime.now());
        Servico salvo = servicoRepository.save(servico);

        LocalDateTime limite = servico.getVencimentoPrePago().plusMinutes(10);
        if (!servico.getDataHoraSaida().isAfter(limite)) {
            return new ResultadoFechamento(salvo, null);
        }
        if (command.formaPagamento() == null) {
            throw new NegocioException(
                    "Pre-pago vencido: informe a forma de pagamento da conta complementar.");
        }

        Servico complementar = new Servico();
        complementar.setEntradaN(servicoRepository.maxEntradaN() + 1);
        complementar.setPlaca(servico.getPlaca());
        complementar.setVeiculo(servico.getVeiculo());
        complementar.setTipo(TipoServico.PARTICULAR);
        complementar.setEspecie(EspecieCobranca.HORA);
        complementar.setComplemento(
                "Complementar do pre-pago " + servico.getEntradaN());
        complementar.setDataHoraEntrada(servico.getVencimentoPrePago());
        complementar.setDesconto(BigDecimal.ZERO);
        Servico novaConta = servicoRepository.save(complementar);

        return new ResultadoFechamento(
                salvo, fechar(novaConta.getId(), new FechamentoCommand(
                        servico.getDataHoraSaida(), null, null, null,
                        null, null, null, null, command.formaPagamento()))
                        .servico());
    }

    private List<String> listaVagas() {
        Integer capacidade = configuracaoUsecase.obter().getCapacidade();
        if (capacidade == null || capacidade < 1) {
            return vagaCatalog.todas();
        }
        List<String> vagas = new java.util.ArrayList<>(capacidade);
        for (int i = 0; i < capacidade; i++) {
            vagas.add((char) ('A' + i / 6) + String.valueOf(i % 6 + 1));
        }
        return vagas;
    }

    private String resolverVaga(String vaga) {
        List<String> vagas = listaVagas();
        if (StringUtils.hasText(vaga)) {
            String codigo = vaga.trim().toUpperCase();
            if (!vagas.contains(codigo)) {
                throw new NegocioException("Vaga inexistente: " + codigo);
            }
            if (servicoRepository.existsByVagaAndDataHoraSaidaIsNull(codigo)) {
                throw new NegocioException("Vaga " + codigo + " ocupada.");
            }
            return codigo;
        }
        return vagas.stream()
                .filter(v -> !servicoRepository.existsByVagaAndDataHoraSaidaIsNull(v))
                .findFirst()
                .orElse(null);
    }

    private void aplicarItens(Servico servico, EntradaCommand command, Configuracao config) {
        servico.setItens(command.itens());
        if (command.itens() != null) {
            BigDecimal padrao = switch (command.itens()) {
                case INTERNA -> config.getVrInterna();
                case EXTERNA -> config.getVrExterna();
                case COMPLETA -> config.getVrCompleta();
            };
            servico.setVrItens(command.vrItens() != null ? command.vrItens() : padrao);
        }
        if (command.comCera()) {
            servico.setVrCera(command.vrCera() != null ? command.vrCera() : config.getVrCera());
        }
        if (command.comMotor()) {
            servico.setVrMotor(command.vrMotor() != null ? command.vrMotor() : config.getVrMotor());
        }
        if (command.vrTerceiro() != null) {
            servico.setVrTerceiro(command.vrTerceiro());
        }
    }

    private Cliente resolverCliente(Long clienteId) {
        if (clienteId == null) {
            throw new NegocioException("Selecione o cliente convenio antes de fechar a entrada.");
        }
        return clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", clienteId));
    }

    private void recalcularTotais(Servico servico) {
        BigDecimal subTotal = Stream.of(
                        servico.getVrDiaria(), servico.getVrHora(), servico.getVrItens(),
                        servico.getVrCera(), servico.getVrMotor(), servico.getVrTerceiro())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        servico.setSubTotal(subTotal);
        BigDecimal desconto = servico.getDesconto() != null
                ? servico.getDesconto() : BigDecimal.ZERO;
        servico.setTotal(subTotal.subtract(desconto));
    }

    private void registrarRecebimento(Servico servico, NaturezaRecebimento natureza,
            String cliente, FormaPagamento formaPagamento) {
        Recebimento recebimento = new Recebimento();
        recebimento.setEntradaN(servico.getEntradaN());
        recebimento.setDataHora(LocalDateTime.now());
        recebimento.setCliente(cliente);
        recebimento.setNatureza(natureza);
        recebimento.setFormaPagamento(formaPagamento);
        recebimento.setValor(servico.getTotal() != null ? servico.getTotal() : BigDecimal.ZERO);
        recebimentoRepository.save(recebimento);
    }

    private void gerarContaReceber(Servico servico) {
        ContaReceber conta = new ContaReceber();
        conta.setData(LocalDateTime.now());
        conta.setSituacao(SituacaoConta.ABERTA);
        conta.setCliente(servico.getCliente());
        conta.setEntradaN(servico.getEntradaN());
        conta.setPlaca(servico.getPlaca());
        conta.setVeiculo(servico.getVeiculo());
        conta.setItens(servico.getItens() != null ? servico.getItens().name() : null);
        conta.setDataHoraEntrada(servico.getDataHoraEntrada());
        conta.setDataHoraSaida(servico.getDataHoraSaida());
        conta.setValor(servico.getTotal() != null ? servico.getTotal() : BigDecimal.ZERO);
        contaReceberRepository.save(conta);
    }
}
