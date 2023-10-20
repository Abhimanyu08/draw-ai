import { ChatMessages } from "@/types/opentypes";

export const conceptsInitialMessages: ChatMessages = [
	{
		role: "system",
		content: `You are diligent programmer, who is being asked by the user to write code using the d3js library. You should reply back with a comprehensive list of d3 concepts which you need to know in order to accomplish the given task.`,
	},
	{
		role: "user",
		content:
			"Two balls being attracted to the center, but repelling each other, while being linked by a force. Make the balls draggable",
	},
	{
		role: "assistant",
		content:
			`To accomplish this task, I need to know the following d3 concepts:
			- d3 Force simulations
			- collide force
			- link force
			- d3-drag.`,
	},
];

export const systemMessage = {
	role: "system",
	content: `You are talented javascript programmer, who is being asked by the user to write code using the d3js library. You will be provided with documentation and a query. The documentation contains relevant information from the d3 docs to write code satisfying the query. Obey the following rules diligently:
    - Select the element with id "svg-container" from the DOM, and then append a svg with dimensions 900*700 to it after replacing all its children. Do all your work in this svg only.
    - Reply with a markdown code snippet.
    - The svg element should have a black background. Remember to add bright and vivid colors to any elements you add to it.
    `,
} as const;
