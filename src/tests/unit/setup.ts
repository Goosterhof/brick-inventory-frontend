import {config} from "@vue/test-utils";
import {vi} from "vitest";

config.global.renderStubDefaultSlot = true;

/**
 * Global auto-mocks for heavy third-party packages.
 *
 * These packages have expensive barrel exports that inflate test collect duration
 * when imported transitively through components. Auto-mocking them here prevents
 * the import chain from executing regardless of whether individual tests remember
 * to mock them. See ADR-010 for rationale.
 */
vi.mock("@phosphor-icons/vue");
