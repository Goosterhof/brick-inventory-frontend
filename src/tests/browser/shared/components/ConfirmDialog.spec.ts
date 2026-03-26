import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import ModalDialog from "@shared/components/ModalDialog.vue";
import {mount} from "@vue/test-utils";
import {describe, expect, it} from "vitest";

const mountDialog = (open = false) =>
    mount(ConfirmDialog, {props: {open, title: "Delete Item", message: "Are you sure you want to delete this?"}});

describe("ConfirmDialog (browser)", () => {
    describe("native dialog integration", () => {
        it("should open as a native dialog via showModal when open=true", () => {
            // Arrange & Act
            const wrapper = mountDialog(true);
            const dialog = wrapper.find("dialog").element as HTMLDialogElement;

            // Assert — real browser showModal sets open attribute
            expect(dialog.open).toBe(true);
        });

        it("should keep dialog closed when open=false", () => {
            // Arrange & Act
            const wrapper = mountDialog(false);
            const dialog = wrapper.find("dialog").element as HTMLDialogElement;

            // Assert
            expect(dialog.open).toBe(false);
        });
    });

    describe("rendering", () => {
        it("should render title via ModalDialog title slot", () => {
            // Arrange
            const wrapper = mountDialog(true);

            // Assert
            expect(wrapper.find("h2").text()).toBe("Delete Item");
        });

        it("should render message text", () => {
            // Arrange
            const wrapper = mountDialog(true);

            // Assert
            expect(wrapper.text()).toContain("Are you sure you want to delete this?");
        });

        it("should render confirm and cancel buttons", () => {
            // Arrange
            const wrapper = mountDialog(true);
            const buttons = wrapper.findAll("button");

            // Assert — at least confirm, cancel, and the close (X) button from ModalDialog
            const confirmButton = buttons.find((btn) => btn.text() === "Confirm");
            const cancelButton = buttons.find((btn) => btn.text() === "Cancel");
            expect(confirmButton?.exists()).toBe(true);
            expect(cancelButton?.exists()).toBe(true);
        });
    });

    describe("interactions", () => {
        it("should emit confirm when confirm button is clicked", async () => {
            // Arrange
            const wrapper = mountDialog(true);
            const buttons = wrapper.findAll("button");
            const confirmButton = buttons.find((btn) => btn.attributes("border")?.includes("brick-red"));

            // Act
            await confirmButton?.trigger("click");

            // Assert
            expect(wrapper.emitted("confirm")).toHaveLength(1);
        });

        it("should emit cancel when cancel button is clicked", async () => {
            // Arrange
            const wrapper = mountDialog(true);
            const buttons = wrapper.findAll("button");
            const cancelButton = buttons.find((btn) =>
                btn.attributes("class")?.includes("brick-shadow brick-transition"),
            );

            // Act
            await cancelButton?.trigger("click");

            // Assert
            expect(wrapper.emitted("cancel")).toHaveLength(1);
        });

        it("should emit cancel when ModalDialog emits close (X button)", async () => {
            // Arrange
            const wrapper = mountDialog(true);

            // Act — click the close (X) button from ModalDialog
            await wrapper.find("button[aria-label='Close']").trigger("click");

            // Assert — close from ModalDialog should trigger cancel on ConfirmDialog
            expect(wrapper.emitted("cancel")).toHaveLength(1);
        });

        it("should emit cancel on backdrop click (delegates to ModalDialog)", async () => {
            // Arrange
            const wrapper = mountDialog(true);
            const dialog = wrapper.find("dialog");

            // Act — click on the dialog element itself (backdrop area)
            await dialog.trigger("click");

            // Assert
            expect(wrapper.emitted("cancel")).toHaveLength(1);
        });
    });

    describe("component integration", () => {
        it("should pass open prop through to ModalDialog", () => {
            // Arrange
            const wrapper = mountDialog(true);

            // Assert
            expect(wrapper.findComponent(ModalDialog).props("open")).toBe(true);
        });
    });
});
