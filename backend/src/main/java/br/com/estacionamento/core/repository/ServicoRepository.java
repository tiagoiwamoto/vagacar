package br.com.estacionamento.core.repository;

import br.com.estacionamento.core.entity.Servico;
import br.com.estacionamento.core.entity.TipoServico;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    @EntityGraph(attributePaths = "cliente")
    Optional<Servico> findByEntradaN(Long entradaN);

    @EntityGraph(attributePaths = "cliente")
    Optional<Servico> findById(Long id);

    @EntityGraph(attributePaths = "cliente")
    List<Servico> findAll();

    @EntityGraph(attributePaths = "cliente")
    List<Servico> findByDataHoraSaidaIsNullOrderByDataHoraEntradaDesc();

    @EntityGraph(attributePaths = "cliente")
    List<Servico> findByDataHoraEntradaBetweenOrderByDataHoraEntradaDesc(
            LocalDateTime inicio, LocalDateTime fim);

    List<Servico> findByTipoAndDataHoraEntradaBetween(
            TipoServico tipo, LocalDateTime inicio, LocalDateTime fim);

    boolean existsByPlacaIgnoreCaseAndDataHoraSaidaIsNull(String placa);

    boolean existsByVagaAndDataHoraSaidaIsNull(String vaga);

    @Query("select coalesce(max(s.entradaN), 0) from Servico s")
    Long maxEntradaN();
}
