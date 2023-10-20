import { openai } from "@/lib/createClients";
import { conceptsInitialMessages, systemMessage } from "@/lib/messages";
import { ChatMessages } from "@/types/opentypes";
import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const functions: Parameters<
	typeof openai.chat.completions.create
>["0"]["functions"] = [
		{
			name: "get_d3_docs",
			description:
				"Returns a string of relevant d3 api functions and their documentation",
			parameters: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description:
							"A string containing comma separated names of d3 concepts whose documentation is required.",
					},
				},
				required: ["query"],
			},
		},
	];

// export async function POST(request: Request) {
// 	const supabase = createRouteHandlerClient<Database>({ cookies });
// 	const { query } = await request.json();

// 	const message = {
// 		role: "user",
// 		content: query,
// 	} as const;

// 	//----------------Retrieve the d3 concepts which would be useful in satisfying this user query--------------------

// 	const conceptsResponse = await openai.chat.completions.create({
// 		model: "gpt-3.5-turbo",
// 		messages: [...conceptsInitialMessages, message],
// 	});

// 	const conceptsToRetrieve = conceptsResponse.choices[0].message.content;

// 	if (!conceptsToRetrieve) {
// 		return new Response(null, {
// 			status: 500,
// 			statusText: "error in retrieving concepts for the task",
// 		});
// 	}

// 	//------------------embed those concepts string, so that we can retrieve relevant docs from the d3 docs-------------------
// 	const conceptEmbeddingResponse = await openai.embeddings.create({
// 		model: "text-embedding-ada-002",
// 		input: conceptsToRetrieve.replace(/\n/g, " "),
// 	});

// 	const conceptEmbeddings = conceptEmbeddingResponse.data[0].embedding;

// 	//----------------------retrieve the concepts from d3 docs embedded in supabase----------------------
// 	const { data, error } = await supabase.rpc("match_documents", {
// 		query_embedding: conceptEmbeddings,
// 		match_threshold: 0.7,
// 		match_count: 3,
// 	});

// 	if (error) {
// 		return new Response(null, {
// 			status: parseInt(error.code),
// 			statusText: error.message,
// 		});
// 	}

// 	if (!data || data.length === 0) {
// 		return new Response(null, {
// 			status: 500,
// 			statusText: "error in retrieving embeddings from supabase",
// 		});
// 	}

// 	let context = "";
// 	for (let document of data) {
// 		context += `${document.content.trim()}\n---\n`;
// 	}
// 	if (!context) {
// 		return new Response(null, {
// 			status: 500,
// 			statusText: "error in retrieving context from supabase",
// 		});
// 	}

// 	//-----------------------------Now send back the related documents and user query in a new chat message---------------------
// 	const getCodeMessage: ChatMessages[number] = {
// 		role: "user",
// 		content: `Context: ${context}\n-----\n Query: ${query}`,
// 	};

// 	const response = await openai.chat.completions.create({
// 		model: "gpt-3.5-turbo-16k",
// 		messages: [systemMessage, getCodeMessage],
// 		stream: true,
// 	});

// 	//------------------------stream the code back to client----------------------------------------
// 	const stream = new ReadableStream({
// 		async start(controller) {
// 			for await (let chunk of response) {
// 				if (chunk.choices.at(0)?.finish_reason === "stop") {
// 					controller.close();
// 				} else {
// 					controller.enqueue(chunk.choices.at(0)?.delta.content);
// 				}
// 			}
// 		},
// 	});

// 	return new Response(stream, {
// 		status: 200,
// 		headers: new Headers({
// 			"Cache-Control": "no-cache",
// 		}),
// 	});
// }


export async function POST() {

	const code = `\`\`\`javascript \n // Select the svg container element
const svgContainer = d3.select("#svg-container");

// Remove all children of the svg container
svgContainer.selectAll("*").remove();

// Append a new svg with dimensions 900*700 to the svg container
const svg = svgContainer
  .append("svg")
  .attr("width", 900)
  .attr("height", 700);

// Set the background color of the svg to black
svg.style("background-color", "black");

// Define constants
const radius = 50;
const floorHeight = 50;
const gravity = 0.4;
const energyLoss = 0.8;

// Append a circle representing the ball to the svg
const ball = svg
  .append("circle")
  .attr("cx", 450)
  .attr("cy", 350)
  .attr("r", radius)
  .style("fill", "red");

// Define initial position and velocity of the ball
let x = 450;
let y = 350 - radius;
let vy = 0;

// Create a simulation to update the position of the ball
const simulation = d3.forceSimulation()
  .on("tick", () => {
    // Apply gravity to the ball
    vy += gravity;
    y += vy;

    // Check for collision with the floor
    if (y + radius >= 700 - floorHeight) {
      // Adjust position and velocity after collision
      y = 700 - floorHeight - radius;
      vy *= -energyLoss;
    }

    // Update the position of the ball
    ball.attr("cy", y);
  });

// Start the simulation
simulation.restart();\n \`\`\`
`

	const stream = new ReadableStream({
		async start(controller) {
			let slice = 0
			while (slice < code.length) {
				await new Promise(res => setTimeout(res, 50))
				controller.enqueue(code.slice(slice, slice + 20));
				slice += 20
			}
			controller.close()
		},
	});

	return new Response(stream, {
		status: 200,
		headers: new Headers({
			"Cache-Control": "no-cache",
		}),
	});
}