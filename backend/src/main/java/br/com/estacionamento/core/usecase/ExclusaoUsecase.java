package br.com.estacionamento.core.usecase;

import br.com.estacionamento.core.entity.Exclusao;
import br.com.estacionamento.core.repository.ExclusaoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExclusaoUsecase {

    private final ExclusaoRepository repository;

    @Transactional(readOnly = true)
    public List<Exclusao> listar() {
        return repository.findAllByOrderByDataHoraExclusaoDesc();
    }
}
