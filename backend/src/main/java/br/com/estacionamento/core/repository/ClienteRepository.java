package br.com.estacionamento.core.repository;

import br.com.estacionamento.core.entity.Cliente;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByNomeFantasiaIgnoreCase(String nomeFantasia);
}
