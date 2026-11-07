package br.com.estacionamento.core.error;

public class NegocioException extends RuntimeException {

    public NegocioException(String message) {
        super(message);
    }
}
