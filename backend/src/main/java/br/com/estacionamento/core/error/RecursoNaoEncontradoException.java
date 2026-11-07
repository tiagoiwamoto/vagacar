package br.com.estacionamento.core.error;

public class RecursoNaoEncontradoException extends NegocioException {

    public RecursoNaoEncontradoException(String recurso, Object identificador) {
        super(recurso + " nao encontrado: " + identificador);
    }
}
