#!/usr/bin/env python3
"""Compone las piezas instrumentales de fondo de los carruseles (música original, sin voz).

Piano, colchón de cuerdas suaves y, en el bosque, una flauta. Todo sintetizado aquí: no usa
muestras ni música de terceros, así que no tiene derechos ajenos ni problemas de copyright.

Uso:  python3 scripts/componer-musica.py            (escribe brand/musica/instrumental-*.wav)
      después: ffmpeg para normalizar y pasar a MP3 (lo hace este script si hay ffmpeg).
Requiere numpy y scipy.
"""
import os
import subprocess
import sys

import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
DIR = os.path.join(os.path.dirname(__file__), "..", "brand", "musica")

NOTAS = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
         "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def hz(nombre):
    """'A4' -> 440.0"""
    n, o = nombre[:-1], int(nombre[-1])
    return 440.0 * 2 ** ((NOTAS[n] + 12 * (o + 1) - 69) / 12)


def lowpass(x, fc, orden=2):
    sos = butter(orden, fc / (SR / 2), btype="low", output="sos")
    return sosfilt(sos, x, axis=0)


# ---------------------------------------------------------------- instrumentos

def piano(f, dur, vel, rng):
    """Piano sencillo: parciales algo inarmónicos, cada uno con su caída."""
    n = int(SR * (dur + 2.5))
    t = np.arange(n) / SR
    B = 0.00035
    out = np.zeros(n)
    for k in range(1, 11):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = (1 / k ** 1.25) * (0.6 + 0.4 * vel)
        caida = 1.1 + 0.55 * k + f / 600
        out += amp * np.exp(-t * caida) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28))
    ataque = np.minimum(1, t / 0.004)
    # Al soltar la tecla se apaga del todo en 0,4 s.
    suelta = np.clip(1 - (t - dur) / 0.4, 0, 1)
    martillo = rng.normal(0, 1, n) * np.exp(-t * 90) * 0.02 * vel
    return (out * ataque * suelta + martillo) * vel


def cuerdas(f, dur):
    """Colchón: ondas de sierra suavizadas y desafinadas, entrada y salida lentas."""
    n = int(SR * (dur + 3))
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        fd = f * 2 ** (det / 12)
        for k in range(1, 7):
            out += (1 / k) * np.sin(2 * np.pi * fd * k * t + k)
    env = np.minimum(1, t / 2.2) * np.clip(1 - (t - dur) / 2.8, 0, 1)
    return lowpass(out * env, 1800) * 0.06


def flauta(f, dur, rng):
    n = int(SR * (dur + 1.2))
    t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 4.8 * t) * np.minimum(1, t / 0.8)
    fase = 2 * np.pi * f * np.cumsum(vib) / SR
    tono = np.sin(fase) + 0.18 * np.sin(2 * fase) + 0.05 * np.sin(3 * fase)
    soplo = lowpass(rng.normal(0, 1, n), 2500) * 0.05
    env = np.minimum(1, t / 0.35) * np.clip(1 - (t - dur) / 0.9, 0, 1)
    return (tono + soplo) * env * 0.16


# ---------------------------------------------------------------- mezcla

class Pista:
    def __init__(self, segundos):
        self.buf = np.zeros((int(SR * (segundos + 8)), 2))

    def poner(self, sonido, t0, pan=0.0, gan=1.0):
        i = int(t0 * SR)
        j = min(len(self.buf), i + len(sonido))
        s = sonido[: j - i] * gan
        self.buf[i:j, 0] += s * np.sqrt(0.5 * (1 - pan))
        self.buf[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))


def reverb(x, rt=3.2, mezcla=0.32, seed=7):
    rng = np.random.default_rng(seed)
    n = int(SR * rt)
    t = np.arange(n) / SR
    ir = np.stack([rng.normal(0, 1, n), rng.normal(0, 1, n)], axis=1) * np.exp(-t * 6.9 / rt)[:, None]
    ir = lowpass(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    mojado = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - mezcla) + mojado * mezcla * 1.6


def acorde(nombres):
    return [hz(n) for n in nombres]


