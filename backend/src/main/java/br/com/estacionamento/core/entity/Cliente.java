package br.com.estacionamento.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cliente")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(nullable = false)
    private String nomeFantasia;

    private String cgc;

    private String ie;

    private String endereco;

    private String bairro;

    private String cidade;

    private String cep;

    @Column(length = 2)
    private String uf;

    private String fone;

    private String foneFax;

    private String contato;

    private String email;

    private LocalDate dataCadastro;
}
