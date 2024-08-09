import addToCampaign from "./utility/addToCampaign.js";
import createCampaign from "./utility/createCampaign.js";
import selectAnnouncementsChannel from "./utility/selectAnnouncementsChannel.js";
// Used var instead of const to avoid temporal dead zone - see https://eslint.org/docs/latest/rules/no-use-before-define
export default {
    'add': addToCampaign,
    'create_campaign': createCampaign,
    'select_announcements_channel':selectAnnouncementsChannel,
};