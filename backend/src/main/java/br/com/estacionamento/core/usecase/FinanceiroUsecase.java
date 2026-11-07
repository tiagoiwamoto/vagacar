package br.com.estacionamento.core.usecase;

import br.com.estacionamento.core.entity.ContaReceber;
import br.com.estacionamento.core.entity.FormaPagamento;
import br.com.estacionamento.core.entity.NaturezaRecebimento;
import br.com.estacionamento.core.entity.Recebimento;
import br.com.estacionamento.core.entity.SituacaoConta;
import br.com.estacionamento.core.error.NegocioException;
import br.com.estacionamento.core.error.RecursoNaoEncontradoException;
import br.com.estacionamento.core.repository.ContaReceberRepository;
import br.com.estacionamento.core.repository.RecebimentoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FinanceiroUsecase {

    private final RecebimentoRepository recebimentoRepository;
    private final ContaReceberRepository contaReceberRepository;

    public record ResumoCaixa(
            BigDecimal total,
            long quantidade,
            Map<String, BigDecimal> porNatureza,
            Map<String, BigDecimal> porFormaPagamento) {}

    @Transactional(readOnly = true)
    public List<Recebimento> listarRecebimentos(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio != null && fim != null) {
            return recebimentoRepository.findByDataHoraBetweenOrderByDataHoraDesc(inicio, fim);
        }
        return recebimentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ResumoCaixa resumoCaixa(LocalDate inicio, LocalDate fim) {
        LocalDateTime de = (inicio != null ? inicio : LocalDate.now()).atStartOfDay();
        LocalDateTime ate = (fim != null ? fim : LocalDate.now()).plusDays(1).atStartOfDay();

        List<Recebimento> recebimentos =
                recebimentoRepository.findByDataHoraBetweenOrderByDataHoraDesc(de, ate);

        Map<String, BigDecimal> porNatureza = recebimentos.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getNatureza().name(),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO,
                                Recebimento::getValor, BigDecimal::add)));

        Map<String, BigDecimal> porForma = recebimentos.stream()
                .filter(r -> r.getFormaPagamento() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getFormaPagamento().name(),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO,
                                Recebimento::getValor, BigDecimal::add)));

        BigDecimal total = recebimentos.stream()
                .map(Recebimento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ResumoCaixa(total, recebimentos.size(), porNatureza, porForma);
    }

    @Transactional(readOnly = true)
    public List<ContaReceber> listarContas(SituacaoConta situacao) {
        if (situacao != null) {
            return contaReceberRepository.findBySituacaoOrderByDataDesc(situacao);
        }
        return contaReceberRepository.findAllByOrderByDataDesc();
    }

    @Transactional
    public ContaReceber pagarConta(Long id, FormaPagamento formaPagamento) {
        ContaReceber conta = contaReceberRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta a receber", id));
        if (conta.getSituacao() == SituacaoConta.PAGA) {
            throw new NegocioException("Esta fatura ja foi paga.");
        }
        if (formaPagamento == null) {
            throw new NegocioException("Informe a forma de pagamento.");
        }

        conta.setSituacao(SituacaoConta.PAGA);
        conta.setDataHoraPagamento(LocalDateTime.now());

        Recebimento recebimento = new Recebimento();
        recebimento.setEntradaN(conta.getEntradaN());
        recebimento.setDataHora(conta.getDataHoraPagamento());
        recebimento.setCliente(conta.getCliente() != null
                ? conta.getCliente().getNomeFantasia() : "Convenio");
        recebimento.setNatureza(NaturezaRecebimento.FATURA);
        recebimento.setFormaPagamento(formaPagamento);
        recebimento.setValor(conta.getValor());
        recebimentoRepository.save(recebimento);

        return contaReceberRepository.save(conta);
    }
}
