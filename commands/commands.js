import * as addToCampaign from "./utility/addToCampaign.js";
import * as createCampaign from "./utility/createCampaign.js";
import * as selectAnnouncementsChannel from "./utility/selectAnnouncementsChannel.js";

export const commands = {
    'add': addToCampaign,
    'create_campaign': createCampaign,
    'select_announcements_channel':selectAnnouncementsChannel,
};