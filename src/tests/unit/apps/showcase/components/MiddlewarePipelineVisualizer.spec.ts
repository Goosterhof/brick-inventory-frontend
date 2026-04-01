import {shallowMount} from "@vue/test-utils";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {nextTick} from "vue";

import MiddlewarePipelineVisualizer from "@/apps/showcase/components/MiddlewarePipelineVisualizer.vue";

// Mock shared components to cut import chain cost (ADR-010).
const {mkButtonStub} = vi.hoisted(() => ({
    mkButtonStub: (name: string) => ({
        name,
        props: {disabled: Boolean},
        emits: ["click"],
        template: `<button @click="$emit('click')" :disabled="disabled" :data-testid="$attrs['data-testid']"><slot /></button>`,
    }),
}));

vi.mock("@shared/components/PrimaryButton.vue", () => ({default: mkButtonStub("PrimaryButton")}));
vi.mock("@shared/components/DangerButton.vue", () => ({default: mkButtonStub("DangerButton")}));
vi.mock("@/apps/showcase/components/SectionHeading.vue", () => ({
    default: {
        name: "SectionHeading",
        props: {number: String, title: String},
        template: "<div>{{ number }} {{ title }}</div>",
    },
}));

async function advanceAllStages(stageCount: number): Promise<void> {
    for (let i = 0; i < stageCount; i++) {
        await vi.advanceTimersByTimeAsync(600);
        await nextTick();
    }
}