def componer(nombre, progresion, bpm, segundos, melodia_escala, seed, flauta_on=False,
             registro_mel=("A4", "E5"), densidad=0.55, cuerdas_gan=1.0):
    rng = np.random.default_rng(seed)
    p = Pista(segundos)
    negra = 60 / bpm
    compas = 4 * negra
    t = 0.0
    c = 0
    escala = [hz(n) for n in melodia_escala]
    lo, hi = hz(registro_mel[0]), hz(registro_mel[1])
    idx = len(escala) // 2
    while t < segundos:
        bajo, *voces = progresion[c % len(progresion)]
        # colchón del acorde
        for f in acorde(voces):
            p.poner(cuerdas(f, compas), t, pan=rng.uniform(-0.4, 0.4), gan=cuerdas_gan)
        p.poner(cuerdas(hz(bajo), compas) * 0.35, t)
        # bajo de piano y arpegio lento
        p.poner(piano(hz(bajo) * 2, compas * 0.95, 0.5, rng), t, pan=-0.25, gan=0.32)
        arp = [f * 2 for f in acorde(voces)]  # una octava arriba: más claro en el móvil
        for b in range(4):
            if rng.random() < 0.8:
                f = arp[(b + c) % len(arp)]
                p.poner(piano(f, negra * 1.8, rng.uniform(0.3, 0.42), rng), t + b * negra + rng.uniform(0, 0.02),
                        pan=-0.1, gan=0.42)
        # melodía escasa: notas de la escala que caminan sin saltos grandes
        if c >= 1:
            pos = 0.0
            while pos < 4:
                largo = rng.choice([1, 1.5, 2, 2]) if rng.random() < densidad else 0
                if largo:
                    idx = int(np.clip(idx + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 0, len(escala) - 1))
                    f = escala[idx]
                    while f > hi:
                        f /= 2
                    while f < lo:
                        f *= 2
                    if flauta_on and c % 4 in (2, 3):
                        p.poner(flauta(f, largo * negra * 1.1, rng), t + pos * negra, pan=0.2, gan=0.9)
                    else:
                        p.poner(piano(f, largo * negra, rng.uniform(0.5, 0.68), rng), t + pos * negra,
                                pan=0.2, gan=0.75)
                    pos += largo
                else:
                    pos += 1
        t += compas
        c += 1
    x = p.buf[: int(SR * segundos)]
    # Sin graves profundos: en el altavoz del móvil solo ensucian.
    x = sosfilt(butter(2, 110 / (SR / 2), btype="high", output="sos"), x, axis=0)
    x = reverb(x)
    # entrada y salida suaves
    n = len(x)
    env = np.ones(n)
    env[: SR * 2] = np.linspace(0, 1, SR * 2)
    env[-SR * 4:] = np.linspace(1, 0, SR * 4)
    x *= env[:, None]
    x /= np.max(np.abs(x)) * 1.12
    wav = os.path.join(DIR, f"{nombre}.wav")
    from scipy.io import wavfile
    wavfile.write(wav, SR, (x * 32767).astype(np.int16))
    mp3 = os.path.join(DIR, f"{nombre}.mp3")
    try:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", "loudnorm=I=-18:TP=-2:LRA=9",
                        "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True)
        os.remove(wav)
        print("✓", mp3)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("✓", wav, "(sin ffmpeg: queda en WAV)")


PIEZAS = {
    # Fénix: cálida y luminosa, re mayor (I–vi–IV–V con colores de novena).
    "instrumental-fenix": dict(
        progresion=[("D2", "D3", "F#3", "A3", "E4"), ("B1", "B2", "D3", "F#3", "A3"),
                    ("G1", "G2", "B2", "D3", "A3"), ("A1", "A2", "C#3", "E3", "B3")],
        bpm=64, melodia_escala=["D4", "E4", "F#4", "A4", "B4", "D5", "E5", "F#5"], seed=11, cuerdas_gan=0.65),
    # Bosque: mi dórico, bordón grave y flauta.
    "instrumental-bosque": dict(
        progresion=[("E2", "E3", "B3", "D4", "F#4"), ("C2", "C3", "G3", "B3", "E4"),
                    ("G1", "G2", "D3", "B3", "F#4"), ("D2", "D3", "A3", "C#4", "F#4")],
        bpm=58, melodia_escala=["E4", "F#4", "G4", "A4", "B4", "C#5", "D5", "E5"], seed=23, flauta_on=True,
        registro_mel=("B4", "E5"), densidad=0.45),
    # Papel: solo piano íntimo, la menor (para el autor y los carruseles mixtos).
    "instrumental-papel": dict(
        progresion=[("A1", "A2", "C3", "E3", "B3"), ("F1", "F2", "A2", "C3", "G3"),
                    ("C2", "C3", "E3", "G3", "D4"), ("G1", "G2", "B2", "D3", "A3")],
        bpm=60, melodia_escala=["A3", "B3", "C4", "E4", "G4", "A4", "B4", "C5", "E5"], seed=5,
        registro_mel=("E4", "C5"), densidad=0.5, cuerdas_gan=0.55),
}

if __name__ == "__main__":
    elegidas = sys.argv[1:] or list(PIEZAS)
    for nombre in elegidas:
        componer(nombre, segundos=120, **PIEZAS[nombre])
