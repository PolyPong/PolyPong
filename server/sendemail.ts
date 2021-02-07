import { IRequestBody, sendMail } from "https://deno.land/x/sendgrid/mod.ts";
import apiKey from "./apiKey.ts";

export const sendEmail = async (j: string) => {
  const mail: IRequestBody = {
    personalizations: [{
      subject: "Hello world",
      to: [
        { email: "jychang@ualberta.ca" },
        { email: "mantifao@ualberta.ca " },
        { email: "awoosare@ualberta.ca" },
      ],
    }],
    from: { email: "heyitworks@polypong.ca" },
    content: [
      { type: "text/plain", value: "Hello world" },
      {
        type: "text/html",
        value: `todo make this a nice link to click on ${j}`,
      },
    ],
  };

  const response = await sendMail(mail, { apiKey });

  console.log("success", response);
};
