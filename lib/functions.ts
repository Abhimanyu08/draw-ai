import { openai, supabase } from "@/lib/createClients";
const getContext = async (query: string) => {
	const input = query.replace(/\n/g, " ");
	const embeddingResp = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input,
	});
	const embedding = embeddingResp.data[0].embedding;

	const { data: context } = await supabase.rpc("match_documents", {
		query_embedding: embedding,
		match_threshold: 0.7,
		match_count: 5,
	});

	return context?.map((c) => c.content + " ");
};