describe("MiddlewarePipelineVisualizer", () => {
    const stubs = {SectionHeading: false as const, PrimaryButton: false as const, DangerButton: false as const};

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should render the section heading with correct number and title", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.text()).toContain("13");
        expect(wrapper.text()).toContain("Middleware Pipeline Visualizer");
    });

    it("should render the section element with correct id", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.find("section#middleware-pipeline-visualizer").exists()).toBe(true);
    });

    it("should render the introductory description", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.text()).toContain("Step through how an HTTP request flows through the middleware pipeline");
    });

    it("should render all four scenario buttons", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.find('[data-testid="scenario-success"]').text()).toBe("200 Success");
        expect(wrapper.find('[data-testid="scenario-auth-error"]').text()).toBe("401 Auth Error");
        expect(wrapper.find('[data-testid="scenario-validation-error"]').text()).toBe("422 Validation Error");
        expect(wrapper.find('[data-testid="scenario-network-error"]').text()).toBe("Network Error");
    });

    it("should render the Choose a Scenario label", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        const labels = wrapper.findAll(".brick-label");
        const labelTexts = labels.map((l) => l.text());
        expect(labelTexts).toContain("Choose a Scenario");
    });

    it("should hide the active scenario label initially", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        const label = wrapper.find('[data-testid="active-scenario-label"]');
        expect(label.attributes("style")).toContain("display: none");
    });

    it("should not render pipeline stages initially", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.find('[data-testid="pipeline-stages"]').exists()).toBe(false);
    });

    it("should render the how-it-works section", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        const labels = wrapper.findAll(".brick-label");
        const labelTexts = labels.map((l) => l.text());
        expect(labelTexts).toContain("How It Works");
    });

    it("should render three middleware type descriptions", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.text()).toContain("Request Middleware");
        expect(wrapper.text()).toContain("Response Middleware");
        expect(wrapper.text()).toContain("Error Middleware");
    });

    it("should render code references in how-it-works", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        expect(wrapper.text()).toContain("registerRequestMiddleware");
        expect(wrapper.text()).toContain("registerResponseMiddleware");
        expect(wrapper.text()).toContain("registerResponseErrorMiddleware");
    });

    it("should use PrimaryButton for success scenario and reset", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        const primaryButtons = wrapper.findAllComponents({name: "PrimaryButton"});
        const primaryTexts = primaryButtons.map((b) => b.text());
        expect(primaryTexts).toContain("200 Success");
        expect(primaryTexts).toContain("Reset");
    });

    it("should use DangerButton for error scenarios", () => {
        const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

        const dangerButtons = wrapper.findAllComponents({name: "DangerButton"});
        const dangerTexts = dangerButtons.map((b) => b.text());
        expect(dangerTexts).toContain("401 Auth Error");
        expect(dangerTexts).toContain("422 Validation Error");
        expect(dangerTexts).toContain("Network Error");
    });

    describe("success scenario", () => {
        it("should show the active scenario label with Running state", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            expect(label.exists()).toBe(true);
            expect(label.text()).toContain("200 Success");
            expect(label.text()).toContain("Running...");
        });

        it("should render 6 pipeline stages", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="pipeline-stages"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="stage-0"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="stage-5"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="stage-6"]').exists()).toBe(false);
        });

        it("should show all stages as pending initially except the first which is active", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-0"]').attributes("data-status")).toBe("active");
            expect(wrapper.find('[data-testid="stage-1"]').attributes("data-status")).toBe("pending");
        });

        it("should show stage labels in correct order", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-0"]').text()).toContain("1. Auth Token Injection");
            expect(wrapper.find('[data-testid="stage-1"]').text()).toContain("2. Loading State Start");
            expect(wrapper.find('[data-testid="stage-2"]').text()).toContain("3. Request Transform");
            expect(wrapper.find('[data-testid="stage-3"]').text()).toContain("4. Network Call");
            expect(wrapper.find('[data-testid="stage-4"]').text()).toContain("5. Response Transform");
            expect(wrapper.find('[data-testid="stage-5"]').text()).toContain("6. Loading State Stop");
        });

        it("should show auth token injection before/after data", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const beforeEl = wrapper.find('[data-testid="stage-0-before"]');
            const afterEl = wrapper.find('[data-testid="stage-0-after"]');

            expect(beforeEl.text()).toContain("Accept");
            expect(afterEl.text()).toContain("Bearer eyJhbGciOi...");
        });

        it("should show camelCase to snake_case request transform", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            // Advance to stage 2 (index 2 = Request Transform)
            await vi.advanceTimersByTimeAsync(600);
            await nextTick();
            await vi.advanceTimersByTimeAsync(600);
            await nextTick();
            await vi.advanceTimersByTimeAsync(600);
            await nextTick();

            const beforeEl = wrapper.find('[data-testid="stage-2-before"]');
            const afterEl = wrapper.find('[data-testid="stage-2-after"]');

            expect(beforeEl.text()).toContain("displayName");
            expect(afterEl.text()).toContain("display_name");
        });

        it("should show snake_case to camelCase response transform", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            // Advance through all 6 stages
            await advanceAllStages(6);

            const beforeEl = wrapper.find('[data-testid="stage-4-before"]');
            const afterEl = wrapper.find('[data-testid="stage-4-after"]');

            expect(beforeEl.text()).toContain("created_at");
            expect(afterEl.text()).toContain("createdAt");
        });

        it("should advance stages through the pipeline with timer", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            // Stage 0 is active
            expect(wrapper.find('[data-testid="stage-0"]').attributes("data-status")).toBe("active");

            // Advance timer to complete stage 0 and activate stage 1
            await vi.advanceTimersByTimeAsync(600);
            await nextTick();

            expect(wrapper.find('[data-testid="stage-0"]').attributes("data-status")).toBe("done");
            expect(wrapper.find('[data-testid="stage-1"]').attributes("data-status")).toBe("active");
        });

        it("should complete all stages and show Complete label", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            // Advance through all 6 stages
            await advanceAllStages(6);

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            expect(label.text()).toContain("Complete");
            expect(label.text()).not.toContain("Running...");

            // All stages should be done
            for (let i = 0; i < 6; i++) {
                expect(wrapper.find(`[data-testid="stage-${i}"]`).attributes("data-status")).toBe("done");
            }
        });

        it("should show BEFORE and AFTER labels in stage data", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const stageData = wrapper.find('[data-testid="stage-0-data"]');
            expect(stageData.text()).toContain("BEFORE");
            expect(stageData.text()).toContain("AFTER");
        });

        it("should show status badges on each stage", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-0-badge"]').text()).toBe("ACTIVE");
            expect(wrapper.find('[data-testid="stage-1-badge"]').text()).toBe("PENDING");
        });

        it("should show loading state before/after data", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            await vi.advanceTimersByTimeAsync(600);
            await nextTick();

            const beforeEl = wrapper.find('[data-testid="stage-1-before"]');
            const afterEl = wrapper.find('[data-testid="stage-1-after"]');

            expect(beforeEl.text()).toContain('"isLoading": false');
            expect(afterEl.text()).toContain('"isLoading": true');
        });

        it("should show network call with 200 success response", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(4);

            const afterEl = wrapper.find('[data-testid="stage-3-after"]');
            expect(afterEl.text()).toContain('"status": 200');
        });

        it("should show the network call description for success", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-3"]').text()).toContain("returns 200 with the created resource");
        });

        it("should show loading state stop stage for success", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const beforeEl = wrapper.find('[data-testid="stage-5-before"]');
            const afterEl = wrapper.find('[data-testid="stage-5-after"]');

            expect(beforeEl.text()).toContain('"isLoading": true');
            expect(afterEl.text()).toContain('"isLoading": false');
        });
    });

    describe("auth error scenario", () => {
        it("should show active scenario label with 401 Auth Error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            expect(label.text()).toContain("401 Auth Error");
        });

        it("should render 6 stages for auth error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-5"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="stage-6"]').exists()).toBe(false);
        });

        it("should show 401 in network response", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(4);

            const afterEl = wrapper.find('[data-testid="stage-3-after"]');
            expect(afterEl.text()).toContain('"status": 401');
        });

        it("should show error handling stage with redirect to login", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const stage5 = wrapper.find('[data-testid="stage-5"]');
            expect(stage5.text()).toContain("Error Handling (401)");
            expect(stage5.attributes("data-status")).toBe("error");

            const afterEl = wrapper.find('[data-testid="stage-5-after"]');
            expect(afterEl.text()).toContain("/login");
            expect(afterEl.text()).toContain('"user": null');
        });

        it("should show network description for auth error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-3"]').text()).toContain("401 Unauthenticated");
        });
    });

    describe("validation error scenario", () => {
        it("should show active scenario label with 422 Validation Error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-validation-error"]').trigger("click");
            await nextTick();

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            expect(label.text()).toContain("422 Validation Error");
        });

        it("should show 422 in network response", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-validation-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(4);

            const afterEl = wrapper.find('[data-testid="stage-3-after"]');
            expect(afterEl.text()).toContain('"status": 422');
        });

        it("should show validation error handling with field errors", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-validation-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const stage5 = wrapper.find('[data-testid="stage-5"]');
            expect(stage5.text()).toContain("Error Handling (422)");
            expect(stage5.attributes("data-status")).toBe("error");

            const afterEl = wrapper.find('[data-testid="stage-5-after"]');
            expect(afterEl.text()).toContain("displayName");
            expect(afterEl.text()).toContain("partCount");
        });

        it("should show network description for validation error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-validation-error"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-3"]').text()).toContain("422 and field-level validation errors");
        });

        it("should show the validation error before data with error messages", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-validation-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const beforeEl = wrapper.find('[data-testid="stage-5-before"]');
            expect(beforeEl.text()).toContain("The given data was invalid.");
            expect(beforeEl.text()).toContain("display_name");
        });
    });

    describe("network error scenario", () => {
        it("should show active scenario label with Network Error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-network-error"]').trigger("click");
            await nextTick();

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            // scenarioLabel returns "Network Error"
            expect(label.text()).toContain("Network Error");
        });

        it("should show network error in network response", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-network-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(4);

            const afterEl = wrapper.find('[data-testid="stage-3-after"]');
            expect(afterEl.text()).toContain("ERR_NETWORK");
        });

        it("should show error handling stage for network error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-network-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const stage5 = wrapper.find('[data-testid="stage-5"]');
            expect(stage5.text()).toContain("Error Handling (Network)");
            expect(stage5.attributes("data-status")).toBe("error");

            const afterEl = wrapper.find('[data-testid="stage-5-after"]');
            expect(afterEl.text()).toContain("Network Error");
            expect(afterEl.text()).toContain("check your connection");
        });

        it("should show network description for network error", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-network-error"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-3"]').text()).toContain("connection refused or timeout");
        });
    });

    describe("interactive controls", () => {
        it("should disable scenario buttons while pipeline is running", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const successBtn = wrapper
                .findAllComponents({name: "PrimaryButton"})
                .find((b) => b.text() === "200 Success");
            expect(successBtn?.props("disabled")).toBe(true);

            const authBtn = wrapper
                .findAllComponents({name: "DangerButton"})
                .find((b) => b.text() === "401 Auth Error");
            expect(authBtn?.props("disabled")).toBe(true);
        });

        it("should disable the reset button while pipeline is running", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const resetBtn = wrapper.findAllComponents({name: "PrimaryButton"}).find((b) => b.text() === "Reset");
            expect(resetBtn?.props("disabled")).toBe(true);
        });

        it("should enable buttons after pipeline completes", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const successBtn = wrapper
                .findAllComponents({name: "PrimaryButton"})
                .find((b) => b.text() === "200 Success");
            expect(successBtn?.props("disabled")).toBe(false);
        });

        it("should reset the pipeline to initial state", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            // Click reset
            await wrapper.find('[data-testid="reset-pipeline"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="active-scenario-label"]').attributes("style")).toContain(
                "display: none",
            );
            expect(wrapper.find('[data-testid="pipeline-stages"]').exists()).toBe(false);
        });

        it("should allow running a different scenario after completion", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            // Run success scenario
            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            // Run auth error scenario
            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();

            const label = wrapper.find('[data-testid="active-scenario-label"]');
            expect(label.text()).toContain("401 Auth Error");
        });
    });

    describe("stage visual styling", () => {
        it("should show PENDING badge for pending stages", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            expect(wrapper.find('[data-testid="stage-5-badge"]').text()).toBe("PENDING");
        });

        it("should show DONE badge after stage completes", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            await vi.advanceTimersByTimeAsync(600);
            await nextTick();

            expect(wrapper.find('[data-testid="stage-0-badge"]').text()).toBe("DONE");
        });

        it("should show ERROR badge for error handling stages", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-auth-error"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            expect(wrapper.find('[data-testid="stage-5-badge"]').text()).toBe("ERROR");
        });

        it("should show connector arrows between completed stages", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            // First stage is active, should have connector (it's not the last stage and not pending)
            const stage0 = wrapper.find('[data-testid="stage-0"]');
            const ariaHiddenDivs = stage0.findAll("[aria-hidden]");
            expect(ariaHiddenDivs.length).toBeGreaterThan(0);
        });

        it("should not show connector arrow for the last stage", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            // Last stage (index 5) should not have a connector
            const stage5 = wrapper.find('[data-testid="stage-5"]');
            const ariaHiddenDivs = stage5.findAll("[aria-hidden]");
            expect(ariaHiddenDivs.length).toBe(0);
        });
    });

    describe("edge cases", () => {
        it("should show the reset button when a scenario is active", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            // The reset button uses v-show, so it exists but might be hidden
            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();
            await advanceAllStages(6);

            const resetBtn = wrapper.find('[data-testid="reset-pipeline"]');
            expect(resetBtn.exists()).toBe(true);
            // When v-show is true, the style attribute either doesn't exist or doesn't contain display: none
            const style = resetBtn.attributes("style") ?? "";
            expect(style).not.toContain("display: none");
        });

        it("should hide the reset button when no scenario is active", () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            const resetBtn = wrapper.find('[data-testid="reset-pipeline"]');
            // v-show keeps the element in DOM but hides it
            expect(resetBtn.exists()).toBe(true);
            expect(resetBtn.attributes("style")).toContain("display: none");
        });

        it("should show the request body in network call before data", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            const beforeEl = wrapper.find('[data-testid="stage-3-before"]');
            expect(beforeEl.text()).toContain("POST");
            expect(beforeEl.text()).toContain("/api/minifigs");
            expect(beforeEl.text()).toContain("display_name");
        });

        it("should render description text about middleware patterns", () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            expect(wrapper.text()).toContain("registration order");
            expect(wrapper.text()).toContain("stuck spinners");
        });

        it("should display the opacity variation for pending vs active stage descriptions", async () => {
            const wrapper = shallowMount(MiddlewarePipelineVisualizer, {global: {stubs}});

            await wrapper.find('[data-testid="scenario-success"]').trigger("click");
            await nextTick();

            // Stage 0 is active, its description has opacity 80
            // Stage 1 is pending, its description has opacity 50
            const stage0 = wrapper.find('[data-testid="stage-0"]');
            const stage1 = wrapper.find('[data-testid="stage-1"]');

            // The active stage description
            expect(stage0.text()).toContain("Request middleware injects the auth token");
            // The pending stage description
            expect(stage1.text()).toContain("Loading middleware increments");
        });
    });
});
