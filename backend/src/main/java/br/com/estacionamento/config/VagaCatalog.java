package br.com.estacionamento.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class VagaCatalog {

    private final List<String> vagas;

    public VagaCatalog(@Value("${estacionamento.vagas:A1,A2,A3,A4,A5,A6,B1,B2,B3,B4,B5,B6,C1,C2,C3,C4,C5,C6}")
            List<String> vagas) {
        this.vagas = vagas;
    }

    public List<String> todas() {
        return vagas;
    }
}
