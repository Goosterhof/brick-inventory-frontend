import IdentifyBrickPage from "@app/domains/sets/pages/IdentifyBrickPage.vue";
import BackButton from "@shared/components/BackButton.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import CameraCapture from "@shared/components/scanner/CameraCapture.vue";
import {flushPromises, mount} from "@vue/test-utils";
import {beforeEach, describe, expect, it, vi} from "vitest";

const {mockPostRequest, mockGoToRoute} = vi.hoisted(() => ({mockPostRequest: vi.fn(), mockGoToRoute: vi.fn()}));

vi.mock("axios", () => ({isAxiosError: () => false, AxiosError: Error}));
vi.mock("string-ts", () => ({deepCamelKeys: <T>(o: T): T => o, deepSnakeKeys: <T>(o: T): T => o}));
vi.mock("@app/services", () => ({
    familyTranslationService: {t: (key: string) => ({value: key}), locale: {value: "en"}},
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
    familyRouterService: {goToRoute: mockGoToRoute},
}));

describe("IdentifyBrickPage — integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mountPage = () => mount(IdentifyBrickPage);

    it("renders PageHeader with BackButton", () => {
        const wrapper = mountPage();

        const pageHeader = wrapper.findComponent(PageHeader);
        expect(pageHeader.find("h1").text()).toBe("sets.identifyBrick");

        const backButton = wrapper.findComponent(BackButton);
        expect(backButton.find("button").exists()).toBe(true);
    });

    it("renders real CameraCapture component with correct props", () => {
        const wrapper = mountPage();

        const camera = wrapper.findComponent(CameraCapture);
        expect(camera.exists()).toBe(true);
        expect(camera.props("loadingText")).toBe("sets.startingCamera");
        expect(camera.props("captureText")).toBe("sets.capturePhoto");
    });

    it("shows identified part after capture", async () => {
        mockPostRequest.mockResolvedValue({data: {name: "Brick 2x4", partNum: "3001", imageUrl: null}});

        const wrapper = mountPage();

        const camera = wrapper.findComponent(CameraCapture);
        camera.vm.$emit("capture", new Blob(["test"]));
        await flushPromises();

        expect(wrapper.text()).toContain("Brick 2x4");
        expect(wrapper.text()).toContain("3001");

        const tryAgainBtn = wrapper
            .findAllComponents(PrimaryButton)
            .find((b) => b.text().includes("sets.identifyAgain"));
        expect(tryAgainBtn).toBeDefined();
    });

    it("shows error message when identification fails", async () => {
        mockPostRequest.mockRejectedValue(new Error("Server error"));

        const wrapper = mountPage();

        const camera = wrapper.findComponent(CameraCapture);
        camera.vm.$emit("capture", new Blob(["test"]));
        await flushPromises();

        expect(wrapper.text()).toContain("sets.identifyError");
    });

    it("hides camera and shows identifying state during API call", async () => {
        mockPostRequest.mockReturnValue(new Promise(() => {}));

        const wrapper = mountPage();

        const camera = wrapper.findComponent(CameraCapture);
        camera.vm.$emit("capture", new Blob(["test"]));
        await flushPromises();

        expect(wrapper.text()).toContain("sets.identifying");
    });

    it("navigates back via BackButton", async () => {
        const wrapper = mountPage();

        const backButton = wrapper.findComponent(BackButton);
        await backButton.find("button").trigger("click");

        expect(mockGoToRoute).toHaveBeenCalledWith("sets");
    });
});
