package br.com.estacionamento.entrypoint.rest.dto;

import br.com.estacionamento.core.entity.Cliente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public final class ClienteDtos {

    private ClienteDtos() {
    }

    public record ClienteRequest(
            String nome,
            @NotBlank String nomeFantasia,
            String cgc,
            String ie,
            String endereco,
            String bairro,
            String cidade,
            String cep,
            @Size(max = 2) String uf,
            String fone,
            String foneFax,
            String contato,
            String email) {

        public Cliente toEntity() {
            Cliente c = new Cliente();
            c.setNome(nome);
            c.setNomeFantasia(nomeFantasia);
            c.setCgc(cgc);
            c.setIe(ie);
            c.setEndereco(endereco);
            c.setBairro(bairro);
            c.setCidade(cidade);
            c.setCep(cep);
            c.setUf(uf);
            c.setFone(fone);
            c.setFoneFax(foneFax);
            c.setContato(contato);
            c.setEmail(email);
            return c;
        }
    }

    public record ClienteResponse(
            Long id,
            String nome,
            String nomeFantasia,
            String cgc,
            String ie,
            String endereco,
            String bairro,
            String cidade,
            String cep,
            String uf,
            String fone,
            String foneFax,
            String contato,
            String email,
            LocalDate dataCadastro) {

        public static ClienteResponse of(Cliente c) {
            return new ClienteResponse(
                    c.getId(), c.getNome(), c.getNomeFantasia(), c.getCgc(),
                    c.getIe(), c.getEndereco(), c.getBairro(), c.getCidade(),
                    c.getCep(), c.getUf(), c.getFone(), c.getFoneFax(),
                    c.getContato(), c.getEmail(), c.getDataCadastro());
        }
    }
}
