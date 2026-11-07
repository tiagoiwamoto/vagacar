package br.com.estacionamento.entrypoint.rest;

import br.com.estacionamento.core.error.NegocioException;
import br.com.estacionamento.core.error.RecursoNaoEncontradoException;
import br.com.estacionamento.entrypoint.rest.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiError> naoEncontrado(RecursoNaoEncontradoException ex,
            HttpServletRequest request) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ApiError> negocio(NegocioException ex,
            HttpServletRequest request) {
        return erro(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacao(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<ApiError.Violacao> violacoes = ex.getBindingResult()
                .getFieldErrors().stream()
                .map(f -> new ApiError.Violacao(f.getField(), f.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest().body(ApiError.of(
                HttpStatus.BAD_REQUEST.value(), "Dados invalidos.",
                request.getRequestURI(), violacoes));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> mensagemIlegivel(HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        log.debug("Falha de leitura do corpo", ex);
        return erro(HttpStatus.BAD_REQUEST, "Corpo da requisicao invalido.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> generico(Exception ex, HttpServletRequest request) {
        log.error("Falha nao tratada em {}", request.getRequestURI(), ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno.", request);
    }

    private ResponseEntity<ApiError> erro(HttpStatus status, String mensagem,
            HttpServletRequest request) {
        return ResponseEntity.status(status).body(
                ApiError.of(status.value(), mensagem, request.getRequestURI()));
    }
}
