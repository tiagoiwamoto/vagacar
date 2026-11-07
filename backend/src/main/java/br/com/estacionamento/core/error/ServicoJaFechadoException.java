package br.com.estacionamento.core.error;

public class ServicoJaFechadoException extends NegocioException {

    public ServicoJaFechadoException(Long entradaN) {
        super("Esta conta ja foi fechada. Nao e possivel altera-la. EntradaN=" + entradaN);
    }
}
