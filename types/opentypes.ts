import { openai } from "@/lib/createClients";

export type ChatMessages = Parameters<
	typeof openai.chat.completions.create
>["0"]["messages"];
