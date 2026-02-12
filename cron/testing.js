import cron from "node-cron";
import { updateDraftToArchieveService } from "../services/artifact.service.js";

const testingFunction = () => {
    cron.schedule("21 15 * * * ", () => {
        console.log("Cron job running every second " + new Date().toISOString());
    });
}

const scheduledFunction = () => {
    console.log("Cron job for updating draft to archieve ")
    cron.schedule("0 0 */12 * *", () => {
        updateDraftToArchieveService();
    });
}

export { testingFunction, scheduledFunction };
