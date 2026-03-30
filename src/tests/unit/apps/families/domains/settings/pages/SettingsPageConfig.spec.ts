import SettingsPage from "@app/domains/settings/pages/SettingsPage.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {
    createMockAxiosWithError,
    MockAxiosError,
    createMockStringTs,
    createMockFamilyServices,
    createMockFormField,
    createMockFormLabel,
    createMockFormError,
} = await vi.hoisted(() => import("../../../../../../helpers"));

vi.mock("@shared/components/forms/FormError.vue", () => createMockFormError());
vi.mock("@shared/components/forms/FormField.vue", () => createMockFormField());
vi.mock("@shared/components/forms/FormLabel.vue", () => createMockFormLabel());

vi.mock("axios", () => createMockAxiosWithError());
vi.mock("string-ts", () => createMockStringTs());

const {mockGetRequest, mockPutRequest, mockPostRequest, mockUserId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPutRequest: vi.fn(),
    mockPostRequest: vi.fn(),
    mockUserId: vi.fn(),
}));

vi.mock("@app/services", () =>
    createMockFamilyServices({
        familyHttpService: {getRequest: mockGetRequest, postRequest: mockPostRequest, putRequest: mockPutRequest},
        familyAuthService: {isLoggedIn: {value: true}, userId: mockUserId},
    }),
);

const mockMembersAndNoInviteCode = () => {
    mockGetRequest.mockImplementation((url: string) => {
        if (url === "/family/members") {
            return Promise.resolve({data: [{id: 1, name: "Jan", email: "jan@example.com", isHead: true}]});
        }
        if (url === "/family/invite-code") {
            const error = new MockAxiosError("Not Found");
            error.response = {status: 404, data: null, statusText: "Not Found", headers: {}, config: {}};
            return Promise.reject(error);
        }
        return Promise.reject(new Error(`Unexpected GET: ${url}`));
    });
};

describe("SettingsPage — config", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserId.mockReturnValue(1);
        mockMembersAndNoInviteCode();
    });

    it("should render page header with title", () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("settings.title");
    });

    it("should render rebrickable token input", () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);

        // Assert
        const input = wrapper.findComponent(TextInput);
        expect(input.exists()).toBe(true);
        expect(input.props("label")).toBe("settings.rebrickableToken");
    });

    it("should render save token button", () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);

        // Assert
        const saveButton = wrapper.findAllComponents(PrimaryButton).find((btn) => btn.text() === "settings.saveToken");
        expect(saveButton?.exists()).toBe(true);
    });

    it("should render import button", () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);

        // Assert
        const importButton = wrapper
            .findAllComponents(PrimaryButton)
            .find((btn) => btn.text() === "settings.importButton");
        expect(importButton?.exists()).toBe(true);
    });

    describe("save token", () => {
        it("should save token via PUT request", async () => {
            // Arrange
            mockPutRequest.mockResolvedValue({});
            const wrapper = shallowMount(SettingsPage);
            await wrapper.findComponent(TextInput).setValue("my-secret-token");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(mockPutRequest).toHaveBeenCalledWith("/family/rebrickable-token", {
                rebrickable_user_token: "my-secret-token",
            });
        });

        it("should show success message after saving", async () => {
            // Arrange
            mockPutRequest.mockResolvedValue({});
            const wrapper = shallowMount(SettingsPage);
            await wrapper.findComponent(TextInput).setValue("my-secret-token");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.tokenSaved");
        });

        it("should clear token input after saving", async () => {
            // Arrange
            mockPutRequest.mockResolvedValue({});
            const wrapper = shallowMount(SettingsPage);
            await wrapper.findComponent(TextInput).setValue("my-secret-token");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.findComponent(TextInput).props("modelValue")).toBe("");
        });

        it("should show error when not family head (403)", async () => {
            // Arrange
            const axiosError = new MockAxiosError("Forbidden");
            axiosError.response = {status: 403, data: null, statusText: "Forbidden", headers: {}, config: {}};
            mockPutRequest.mockRejectedValue(axiosError);
            const wrapper = shallowMount(SettingsPage);
            await wrapper.findComponent(TextInput).setValue("my-secret-token");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.findComponent(TextInput).props("error")).toBe("settings.notFamilyHead");
        });

        it("should show generic error on failure", async () => {
            // Arrange
            mockPutRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(SettingsPage);
            await wrapper.findComponent(TextInput).setValue("my-secret-token");

            // Act
            await wrapper.find("form").trigger("submit");
            await flushPromises();

            // Assert
            expect(wrapper.findComponent(TextInput).props("error")).toBe("settings.tokenSaveError");
        });
    });

    describe("import sets", () => {
        it("should call import endpoint", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({
                data: {
                    message: "Import completed successfully",
                    created: 5,
                    updated: 2,
                    skipped: 0,
                    total: 7,
                    complete: true,
                },
            });
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockPostRequest).toHaveBeenCalledWith("/family-sets/import-from-rebrickable", {});
        });

        it("should display import results", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({
                data: {
                    message: "Import completed successfully",
                    created: 5,
                    updated: 2,
                    skipped: 1,
                    total: 7,
                    complete: true,
                },
            });
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Import completed successfully");
            expect(wrapper.text()).toContain("settings.importCreated");
            expect(wrapper.text()).toContain("settings.importUpdated");
            expect(wrapper.text()).toContain("settings.importSkipped");
        });

        it("should not show skipped count when zero", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({
                data: {
                    message: "Import completed successfully",
                    created: 5,
                    updated: 2,
                    skipped: 0,
                    total: 7,
                    complete: true,
                },
            });
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("settings.importSkipped");
        });

        it("should show error when not family head (403)", async () => {
            // Arrange
            const axiosError = new MockAxiosError("Forbidden");
            axiosError.response = {status: 403, data: null, statusText: "Forbidden", headers: {}, config: {}};
            mockPostRequest.mockRejectedValue(axiosError);
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.notFamilyHead");
        });

        it("should show no token error (422)", async () => {
            // Arrange
            const axiosError = new MockAxiosError("Unprocessable Entity");
            axiosError.response = {
                status: 422,
                data: null,
                statusText: "Unprocessable Entity",
                headers: {},
                config: {},
            };
            mockPostRequest.mockRejectedValue(axiosError);
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.noTokenConfigured");
        });

        it("should show generic error on failure", async () => {
            // Arrange
            mockPostRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.importError");
        });

        it("should show importing state while in progress", async () => {
            // Arrange
            let resolveRequest: ((value: unknown) => void) | undefined;
            mockPostRequest.mockReturnValue(
                new Promise((resolve) => {
                    resolveRequest = resolve;
                }),
            );
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            const updatedButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importing");
            expect(updatedButton?.exists()).toBe(true);
            resolveRequest?.({data: {message: "done", created: 0, updated: 0, skipped: 0, total: 0, complete: true}});
        });

        it("should display import error from response", async () => {
            // Arrange
            mockPostRequest.mockResolvedValue({
                data: {
                    message: "Import partially completed",
                    created: 3,
                    updated: 0,
                    skipped: 0,
                    total: 3,
                    complete: false,
                    error: "Some sets failed to import",
                },
            });
            const wrapper = shallowMount(SettingsPage);

            // Act
            const importButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.importButton");
            await importButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("Some sets failed to import");
        });
    });
});
