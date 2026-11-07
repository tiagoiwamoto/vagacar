package br.com.estacionamento.core.repository;

import br.com.estacionamento.core.entity.Exclusao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExclusaoRepository extends JpaRepository<Exclusao, Long> {

    List<Exclusao> findAllByOrderByDataHoraExclusaoDesc();
}
