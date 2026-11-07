package br.com.estacionamento.core.usecase;

import br.com.estacionamento.core.entity.Configuracao;
import br.com.estacionamento.core.repository.ConfiguracaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracaoUsecase {

    private final ConfiguracaoRepository repository;

    @Transactional(readOnly = true)
    public Configuracao obter() {
        return repository.findById(Configuracao.ID_UNICO)
                .orElseGet(Configuracao::new);
    }

    @Transactional
    public Configuracao salvar(Configuracao configuracao) {
        configuracao.setId(Configuracao.ID_UNICO);
        return repository.save(configuracao);
    }
}
