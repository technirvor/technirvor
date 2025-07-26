import {
  FacebookAdsApi,
  ServerEvent,
  UserData,
  EventRequest,
  CustomData,
} from "facebook-nodejs-business-sdk";

const accessToken =
  process.env.NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN ||
  "your_meta_capi_access_token_here";
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

if (
  accessToken &&
  pixelId &&
  accessToken !== "your_meta_capi_access_token_here"
) {
  FacebookAdsApi.init(accessToken);
}

export const sendServerEvent = async (
  eventName: string,
  eventData: Record<string, any>,
) => {
  const userData = new UserData()
    .setFbc("fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890")
    .setFbp("fb.1.1558571054389.1098115397");
  const customData = new CustomData();
  if (eventData.value) {
    customData.value = eventData.value;
  }
  if (eventData.currency) {
    customData.currency = eventData.currency;
  }
  if (eventData.content_ids) {
    customData.content_ids = eventData.content_ids;
  }
  if (eventData.content_name) {
    customData.content_name = eventData.content_name;
  }
  if (eventData.content_type) {
    customData.content_type = eventData.content_type;
  }
  if (eventData.num_items) {
    customData.num_items = eventData.num_items;
  }
  if (eventData.order_id) {
    customData.order_id = eventData.order_id;
  }

  const serverEvent = new ServerEvent();
  serverEvent.event_name = eventName;
  serverEvent.event_time = Math.floor(Date.now() / 1000);
  serverEvent.user_data = userData;
  serverEvent.custom_data = customData;

  const eventsData = [serverEvent];
  if (
    !accessToken ||
    !pixelId ||
    accessToken === "your_meta_capi_access_token_here"
  ) {
    console.warn("Meta CAPI credentials not configured. Skipping event.");
    return;
  }

  const eventRequest = new EventRequest(accessToken, pixelId).setEvents(
    eventsData,
  );
};
