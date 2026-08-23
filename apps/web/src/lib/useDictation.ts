"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Dictado por voz para la captura de campo.
 *
 * "Escribe como hablas en campo": un ingeniero con casco y guantes no teclea,
 * dicta. Usamos la Web Speech API del navegador (SpeechRecognition), en
 * español de México, con resultados en vivo (interim) para que el texto
 * aparezca mientras habla. Todo ocurre en el cliente; no sale audio del
 * dispositivo por nuestra cuenta.
 *
 * No hay tipos oficiales de SpeechRecognition en el DOM lib, así que los
 * declaramos de forma mínima.
 */

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface Dictation {
  supported: boolean;
  listening: boolean;
  /** Texto provisional que aún no se confirma (se muestra en gris). */
  interim: string;
  /** Último error legible, si lo hubo. */
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * @param onFinal  se llama con cada fragmento CONFIRMADO; el consumidor lo
 *                 concatena a las notas.
 */
export function useDictation(onFinal: (text: string) => void): Dictation {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  const wantOnRef = useRef(false);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    setSupported(getCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    wantOnRef.current = false;
    setListening(false);
    setInterim("");
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("Tu navegador no permite dictado por voz.");
      return;
    }
    setError(null);
    const rec = new Ctor();
    rec.lang = "es-MX";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) {
          const clean = txt.trim();
          if (clean) onFinalRef.current(clean);
        } else {
          interimText += txt;
        }
      }
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Permiso de micrófono denegado.");
        wantOnRef.current = false;
        setListening(false);
      } else {
        setError("No se pudo escuchar. Intenta de nuevo.");
      }
    };

    rec.onend = () => {
      setInterim("");
      // El reconocimiento se corta solo tras silencios; si el usuario sigue
      // queriendo dictar, lo reanudamos para una experiencia continua.
      if (wantOnRef.current) {
        try {
          rec.start();
        } catch {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    wantOnRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("No se pudo iniciar el dictado.");
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      wantOnRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  return { supported, listening, interim, error, start, stop, toggle };
}
