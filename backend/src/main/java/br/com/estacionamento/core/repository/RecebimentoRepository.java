package br.com.estacionamento.core.repository;

import br.com.estacionamento.core.entity.Recebimento;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecebimentoRepository extends JpaRepository<Recebimento, Long> {

    List<Recebimento> findByEntradaN(Long entradaN);

    void deleteByEntradaN(Long entradaN);

    List<Recebimento> findByDataHoraBetweenOrderByDataHoraDesc(
            LocalDateTime inicio, LocalDateTime fim);
}
