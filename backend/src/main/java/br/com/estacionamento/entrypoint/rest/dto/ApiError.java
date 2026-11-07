package br.com.estacionamento.entrypoint.rest.dto;

import java.time.Instant;
import java.util.List;

public record ApiError(
        Instant instante,
        int status,
        String mensagem,
        String caminho,
        List<Violacao> violacoes) {

    public record Violacao(String campo, String mensagem) {}

    public static ApiError of(int status, String mensagem, String caminho) {
        return new ApiError(Instant.now(), status, mensagem, caminho, List.of());
    }

    public static ApiError of(int status, String mensagem, String caminho,
            List<Violacao> violacoes) {
        return new ApiError(Instant.now(), status, mensagem, caminho, violacoes);
    }
}
