import Dysmsapi20170525 from "@alicloud/dysmsapi20170525";
import { SendSmsRequest } from "@alicloud/dysmsapi20170525";
import { Config } from "@alicloud/openapi-client";
import { RuntimeOptions } from "@alicloud/tea-util";

const SMS_TEMPLATE_CODE =
  process.env.ALIYUN_SMS_TEMPLATE_CODE || "SMS_501785871";
const SMS_ENDPOINT = process.env.ALIYUN_SMS_ENDPOINT || "dysmsapi.aliyuncs.com";

interface NewMessageSmsPayload {
  name: string;
  time: string;
}

function getSmsConfig() {
  return {
    accessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || "",
    signName: process.env.ALIYUN_SMS_SIGN_NAME || "",
    receiverPhone: process.env.ALIYUN_SMS_RECEIVER_PHONE || "",
  };
}

function createSmsClient(
  accessKeyId: string,
  accessKeySecret: string
): Dysmsapi20170525 {
  const config = new Config({
    accessKeyId,
    accessKeySecret,
    endpoint: SMS_ENDPOINT,
  });
  return new Dysmsapi20170525(config);
}

export async function sendNewMessageSms(
  payload: NewMessageSmsPayload
): Promise<void> {
  const { accessKeyId, accessKeySecret, signName, receiverPhone } =
    getSmsConfig();

  if (!accessKeyId || !accessKeySecret || !signName || !receiverPhone) {
    throw new Error("Aliyun SMS environment variables are not fully configured");
  }

  const client = createSmsClient(accessKeyId, accessKeySecret);
  const request = new SendSmsRequest({
    signName,
    templateCode: SMS_TEMPLATE_CODE,
    phoneNumbers: receiverPhone,
    templateParam: JSON.stringify({
      time: payload.time,
      name: payload.name,
    }),
  });

  const runtime = new RuntimeOptions({});
  const response = await client.sendSmsWithOptions(request, runtime);
  const resultCode = response.body?.code;

  if (resultCode !== "OK") {
    const resultMessage = response.body?.message || "Unknown SMS error";
    throw new Error(`Aliyun SMS send failed: ${resultCode} ${resultMessage}`);
  }
}
