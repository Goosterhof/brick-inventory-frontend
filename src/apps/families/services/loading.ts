import {createLoadingService} from "@shared/services/loading";
import {registerLoadingMiddleware} from "@shared/services/loading-middleware";

import {familyHttpService} from "./http";

export const familyLoadingService = createLoadingService();

registerLoadingMiddleware(familyHttpService, familyLoadingService);
