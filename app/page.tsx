"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { remark } from "remark";
import strip from "strip-markdown";

export default function Home() {
	const [query, setQuery] = useState(
		"graph of sine and cosine waves from 0 degree to 180 degree. Sine wave is colored red, while the cosing wave is colored blue. Label the axes accodingly"
	);
	const [code, setCode] = useState("");
	const [finished, setFinished] = useState(true);

	const onGenerate = async () => {
		setFinished(false);
		const decoder = new TextDecoder();
		const resp = await fetch("/api", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query }),
		});

		const body = resp.body;
		const status = resp.status;
		if (!body || status !== 200) {
			alert(resp.statusText);
			return;
		}
		const reader = resp.body.getReader();

		let doneReading = false;
		while (!doneReading) {
			const { value, done } = await reader.read();
			doneReading = done;

			const decodedValue = decoder.decode(value);

			setCode((p) => p.concat(decodedValue));
		}
		setFinished(true);
	};

	useEffect(() => {
		if (!finished) return;
		if (!code) return;

		const codeSnippetMatch = code.match(/```javascript([\s\S]*)```/);

		if (codeSnippetMatch) {
			let codeSnippet = codeSnippetMatch[1];

			const script = document.createElement("script");
			script.text = codeSnippet;
			document.body.appendChild(script);
		}
	}, [finished]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between gap-2 p-6">
			<div className="flex gap-4 w-full grow">
				<textarea
					name=""
					id=""
					className="basis-4/12 border-2 border-black"
					value={code}
					onChange={(e) => setCode(e.target.value)}
				></textarea>
				<div className="basis-8/12 flex flex-col items-center justify-center">
					<svg
						className="border-black border-2"
						width={800}
						height={600}
					></svg>
				</div>
			</div>
			<div className="flex gap-2 w-full">
				<Input
					className="grow"
					id="inp"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Button onClick={() => onGenerate()}>Generate</Button>
			</div>
		</main>
	);
}
