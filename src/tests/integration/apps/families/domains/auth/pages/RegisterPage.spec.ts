import RegisterPage from "@app/domains/auth/pages/RegisterPage.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockRegister, mockGoToDashboard} = vi.hoisted(() => ({mockRegister: vi.fn(), mockGoToDashboard: vi.fn()}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    familyHttpService: {
        getRequest: vi.fn(),
        postRequest: vi.fn(),
        putRequest: vi.fn(),
        patchRequest: vi.fn(),
        deleteRequest: vi.fn(),
        registerRequestMiddleware: vi.fn(() => vi.fn()),
        registerResponseMiddleware: vi.fn(() => vi.fn()),
        registerResponseErrorMiddleware: vi.fn(() => vi.fn()),
    },
    familyAuthService: {register: mockRegister, isLoggedIn: {value: false}},
    familyRouterService: {goToDashboard: mockGoToDashboard, goToRoute: vi.fn()},
    FamilyRouterLink: {template: "<a><slot /></a>", props: ["to"]},
}));

describe("RegisterPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(RegisterPage);

    it("renders six real TextInput components for all registration fields", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs).toHaveLength(6);

        const htmlInputs = wrapper.findAll("input");
        expect(htmlInputs).toHaveLength(6);
    });

    it("passes correct labels to each TextInput", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        const labels = inputs.map((i) => i.props("label"));
        expect(labels).toEqual([
            "auth.inviteCode",
            "auth.familyName",
            "auth.name",
            "auth.email",
            "auth.password",
            "auth.passwordConfirmation",
        ]);
    });

    it("marks invite code as optional, all others as required", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        const optionals = inputs.map((i) => i.props("optional"));
        expect(optionals).toEqual([true, false, false, false, false, false]);
    });

    it("renders password fields with password type", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        const types = inputs.map((i) => i.props("type"));
        expect(types).toEqual(["text", "text", "text", "email", "password", "password"]);
    });

    it("flows form submission through real components", async () => {
        mockRegister.mockResolvedValue(undefined);
        const wrapper = mountPage();

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockRegister).toHaveBeenCalled();
        expect(mockGoToDashboard).toHaveBeenCalled();
    });

    it("renders a real PrimaryButton for submission", () => {
        const wrapper = mountPage();

        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);
        expect(button.find("button").attributes("type")).toBe("submit");
        expect(button.text()).toBe("auth.register");
    });
});
