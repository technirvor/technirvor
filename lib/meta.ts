import {
  FacebookAdsApi,
  ServerEvent,
  UserData,
  EventRequest,
  CustomData,
} from "facebook-nodejs-business-sdk";

const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

if (!accessToken || !pixelId) {
  throw new Error("Missing Meta Pixel API credentials");
}

FacebookAdsApi.init(accessToken);

export const sendServerEvent = async (
  eventName: string,
  eventData: Record<string, any>,
) => {
  const userData = new UserData();
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
  const eventRequest = new EventRequest(accessToken, pixelId).setEvents(
    eventsData,
  );

  try {
    const response = await eventRequest.execute();
    console.log("Meta Pixel API response:", response);
  } catch (error) {
    console.error("Error sending event to Meta Pixel API:", error);
  }
};
