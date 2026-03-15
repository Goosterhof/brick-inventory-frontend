import IdentifyBrickPage from "@app/domains/sets/pages/IdentifyBrickPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import CameraCapture from "@shared/components/scanner/CameraCapture.vue";
import {flushPromises, shallowMount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockPostRequest, mockGoToRoute} = vi.hoisted(() => ({mockPostRequest: vi.fn(), mockGoToRoute: vi.fn()}));

vi.mock("@app/services", () => ({
    familyHttpService: {
        getRequest: vi.fn(),
        postRequest: mockPostRequest,
        putRequest: vi.fn(),
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
    familyRouterService: {goToDashboard: vi.fn(), goToRoute: mockGoToRoute},
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
    FamilyRouterView: {template: "<div><slot /></div>"},
    FamilyRouterLink: {template: "<a><slot /></a>"},
}));

describe("IdentifyBrickPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render page header", () => {
        // Arrange & Act
        const wrapper = shallowMount(IdentifyBrickPage);

        // Assert
        expect(wrapper.findComponent(PageHeader).props("title")).toBe("sets.identifyBrick");
    });

    it("should render CameraCapture component", () => {
        // Arrange & Act
        const wrapper = shallowMount(IdentifyBrickPage);

        // Assert
        expect(wrapper.findComponent(CameraCapture).exists()).toBe(true);
    });

    it("should render back button", () => {
        // Arrange & Act
        const wrapper = shallowMount(IdentifyBrickPage);

        // Assert
        expect(wrapper.findComponent(BackButton).exists()).toBe(true);
    });

    it("should navigate back when back button is clicked", async () => {
        // Arrange
        const wrapper = shallowMount(IdentifyBrickPage);

        // Act
        wrapper.findComponent(BackButton).vm.$emit("click");
        await flushPromises();

        // Assert
        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });

    it("should send image to identify endpoint on capture", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 42, part_num: "3001", name: "Brick 2 x 4", category: null, image_url: null},
        });
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});

        // Act
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Assert
        expect(mockPostRequest).toHaveBeenCalledWith("/identify-brick", expect.any(FormData));
    });

    it("should display identified part", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {
                id: 42,
                part_num: "3001",
                name: "Brick 2 x 4",
                category: null,
                image_url: "https://example.com/3001.jpg",
            },
        });
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});

        // Act
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("Brick 2 x 4");
        expect(wrapper.text()).toContain("3001");
    });

    it("should hide camera after capture", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 42, part_num: "3001", name: "Brick 2 x 4", category: null, image_url: null},
        });
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});

        // Act
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(CameraCapture).exists()).toBe(false);
    });

    it("should show error on identification failure", async () => {
        // Arrange
        mockPostRequest.mockRejectedValue(new Error("Server error"));
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});

        // Act
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("sets.identifyError");
    });

    it("should show identifying state while in progress", async () => {
        // Arrange
        let resolveRequest: ((value: unknown) => void) | undefined;
        mockPostRequest.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            }),
        );
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});

        // Act
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Assert
        expect(wrapper.text()).toContain("sets.identifying");
        resolveRequest?.({data: {id: 42, part_num: "3001", name: "Brick 2 x 4", category: null, image_url: null}});
    });

    it("should reset state when try again is clicked after success", async () => {
        // Arrange
        mockPostRequest.mockResolvedValue({
            data: {id: 42, part_num: "3001", name: "Brick 2 x 4", category: null, image_url: null},
        });
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Act
        const tryAgainButton = wrapper
            .findAllComponents(PrimaryButton)
            .find((btn) => btn.text() === "sets.identifyAgain");
        await tryAgainButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(CameraCapture).exists()).toBe(true);
        expect(wrapper.text()).not.toContain("Brick 2 x 4");
    });

    it("should reset state when try again is clicked after error", async () => {
        // Arrange
        mockPostRequest.mockRejectedValue(new Error("Server error"));
        const wrapper = shallowMount(IdentifyBrickPage);
        const blob = new Blob(["image"], {type: "image/jpeg"});
        wrapper.findComponent(CameraCapture).vm.$emit("capture", blob);
        await flushPromises();

        // Act
        const tryAgainButton = wrapper
            .findAllComponents(PrimaryButton)
            .find((btn) => btn.text() === "sets.identifyAgain");
        await tryAgainButton?.trigger("click");
        await flushPromises();

        // Assert
        expect(wrapper.findComponent(CameraCapture).exists()).toBe(true);
        expect(wrapper.text()).not.toContain("sets.identifyError");
    });
});
