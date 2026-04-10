import {type ComputedRef, type Ref, computed, ref, watch} from "vue";

export type TransitionVariant = "brick-snap" | "brick-lift";
export type TransitionName = TransitionVariant | "brick-none";

interface PageTransitionConfig {
    /** Reactive reference to the current route path or name — used as the transition key */
    routeRef: Ref<{path: string}> | ComputedRef<{path: string}>;
    /** Optional: override the default variant selection */
    defaultVariant?: TransitionVariant;
}

interface UsePageTransition {
    /** The CSS transition name to bind to Vue's <Transition> component */
    transitionName: ComputedRef<TransitionName>;
    /** The key that triggers the transition when it changes */
    routeKey: ComputedRef<string>;
    /** The currently active variant */
    activeVariant: ComputedRef<TransitionVariant>;
    /** Whether reduced motion is preferred — disables all animation */
    prefersReducedMotion: Ref<boolean>;
    /** Override the variant for the next navigation */
    setVariant: (variant: TransitionVariant) => void;
    /** Navigate "back" — sets variant to brick-lift for the next transition */
    setBackNavigation: () => void;
}

const detectReducedMotion = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const usePageTransition = (config: PageTransitionConfig): UsePageTransition => {
    const prefersReducedMotion = ref(detectReducedMotion());
    const overrideVariant = ref<TransitionVariant | null>(null);
    const defaultVariant = config.defaultVariant ?? "brick-snap";

    if (typeof window !== "undefined") {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        mediaQuery.addEventListener("change", (event) => {
            prefersReducedMotion.value = event.matches;
        });
    }

    const activeVariant = computed<TransitionVariant>(() => {
        return overrideVariant.value ?? defaultVariant;
    });

    const transitionName = computed<TransitionName>(() => {
        if (prefersReducedMotion.value) return "brick-none";
        return activeVariant.value;
    });

    const routeKey = computed(() => config.routeRef.value.path);

    watch(routeKey, () => {
        overrideVariant.value = null;
    });

    const setVariant = (variant: TransitionVariant): void => {
        overrideVariant.value = variant;
    };

    const setBackNavigation = (): void => {
        overrideVariant.value = "brick-lift";
    };

    return {transitionName, routeKey, activeVariant, prefersReducedMotion, setVariant, setBackNavigation};
};
