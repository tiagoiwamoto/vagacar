package br.com.estacionamento.core.repository;

import br.com.estacionamento.core.entity.ContaReceber;
import br.com.estacionamento.core.entity.SituacaoConta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaReceberRepository extends JpaRepository<ContaReceber, Long> {

    @EntityGraph(attributePaths = "cliente")
    Optional<ContaReceber> findById(Long id);

    @EntityGraph(attributePaths = "cliente")
    List<ContaReceber> findBySituacaoOrderByDataDesc(SituacaoConta situacao);

    @EntityGraph(attributePaths = "cliente")
    List<ContaReceber> findAllByOrderByDataDesc();
}
