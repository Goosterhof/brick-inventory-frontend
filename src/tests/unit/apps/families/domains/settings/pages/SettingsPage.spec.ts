import SettingsPage from "@app/domains/settings/pages/SettingsPage.vue";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockPutRequest, mockPostRequest} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPutRequest: vi.fn(),
    mockPostRequest: vi.fn(),
}));

vi.mock("@app/services", () => ({
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: mockPostRequest,
        putRequest: mockPutRequest,
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyAuthService: {
        isLoggedIn: {value: true},
        user: {value: null},
        userId: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkIfLoggedIn: vi.fn(),
        sendEmailResetPassword: vi.fn(),
        resetPassword: vi.fn(),
    },
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: vi.fn()},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("SettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetRequest.mockResolvedValue({
            data: [
                {id: 1, name: "Jan", email: "jan@example.com", is_head: true},
                {id: 2, name: "Maria", email: "maria@example.com", is_head: false},
            ],
        });
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

    it("should fetch and display family members", async () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);
        await flushPromises();

        // Assert
        expect(mockGetRequest).toHaveBeenCalledWith("/family/members");
        expect(wrapper.text()).toContain("Jan");
        expect(wrapper.text()).toContain("Maria");
    });

    it("should show head badge for family head", async () => {
        // Arrange & Act
        const wrapper = shallowMount(SettingsPage);
        await flushPromises();

        // Assert
        const badge = wrapper.findComponent(BadgeLabel);
        expect(badge.exists()).toBe(true);
        expect(badge.text()).toBe("settings.familyHead");
        expect(badge.props("variant")).toBe("highlight");
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
            mockPutRequest.mockRejectedValue({response: {status: 403}});
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
            mockPostRequest.mockRejectedValue({response: {status: 403}});
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
            mockPostRequest.mockRejectedValue({response: {status: 422}});
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
    });
});
