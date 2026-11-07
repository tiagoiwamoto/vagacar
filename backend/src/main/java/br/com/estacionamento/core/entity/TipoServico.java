package br.com.estacionamento.core.entity;

public enum TipoServico {

    PARTICULAR("P"),
    PRE_PAGO("G"),
    CONVENIO("C");

    private final String codigoLegado;

    TipoServico(String codigoLegado) {
        this.codigoLegado = codigoLegado;
    }

    public String codigoLegado() {
        return codigoLegado;
    }
}
