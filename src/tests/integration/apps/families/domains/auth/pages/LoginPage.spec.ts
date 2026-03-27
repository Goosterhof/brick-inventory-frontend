import LoginPage from "@app/domains/auth/pages/LoginPage.vue";
import TextInput from "@shared/components/forms/inputs/TextInput.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockLogin, mockGoToDashboard} = vi.hoisted(() => ({mockLogin: vi.fn(), mockGoToDashboard: vi.fn()}));

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
    familyAuthService: {login: mockLogin, isLoggedIn: {value: false}},
    familyRouterService: {goToDashboard: mockGoToDashboard, goToRoute: vi.fn()},
    FamilyRouterLink: {template: "<a><slot /></a>", props: ["to"]},
}));

describe("LoginPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(LoginPage);

    it("renders real TextInput components with label and input elements", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        expect(inputs).toHaveLength(2);

        // Real TextInput renders <input> elements — stubs would not
        const htmlInputs = wrapper.findAll("input");
        expect(htmlInputs).toHaveLength(2);
    });

    it("passes correct props to TextInput children", () => {
        const wrapper = mountPage();

        const inputs = wrapper.findAllComponents(TextInput);
        const emailInput = inputs.find((i) => i.props("type") === "email");
        const passwordInput = inputs.find((i) => i.props("type") === "password");

        expect(emailInput).toBeDefined();
        expect(passwordInput).toBeDefined();
        expect(emailInput?.props("label")).toBe("auth.email");
        expect(passwordInput?.props("label")).toBe("auth.password");
    });

    it("renders a real PrimaryButton with submit type", () => {
        const wrapper = mountPage();

        const button = wrapper.findComponent(PrimaryButton);
        expect(button.exists()).toBe(true);

        // Real PrimaryButton renders a <button> element with the correct type
        const htmlButton = button.find("button");
        expect(htmlButton.attributes("type")).toBe("submit");
    });

    it("flows form submission through real components to the service layer", async () => {
        mockLogin.mockResolvedValue(undefined);
        const wrapper = mountPage();

        // Type into real input elements
        const htmlInputs = wrapper.findAll("input");
        const emailEl = htmlInputs.find((i) => i.attributes("type") === "email");
        const passwordEl = htmlInputs.find((i) => i.attributes("type") === "password");

        await emailEl?.setValue("john@example.com");
        await passwordEl?.setValue("secret");

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(mockLogin).toHaveBeenCalledWith({email: "john@example.com", password: "secret"});
        expect(mockGoToDashboard).toHaveBeenCalled();
    });

    it("renders the register link via FamilyRouterLink", () => {
        const wrapper = mountPage();

        // FamilyRouterLink stub renders an <a> with slot content
        const link = wrapper.find("a");
        expect(link.exists()).toBe(true);
        expect(wrapper.text()).toContain("auth.noAccountYet");
    });
});
