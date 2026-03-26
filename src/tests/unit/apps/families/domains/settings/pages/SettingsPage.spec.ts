import SettingsPage from "@app/domains/settings/pages/SettingsPage.vue";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import DangerButton from "@shared/components/DangerButton.vue";
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

const {mockGetRequest, mockPutRequest, mockPostRequest, mockDeleteRequest, mockUserId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPutRequest: vi.fn(),
    mockPostRequest: vi.fn(),
    mockDeleteRequest: vi.fn(),
    mockUserId: vi.fn(),
}));

vi.mock("@app/services", () =>
    createMockFamilyServices({
        familyHttpService: {
            getRequest: mockGetRequest,
            postRequest: mockPostRequest,
            putRequest: mockPutRequest,
            deleteRequest: mockDeleteRequest,
        },
        familyAuthService: {isLoggedIn: {value: true}, userId: mockUserId},
    }),
);

const membersData = [
    {id: 1, name: "Jan", email: "jan@example.com", isHead: true},
    {id: 2, name: "Maria", email: "maria@example.com", isHead: false},
];

const inviteCodeData = {id: 10, code: "ABC123", expiresAt: "2026-04-01T00:00:00Z", createdAt: "2026-03-25T00:00:00Z"};

const mockMembersAndInviteCode = () => {
    mockGetRequest.mockImplementation((url: string) => {
        if (url === "/family/members") {
            return Promise.resolve({data: membersData});
        }
        if (url === "/family/invite-code") {
            return Promise.resolve({data: inviteCodeData});
        }
        return Promise.reject(new Error(`Unexpected GET: ${url}`));
    });
};

const mockMembersAndNoInviteCode = () => {
    mockGetRequest.mockImplementation((url: string) => {
        if (url === "/family/members") {
            return Promise.resolve({data: membersData});
        }
        if (url === "/family/invite-code") {
            const error = new MockAxiosError("Not Found");
            error.response = {status: 404, data: null, statusText: "Not Found", headers: {}, config: {}};
            return Promise.reject(error);
        }
        return Promise.reject(new Error(`Unexpected GET: ${url}`));
    });
};

describe("SettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserId.mockReturnValue(1);
        mockMembersAndNoInviteCode();
        Object.defineProperty(navigator, "clipboard", {
            value: {writeText: vi.fn().mockResolvedValue(undefined)},
            writable: true,
            configurable: true,
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

    describe("invite code", () => {
        it("should fetch invite code on mount", async () => {
            // Arrange & Act
            shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(mockGetRequest).toHaveBeenCalledWith("/family/invite-code");
        });

        it("should handle 404 when no active invite code exists", async () => {
            // Arrange
            mockMembersAndNoInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("ABC123");
            expect(wrapper.text()).not.toContain("settings.inviteCodeError");
        });

        it("should show invite code section only for family head", async () => {
            // Arrange
            mockUserId.mockReturnValue(1);
            mockMembersAndInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.inviteCodeTitle");
            expect(wrapper.text()).toContain("settings.inviteCodeDescription");
        });

        it("should hide invite code section for non-head members", async () => {
            // Arrange
            mockUserId.mockReturnValue(2);

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).not.toContain("settings.inviteCodeTitle");
        });

        it("should display active invite code", async () => {
            // Arrange
            mockMembersAndInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("ABC123");
            expect(wrapper.text()).toContain("2026-04-01T00:00:00Z");
        });

        it("should copy code to clipboard", async () => {
            // Arrange
            mockMembersAndInviteCode();
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Act
            const copyButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.copyCode");
            await copyButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABC123");
            expect(wrapper.text()).toContain("settings.codeCopied");
        });

        it("should not copy when no invite code is active", async () => {
            // Arrange
            mockMembersAndNoInviteCode();
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert — no copy button visible when no code exists
            const copyButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.copyCode");
            expect(copyButton).toBeUndefined();
        });

        it("should generate invite code via POST", async () => {
            // Arrange
            mockMembersAndNoInviteCode();
            mockPostRequest.mockResolvedValue({data: inviteCodeData});
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Act
            const generateButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.generateInviteCode");
            await generateButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(mockPostRequest).toHaveBeenCalledWith("/family/invite-code", {});
            expect(wrapper.text()).toContain("ABC123");
        });

        it("should show error when generate fails", async () => {
            // Arrange
            mockMembersAndNoInviteCode();
            mockPostRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Act
            const generateButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.generateInviteCode");
            await generateButton?.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.inviteCodeError");
        });

        it("should revoke invite code via DELETE", async () => {
            // Arrange
            mockMembersAndInviteCode();
            mockDeleteRequest.mockResolvedValue({});
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Act
            const revokeButton = wrapper.findComponent(DangerButton);
            await revokeButton.trigger("click");
            await flushPromises();

            // Assert
            expect(mockDeleteRequest).toHaveBeenCalledWith("/family/invite-code");
            expect(wrapper.text()).not.toContain("ABC123");
        });

        it("should show error when revoke fails", async () => {
            // Arrange
            mockMembersAndInviteCode();
            mockDeleteRequest.mockRejectedValue(new Error("Network error"));
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Act
            const revokeButton = wrapper.findComponent(DangerButton);
            await revokeButton.trigger("click");
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.inviteCodeError");
        });

        it("should show error when fetching invite code fails with non-404", async () => {
            // Arrange
            mockGetRequest.mockImplementation((url: string) => {
                if (url === "/family/members") {
                    return Promise.resolve({data: membersData});
                }
                if (url === "/family/invite-code") {
                    const error = new MockAxiosError("Internal Server Error");
                    error.response = {
                        status: 500,
                        data: null,
                        statusText: "Internal Server Error",
                        headers: {},
                        config: {},
                    };
                    return Promise.reject(error);
                }
                return Promise.reject(new Error(`Unexpected GET: ${url}`));
            });

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.inviteCodeError");
        });

        it("should show error when fetching invite code fails with non-axios error", async () => {
            // Arrange
            mockGetRequest.mockImplementation((url: string) => {
                if (url === "/family/members") {
                    return Promise.resolve({data: membersData});
                }
                if (url === "/family/invite-code") {
                    return Promise.reject(new Error("Network failure"));
                }
                return Promise.reject(new Error(`Unexpected GET: ${url}`));
            });

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.inviteCodeError");
        });

        it("should show generate button when no active code exists", async () => {
            // Arrange
            mockMembersAndNoInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            const generateButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.generateInviteCode");
            expect(generateButton?.exists()).toBe(true);
        });

        it("should hide generate button when active code exists", async () => {
            // Arrange
            mockMembersAndInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            const generateButton = wrapper
                .findAllComponents(PrimaryButton)
                .find((btn) => btn.text() === "settings.generateInviteCode");
            expect(generateButton).toBeUndefined();
        });

        it("should show revoke button when active code exists", async () => {
            // Arrange
            mockMembersAndInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            const revokeButton = wrapper.findComponent(DangerButton);
            expect(revokeButton.exists()).toBe(true);
            expect(revokeButton.text()).toBe("settings.revokeCode");
        });

        it("should show expires at for active code", async () => {
            // Arrange
            mockMembersAndInviteCode();

            // Act
            const wrapper = shallowMount(SettingsPage);
            await flushPromises();

            // Assert
            expect(wrapper.text()).toContain("settings.codeExpires");
            expect(wrapper.text()).toContain("2026-04-01T00:00:00Z");
        });
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
