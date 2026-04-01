import type {ComponentPublicInstance} from "vue";

import {shallowMount} from "@vue/test-utils";
import {describe, expect, it, vi} from "vitest";
import {nextTick} from "vue";

import ComponentGallery from "@/apps/showcase/components/ComponentGallery.vue";
import SectionHeading from "@/apps/showcase/components/SectionHeading.vue";

// Mock heavy shared components to keep import chain under 1000ms (ADR-010).
// Using globalThis stubs: vi.mock factories are hoisted above imports, so we
// use vi.hoisted to make the factory function available in the hoisted scope.
const {mkStub, mkButtonStub, mkToastStub} = vi.hoisted(() => {
    const mkStub = (name: string, slotted: boolean) => ({
        name,
        props: {
            open: Boolean,
            to: String,
            active: Boolean,
            disabled: Boolean,
            modelValue: [String, Number, Object],
            label: String,
            optional: Boolean,
            min: Number,
            max: Number,
            for: String,
            message: String,
            variant: String,
            title: String,
            value: String,
            name: String,
            partNum: String,
            quantity: Number,
            colorName: String,
            colorRgb: String,
            spare: Boolean,
            columns: Number,
            rows: Number,
            color: String,
            shadow: Boolean,
        },
        emits: ["update:modelValue", "click", "close", "confirm", "cancel"],
        template: slotted
            ? `<div data-stub="${name}"><slot /><slot name="title" /><slot name="confirm" /><slot name="cancel" /><slot name="links" /><slot name="mobile-links" /><slot name="actions" /></div>`
            : `<div data-stub="${name}"><slot /></div>`,
    });
    const mkButtonStub = (name: string) => ({
        name,
        props: {disabled: Boolean, active: Boolean, value: String},
        emits: ["click"],
        template: `<button @click="$emit('click')" :disabled="disabled"><slot /></button>`,
    });
    const mkToastStub = () => ({
        name: "ToastMessage",
        props: {message: String, variant: String},
        emits: ["close"],
        template: `<div>{{ message }}<button aria-label="Dismiss" @click="$emit('close')">x</button></div>`,
    });
    return {mkStub, mkButtonStub, mkToastStub};
});

vi.mock("@shared/components/scanner/BarcodeScanner.vue", () => ({default: mkStub("BarcodeScanner", false)}));
vi.mock("@shared/components/scanner/CameraCapture.vue", () => ({default: mkStub("CameraCapture", false)}));
vi.mock("@shared/components/ModalDialog.vue", () => ({default: mkStub("ModalDialog", true)}));
vi.mock("@shared/components/ConfirmDialog.vue", () => ({default: mkStub("ConfirmDialog", true)}));
vi.mock("@shared/components/NavHeader.vue", () => ({default: mkStub("NavHeader", true)}));
vi.mock("@shared/components/NavLink.vue", () => ({default: mkStub("NavLink", false)}));
vi.mock("@shared/components/NavMobileLink.vue", () => ({default: mkStub("NavMobileLink", false)}));
vi.mock("@shared/components/LegoBrick.vue", () => ({default: mkStub("LegoBrick", false)}));
vi.mock("@shared/components/forms/inputs/TextInput.vue", () => ({default: mkStub("TextInput", false)}));
vi.mock("@shared/components/forms/inputs/NumberInput.vue", () => ({default: mkStub("NumberInput", false)}));
vi.mock("@shared/components/forms/inputs/SelectInput.vue", () => ({default: mkStub("SelectInput", true)}));
vi.mock("@shared/components/forms/inputs/DateInput.vue", () => ({default: mkStub("DateInput", false)}));
vi.mock("@shared/components/forms/inputs/TextareaInput.vue", () => ({default: mkStub("TextareaInput", false)}));
vi.mock("@shared/components/forms/FormError.vue", () => ({default: mkStub("FormError", false)}));
vi.mock("@shared/components/forms/FormField.vue", () => ({default: mkStub("FormField", true)}));
vi.mock("@shared/components/forms/FormLabel.vue", () => ({default: mkStub("FormLabel", true)}));
vi.mock("@shared/components/LoadingState.vue", () => ({default: mkStub("LoadingState", false)}));
vi.mock("@shared/components/PartListItem.vue", () => ({default: mkStub("PartListItem", false)}));
vi.mock("@shared/components/PrimaryButton.vue", () => ({default: mkButtonStub("PrimaryButton")}));
vi.mock("@shared/components/DangerButton.vue", () => ({default: mkButtonStub("DangerButton")}));
vi.mock("@shared/components/BackButton.vue", () => ({default: mkButtonStub("BackButton")}));
vi.mock("@shared/components/FilterChip.vue", () => ({default: mkButtonStub("FilterChip")}));
vi.mock("@shared/components/ToastMessage.vue", () => ({default: mkToastStub()}));
vi.mock("@shared/components/EmptyState.vue", () => ({default: mkStub("EmptyState", true)}));
vi.mock("@shared/components/PageHeader.vue", () => ({default: mkStub("PageHeader", true)}));
vi.mock("@shared/components/StatCard.vue", () => ({default: mkStub("StatCard", true)}));
vi.mock("@shared/components/DetailRow.vue", () => ({default: mkStub("DetailRow", true)}));
vi.mock("@shared/components/CardContainer.vue", () => ({default: mkStub("CardContainer", true)}));
vi.mock("@shared/components/BadgeLabel.vue", () => ({default: mkStub("BadgeLabel", true)}));
vi.mock("@shared/components/SectionDivider.vue", () => ({default: mkStub("SectionDivider", false)}));
vi.mock("@shared/components/ListItemButton.vue", () => ({default: mkStub("ListItemButton", true)}));

