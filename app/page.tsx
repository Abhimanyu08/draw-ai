"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
	const [query, setQuery] = useState("");
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
		// const text = await resp.text();

		// if (text) {
		// 	setCode(/```javascript([\s\S]*)```/.exec(text)?.at(1) || "");
		// 	return;
		// }

		const body = resp.body;
		const status = resp.status;
		if (!body || status !== 200) {
			alert(resp.statusText);
			return;
		}

		const reader = body.getReader();

		let doneReading = false;
		while (!doneReading) {
			const { value, done } = await reader.read();
			doneReading = done;

			const decodedValue = decoder.decode(value);

			setCode((p) => {
				const newCode = p.concat(decodedValue);
				const startRegex = /```javascript([\s\S]*)/;
				if (startRegex.test(newCode)) {
					const match = newCode.match(startRegex)?.at(1);

					return match || "";
				}
				const endRegex = /([\s\S]+)```/;
				if (endRegex.test(newCode)) {
					const match = newCode.match(endRegex)?.at(1);
					return match || "";
				}

				return newCode;
			});
		}
		setFinished(true);
	};

	useEffect(() => {
		if (!finished) return;
		if (!code) return;

		const previousScript = document.getElementById("generated-code");
		if (previousScript) {
			document.body.removeChild(previousScript);
		}

		if (code) {
			const script = document.createElement("script");
			script.text = code;
			script.id = "generated-code";
			document.body.appendChild(script);
		}
	}, [finished]);

	return (
		<main className="flex h-screen flex-col items-center gap-8 p-8">
			<div className="flex gap-4 min-h-0 w-full h-[600px]">
				<div className="basis-5/12 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-black">
					<SyntaxHighlighter
						language="javascript"
						style={coldarkDark}
						customStyle={{
							width: "max-content",
							minWidth: "100%",
							minHeight: "100%",
							margin: "0px",
							height: "max-content",
							paddingTop: "1px",
						}}
					>
						{code}
					</SyntaxHighlighter>
				</div>

				<div className="basis-7/12 flex flex-col items-end justify-center">
					<svg
						className="border-border border-2 rounded-sm bg-black box-content"
						width={900}
						height={700}
					></svg>
				</div>
			</div>
			<div className="flex gap-5 w-3/4 items-center relative">
				<Input
					className="grow"
					id="inp"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Button
					onClick={() => onGenerate()}
					className="absolute right-0"
					disabled={query === ""}
					variant={query ? "default" : "ghost"}
				>
					<SendHorizontal size={18} />
				</Button>
			</div>
		</main>
	);
}
