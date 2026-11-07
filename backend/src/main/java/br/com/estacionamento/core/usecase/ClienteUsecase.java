package br.com.estacionamento.core.usecase;

import br.com.estacionamento.core.entity.Cliente;
import br.com.estacionamento.core.error.NegocioException;
import br.com.estacionamento.core.error.RecursoNaoEncontradoException;
import br.com.estacionamento.core.repository.ClienteRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteUsecase {

    private final ClienteRepository repository;

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Cliente buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", id));
    }

    @Transactional
    public Cliente criar(Cliente cliente) {
        repository.findByNomeFantasiaIgnoreCase(cliente.getNomeFantasia())
                .ifPresent(existente -> {
                    throw new NegocioException(
                            "Ja existe cliente com o nome fantasia informado.");
                });
        cliente.setId(null);
        cliente.setDataCadastro(LocalDate.now());
        return repository.save(cliente);
    }

    @Transactional
    public Cliente atualizar(Long id, Cliente dados) {
        Cliente cliente = buscar(id);
        cliente.setNome(dados.getNome());
        cliente.setNomeFantasia(dados.getNomeFantasia());
        cliente.setCgc(dados.getCgc());
        cliente.setIe(dados.getIe());
        cliente.setEndereco(dados.getEndereco());
        cliente.setBairro(dados.getBairro());
        cliente.setCidade(dados.getCidade());
        cliente.setCep(dados.getCep());
        cliente.setUf(dados.getUf());
        cliente.setFone(dados.getFone());
        cliente.setFoneFax(dados.getFoneFax());
        cliente.setContato(dados.getContato());
        cliente.setEmail(dados.getEmail());
        return repository.save(cliente);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscar(id));
    }
}
