package br.com.estacionamento.core.entity;

public enum EspecieCobranca {

    HORA("H"),
    DIARIA("D");

    private final String codigoLegado;

    EspecieCobranca(String codigoLegado) {
        this.codigoLegado = codigoLegado;
    }

    public String codigoLegado() {
        return codigoLegado;
    }
}
