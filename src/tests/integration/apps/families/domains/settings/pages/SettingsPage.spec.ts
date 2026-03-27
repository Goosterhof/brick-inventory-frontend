import SettingsPage from "@app/domains/settings/pages/SettingsPage.vue";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import ConfirmDialog from "@shared/components/ConfirmDialog.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockGetRequest, mockPostRequest, mockDeleteRequest, mockPutRequest, mockUserId} = vi.hoisted(() => ({
    mockGetRequest: vi.fn(),
    mockPostRequest: vi.fn(),
    mockDeleteRequest: vi.fn(),
    mockPutRequest: vi.fn(),
    mockUserId: vi.fn(() => 1),
}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {
        t: (key: string, _params?: Record<string, string>) => ({value: key}),
        locale: {value: "en"},
    },
    familyHttpService: {
        getRequest: mockGetRequest,
        postRequest: mockPostRequest,
        putRequest: mockPutRequest,
        patchRequest: vi.fn(),
        deleteRequest: mockDeleteRequest,
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyAuthService: {userId: mockUserId, isLoggedIn: {value: true}},
}));

const headMember = {id: 1, name: "Alice", email: "alice@test.com", isHead: true};
const regularMember = {id: 2, name: "Bob", email: "bob@test.com", isHead: false};

describe("SettingsPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserId.mockReturnValue(1);
    });

    const mountWithMembers = async (members = [headMember, regularMember]) => {
        mockGetRequest.mockResolvedValueOnce({data: members}).mockRejectedValueOnce({response: {status: 404}});
        const wrapper = mount(SettingsPage);
        await flushPromises();
        return wrapper;
    };

    it("renders PageHeader with real h1 element", async () => {
        const wrapper = await mountWithMembers();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.find("h1").text()).toBe("settings.title");
    });

    it("renders members with real BadgeLabel for family head", async () => {
        const wrapper = await mountWithMembers();

        const badges = wrapper.findAllComponents(BadgeLabel);
        const headBadge = badges.find((b) => b.text().includes("settings.familyHead"));
        expect(headBadge).toBeDefined();
        expect(headBadge?.props("variant")).toBe("highlight");
    });

    it("renders real DangerButton for removing non-head members", async () => {
        const wrapper = await mountWithMembers();

        const dangerButtons = wrapper.findAllComponents(DangerButton);
        const removeBtn = dangerButtons.find((b) => b.text().includes("settings.removeMember"));
        expect(removeBtn).toBeDefined();
        expect(removeBtn?.find("button").exists()).toBe(true);
    });

    it("opens real ConfirmDialog when clicking remove member button", async () => {
        const wrapper = await mountWithMembers();

        const dangerButtons = wrapper.findAllComponents(DangerButton);
        const removeBtn = dangerButtons.find((b) => b.text().includes("settings.removeMember"));
        await removeBtn?.find("button").trigger("click");

        const confirmDialog = wrapper.findComponent(ConfirmDialog);
        expect(confirmDialog.props("open")).toBe(true);
        expect(confirmDialog.props("title")).toBe("settings.removeMemberTitle");
    });

    it("renders real TextInput for rebrickable token", async () => {
        const wrapper = await mountWithMembers();

        const inputs = wrapper.findAllComponents(TextInput);
        const tokenInput = inputs.find((i) => i.props("label") === "settings.rebrickableToken");
        expect(tokenInput).toBeDefined();
        expect(tokenInput?.find("input").exists()).toBe(true);
    });

    it("renders invite code section with PrimaryButton when user is head", async () => {
        const wrapper = await mountWithMembers();

        const buttons = wrapper.findAllComponents(PrimaryButton);
        const generateBtn = buttons.find((b) => b.text().includes("settings.generateInviteCode"));
        expect(generateBtn).toBeDefined();
    });

    it("hides invite code section when user is not head", async () => {
        mockUserId.mockReturnValue(2);
        const wrapper = await mountWithMembers();

        const buttons = wrapper.findAllComponents(PrimaryButton);
        const generateBtn = buttons.find((b) => b.text().includes("settings.generateInviteCode"));
        expect(generateBtn).toBeUndefined();
    });
});