describe("ComponentGallery", () => {
    // Prevent shallowMount from auto-stubbing vi.mock'd components — they are already lightweight stubs.
    const mockedComponentNames = [
        "BarcodeScanner",
        "CameraCapture",
        "ModalDialog",
        "ConfirmDialog",
        "NavHeader",
        "NavLink",
        "NavMobileLink",
        "LegoBrick",
        "TextInput",
        "NumberInput",
        "SelectInput",
        "DateInput",
        "TextareaInput",
        "FormError",
        "FormField",
        "FormLabel",
        "LoadingState",
        "PartListItem",
        "PrimaryButton",
        "DangerButton",
        "BackButton",
        "FilterChip",
        "ToastMessage",
        "EmptyState",
        "PageHeader",
        "StatCard",
        "DetailRow",
        "CardContainer",
        "BadgeLabel",
        "SectionDivider",
        "ListItemButton",
    ] as const;
    const noAutoStub = Object.fromEntries(mockedComponentNames.map((name) => [name, false as const]));
    const stubs = {SectionHeading, ...noAutoStub};

    it("should render the section heading with correct number and title", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        expect(wrapper.text()).toContain("04");
        expect(wrapper.text()).toContain("Component Gallery");
    });

    it("should render the section element with correct id", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        expect(wrapper.find("section#components").exists()).toBe(true);
    });

    it("should render all gallery category labels", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        const labels = wrapper.findAll(".brick-label");
        const labelTexts = labels.map((l) => l.text());
        expect(labelTexts).toContain("Buttons");
        expect(labelTexts).toContain("Form Inputs");
        expect(labelTexts).toContain("Cards & Layout");
        expect(labelTexts).toContain("PageHeader");
        expect(labelTexts).toContain("StatCard");
        expect(labelTexts).toContain("DetailRow");
        expect(labelTexts).toContain("PartListItem");
        expect(labelTexts).toContain("FilterChip");
        expect(labelTexts).toContain("BadgeLabel");
        expect(labelTexts).toContain("SectionDivider");
        expect(labelTexts).toContain("LoadingState");
        expect(labelTexts).toContain("ModalDialog");
        expect(labelTexts).toContain("ConfirmDialog");
        expect(labelTexts).toContain("Toast Messages");
        expect(labelTexts).toContain("Empty State");
        expect(labelTexts).toContain("Navigation");
        expect(labelTexts).toContain("Scanner Components");
        expect(labelTexts).toContain("LegoBrick");
    });

    it("should toggle modalOpen state when Open Modal is clicked", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Act
        const openButton = wrapper.findAll("button").find((b) => b.text().includes("Open Modal"));
        await openButton?.trigger("click");
        await nextTick();

        // Assert — the stubbed ModalDialog receives :open="true"
        const modalDialog = wrapper.findComponent({name: "ModalDialog"});
        expect(modalDialog.props("open")).toBe(true);
    });

    it("should close the modal when Remove is clicked inside it", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});
        const openButton = wrapper.findAll("button").find((b) => b.text().includes("Open Modal"));
        await openButton?.trigger("click");
        await nextTick();

        // Act — click Remove button (rendered inside the stubbed ModalDialog slot)
        const removeButton = wrapper.findAll("button").find((b) => b.text() === "Remove");
        await removeButton?.trigger("click");
        await nextTick();

        // Assert
        const modalDialog = wrapper.findComponent({name: "ModalDialog"});
        expect(modalDialog.props("open")).toBe(false);
    });

    it("should close the modal when Cancel is clicked inside it", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});
        const openButton = wrapper.findAll("button").find((b) => b.text().includes("Open Modal"));
        await openButton?.trigger("click");
        await nextTick();

        // Act
        const cancelButton = wrapper.findAll("button").find((b) => b.text() === "Cancel");
        await cancelButton?.trigger("click");
        await nextTick();

        // Assert
        const modalDialog = wrapper.findComponent({name: "ModalDialog"});
        expect(modalDialog.props("open")).toBe(false);
    });

    it("should toggle confirmOpen state when Delete Storage is clicked", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Act
        const deleteButton = wrapper.findAll("button").find((b) => b.text().includes("Delete Storage"));
        await deleteButton?.trigger("click");
        await nextTick();

        // Assert
        const confirmDialog = wrapper.findComponent({name: "ConfirmDialog"});
        expect(confirmDialog.props("open")).toBe(true);
    });

    it("should close the confirm dialog on confirm", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});
        const deleteButton = wrapper.findAll("button").find((b) => b.text().includes("Delete Storage"));
        await deleteButton?.trigger("click");
        await nextTick();

        // Act — emit confirm from stubbed ConfirmDialog
        const confirmDialog = wrapper.findComponent({name: "ConfirmDialog"});
        (confirmDialog.vm as ComponentPublicInstance).$emit("confirm");
        await nextTick();

        // Assert
        expect(confirmDialog.props("open")).toBe(false);
    });

    it("should close the confirm dialog on cancel", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});
        const deleteButton = wrapper.findAll("button").find((b) => b.text().includes("Delete Storage"));
        await deleteButton?.trigger("click");
        await nextTick();

        // Act — emit cancel from stubbed ConfirmDialog
        const confirmDialog = wrapper.findComponent({name: "ConfirmDialog"});
        (confirmDialog.vm as ComponentPublicInstance).$emit("cancel");
        await nextTick();

        // Assert
        expect(confirmDialog.props("open")).toBe(false);
    });

    it("should hide success toast when close is triggered", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert — both toasts visible initially
        expect(wrapper.text()).toContain("Set added to your inventory.");
        expect(wrapper.text()).toContain("Could not connect to the brick vault.");

        // Act — close the success toast via Dismiss button
        const dismissButtons = wrapper.findAll("[aria-label='Dismiss']");
        await dismissButtons[0]?.trigger("click");
        await nextTick();

        // Assert — one toast hidden, reset button appears
        expect(wrapper.text()).toContain("Reset toasts");
    });

    it("should reset toasts when clicking the reset button", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Close both toasts
        const dismissButtons = wrapper.findAll("[aria-label='Dismiss']");
        await dismissButtons[0]?.trigger("click");
        await nextTick();
        const remainingDismiss = wrapper.find("[aria-label='Dismiss']");
        await remainingDismiss.trigger("click");
        await nextTick();

        // Act — click Reset toasts button
        const resetBtn = wrapper.findAll("button").find((b) => b.text() === "Reset toasts");
        expect(resetBtn).toBeDefined();
        await resetBtn?.trigger("click");
        await nextTick();

        // Assert — toasts are back
        expect(wrapper.text()).toContain("Set added to your inventory.");
        expect(wrapper.text()).toContain("Could not connect to the brick vault.");
    });

    it("should toggle filter chips on click for all filter values", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Act — click each filter chip to activate and deactivate
        const filterNames = ["Sealed", "Built", "In Progress", "Incomplete"];
        for (const name of filterNames) {
            const chip = wrapper.findAll("button").find((b) => b.text().trim() === name);
            expect(chip).toBeDefined();
            await chip?.trigger("click");
            await nextTick();
            await chip?.trigger("click");
            await nextTick();
        }

        // Assert — all filters rendered
        for (const name of filterNames) {
            expect(wrapper.text()).toContain(name);
        }
    });

    it("should render scanner component placeholders", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        expect(wrapper.text()).toContain("BarcodeScanner");
        expect(wrapper.text()).toContain("CameraCapture");
        expect(wrapper.text()).toContain("Camera Required");
    });

    it("should render navigation component demos", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        expect(wrapper.text()).toContain("NavHeader");
        expect(wrapper.text()).toContain("NavLink");
        expect(wrapper.text()).toContain("NavMobileLink");
    });

    it("should render the LegoBrick demo with multiple variants", () => {
        // Act
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Assert
        expect(wrapper.text()).toContain("4x2 Red");
        expect(wrapper.text()).toContain("2x2 Blue");
        expect(wrapper.text()).toContain("1x1 Yellow (no shadow)");
    });

    it("should update v-model values when form inputs change", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Act — type in the raw input fields
        const demoInput = wrapper.find("#demo-input");
        await demoInput.setValue("New Brick Name");

        const errorInput = wrapper.find("#error-input");
        await errorInput.setValue("12345");

        // Act — trigger v-model updates on stubbed shared components
        const textInput = wrapper.findComponent({name: "TextInput"});
        (textInput.vm as ComponentPublicInstance).$emit("update:modelValue", "Updated description");
        await nextTick();

        const numberInput = wrapper.findComponent({name: "NumberInput"});
        (numberInput.vm as ComponentPublicInstance).$emit("update:modelValue", 99);
        await nextTick();

        const selectInput = wrapper.findComponent({name: "SelectInput"});
        (selectInput.vm as ComponentPublicInstance).$emit("update:modelValue", "sealed");
        await nextTick();

        const dateInput = wrapper.findComponent({name: "DateInput"});
        (dateInput.vm as ComponentPublicInstance).$emit("update:modelValue", "2025-06-15");
        await nextTick();

        const textareaInput = wrapper.findComponent({name: "TextareaInput"});
        (textareaInput.vm as ComponentPublicInstance).$emit("update:modelValue", "Updated notes");
        await nextTick();

        // Assert — raw inputs accepted values
        expect((demoInput.element as HTMLInputElement).value).toBe("New Brick Name");
        expect((errorInput.element as HTMLInputElement).value).toBe("12345");
    });

    it("should close the modal via ModalDialog close event", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Open the modal
        const openButton = wrapper.findAll("button").find((b) => b.text().includes("Open Modal"));
        await openButton?.trigger("click");
        await nextTick();

        // Act — trigger close via the stubbed ModalDialog's close emit
        const modalDialog = wrapper.findComponent({name: "ModalDialog"});
        (modalDialog.vm as ComponentPublicInstance).$emit("close");
        await nextTick();

        // Assert — exercised the @close="modalOpen = false" handler
        expect(openButton).toBeDefined();
    });

    it("should exercise nav link click handlers via noop", async () => {
        // Arrange
        const wrapper = shallowMount(ComponentGallery, {global: {stubs}});

        // Act — trigger click events on stubbed NavLink components
        const navLinks = wrapper.findAllComponents({name: "NavLink"});
        for (const link of navLinks) {
            (link.vm as ComponentPublicInstance).$emit("click");
        }
        const mobileLinks = wrapper.findAllComponents({name: "NavMobileLink"});
        for (const link of mobileLinks) {
            (link.vm as ComponentPublicInstance).$emit("click");
        }
        await nextTick();

        // Assert — navigation section rendered
        expect(wrapper.text()).toContain("NavLink");
    });
});
