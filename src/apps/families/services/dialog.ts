import {EntryNotFoundError} from "@script-development/fs-adapter-store";
import {createDialogService} from "@shared/services/dialog";

export const familyDialogService = createDialogService();

familyDialogService.registerErrorMiddleware((error, {closeAll}) => {
    if (error instanceof EntryNotFoundError) {
        closeAll();
        return false;
    }

    return true;
});
