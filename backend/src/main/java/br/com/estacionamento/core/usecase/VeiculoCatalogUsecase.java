package br.com.estacionamento.core.usecase;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class VeiculoCatalogUsecase {

    private static final Duration CACHE_TTL = Duration.ofHours(24);

    public record Item(String codigo, String nome) {}

    private final RestClient restClient;
    private final AtomicReference<Instant> marcasCacheTime = new AtomicReference<>();
    private final AtomicReference<List<Item>> marcasCache = new AtomicReference<>(List.of());
    private final Map<String, CacheEntry> modelosCache = new ConcurrentHashMap<>();

    private record CacheEntry(Instant instante, List<Item> itens) {}

    public VeiculoCatalogUsecase(
            @Value("${estacionamento.fipe.base-url:https://parallelum.com.br/fipe/api/v1}")
            String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<Item> marcas() {
        if (expirado(marcasCacheTime.get())) {
            try {
                List<Item> marcas = restClient.get()
                        .uri("/carros/marcas")
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});
                if (marcas != null && !marcas.isEmpty()) {
                    marcasCache.set(marcas);
                    marcasCacheTime.set(Instant.now());
                }
            } catch (Exception ignored) {
                // mantem cache anterior ou fallback
            }
        }
        List<Item> cache = marcasCache.get();
        return cache.isEmpty() ? marcasFallback() : cache;
    }

    public List<Item> modelos(String codigoMarca) {
        CacheEntry entry = modelosCache.get(codigoMarca);
        if (entry == null || expirado(entry.instante())) {
            try {
                record ModelosResp(List<Item> modelos) {}
                ModelosResp resp = restClient.get()
                        .uri("/carros/marcas/{m}/modelos", codigoMarca)
                        .retrieve()
                        .body(ModelosResp.class);
                if (resp != null && resp.modelos() != null && !resp.modelos().isEmpty()) {
                    modelosCache.put(codigoMarca,
                            new CacheEntry(Instant.now(), resp.modelos()));
                }
            } catch (Exception ignored) {
                // fallback abaixo
            }
            entry = modelosCache.get(codigoMarca);
        }
        return entry != null ? entry.itens() : modelosFallback();
    }

    private boolean expirado(Instant instante) {
        return instante == null
                || instante.plus(CACHE_TTL).isBefore(Instant.now());
    }

    private List<Item> marcasFallback() {
        return List.of(
                new Item("F1", "Fiat"), new Item("F2", "Volkswagen"),
                new Item("F3", "Chevrolet"), new Item("F4", "Ford"),
                new Item("F5", "Toyota"), new Item("F6", "Honda"),
                new Item("F7", "Hyundai"), new Item("F8", "Nissan"),
                new Item("F9", "Renault"), new Item("F10", "Jeep"),
                new Item("F11", "Peugeot"), new Item("F12", "Citroën"));
    }

    private List<Item> modelosFallback() {
        return List.of(
                new Item("M1", "Argo"), new Item("M2", "Mobi"),
                new Item("M3", "Uno"), new Item("M4", "Strada"),
                new Item("M5", "Toro"), new Item("M6", "Pulse"),
                new Item("M7", "Gol"), new Item("M8", "Polo"),
                new Item("M9", "Virtus"), new Item("M10", "T-Cross"),
                new Item("M11", "Saveiro"), new Item("M12", "Onix"),
                new Item("M13", "Onix Plus"), new Item("M14", "Tracker"),
                new Item("M15", "Spin"), new Item("M16", "Corolla"),
                new Item("M17", "Corolla Cross"), new Item("M18", "Hilux"),
                new Item("M19", "Civic"), new Item("M20", "HR-V"),
                new Item("M21", "City"), new Item("M22", "HB20"),
                new Item("M23", "HB20S"), new Item("M24", "Creta"),
                new Item("M25", "Kicks"), new Item("M26", "Versa"),
                new Item("M27", "Kwid"), new Item("M28", "Sandero"),
                new Item("M29", "Logan"), new Item("M30", "Duster"),
                new Item("M31", "Renegade"), new Item("M32", "Compass"),
                new Item("M33", "208"), new Item("M34", "2008"),
                new Item("M35", "C3"), new Item("M36", "Ka"),
                new Item("M37", "EcoSport"), new Item("M38", "Ranger"),
                new Item("M39", "Fox"), new Item("M40", "Fiesta"));
    }
}
