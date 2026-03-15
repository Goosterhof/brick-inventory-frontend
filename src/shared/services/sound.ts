import type {ComputedRef} from "vue";

import {computed, ref} from "vue";

import type {StorageService} from "./storage";

/** @public */
export type SoundType = "snap" | "pull" | "cascade" | "thud";

export interface SoundService {
    isEnabled: ComputedRef<boolean>;
    toggle: () => void;
    play: (sound: SoundType) => void;
}

const STORAGE_KEY = "sound-enabled";
const VOLUME = 0.3;

const prefersReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type SoundSynthesizer = (context: AudioContext) => void;

const synthesizeSnap: SoundSynthesizer = (context) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 800;
    gain.gain.setValueAtTime(VOLUME, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.08);
};

const synthesizePull: SoundSynthesizer = (context) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 400;
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.linearRampToValueAtTime(VOLUME, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.12);
};

const synthesizeCascade: SoundSynthesizer = (context) => {
    for (let i = 0; i < 4; i++) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.connect(gain);
        gain.connect(context.destination);

        const offset = i * 0.05;
        oscillator.frequency.value = 800;
        gain.gain.setValueAtTime(VOLUME, context.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.08);

        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.08);
    }
};

const synthesizeThud: SoundSynthesizer = (context) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 200;
    gain.gain.setValueAtTime(VOLUME, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.06);
};

const synthesizers: Record<SoundType, SoundSynthesizer> = {
    snap: synthesizeSnap,
    pull: synthesizePull,
    cascade: synthesizeCascade,
    thud: synthesizeThud,
};

export const createSoundService = (storageService: StorageService): SoundService => {
    const userEnabled = ref<boolean>(storageService.get<boolean>(STORAGE_KEY) ?? false);
    let audioContext: AudioContext | null = null;

    const isEnabled = computed(() => userEnabled.value && !prefersReducedMotion());

    const toggle = (): void => {
        userEnabled.value = !userEnabled.value;
        storageService.put(STORAGE_KEY, userEnabled.value);
    };

    const play = (sound: SoundType): void => {
        if (!isEnabled.value) return;

        if (audioContext) {
            void audioContext.close();
        }

        audioContext = new AudioContext();
        synthesizers[sound](audioContext);
    };

    return {isEnabled, toggle, play};
};
