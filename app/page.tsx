"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { EditorView, basicSetup } from "codemirror";
import { SendHorizontal } from "lucide-react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { useEffect, useState } from "react";
import { barf } from "thememirror";

import { visit } from "unist-util-visit";
export default function Home() {
	const [query, setQuery] = useState("");
	const [render, setRender] = useState(false);
	const [editorView, setEditorView] = useState<EditorView | null>(null);

	useEffect(() => {
		if (editorView) return;
		const parent = document.getElementById("code")!;
		parent.replaceChildren("");
		let startState = EditorState.create({
			doc: "",
			extensions: [
				basicSetup,
				javascript(),
				barf,
				keymap.of([
					{
						key: "Shift-Enter",

						run() {
							setRender(true);
							return true;
						},
					},
				]),
				EditorView.theme({
					".cm-content": {
						fontSize: "16px",
					},

					".cm-gutterElement": {
						fontSize: "16px",
					},
				}),
			],
		});

		let view = new EditorView({
			state: startState,
			parent: parent,
		});
		setEditorView(view);
	}, []);

	const generateCode = async () => {
		if (!editorView) return;
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
		let responseString = "";
		while (!doneReading) {
			const { value, done } = await reader.read();
			doneReading = done;

			const decodedValue = decoder.decode(value);
			responseString = responseString.concat(decodedValue);

			const mdast = fromMarkdown(responseString);

			visit(mdast, (node) => {
				if (node.type === "code") {
					const docLength = editorView.state.doc.length;
					editorView.dispatch({
						changes: {
							from: 0,
							to: docLength,
							insert: node.value,
						},
					});
				}
			});
		}
		setRender(true);
	};

	useEffect(() => {
		if (!render) return;
		if (!editorView) return;

		const code = editorView.state.sliceDoc();

		const previousScript = document.getElementById("generated-code");
		if (previousScript) {
			document.body.removeChild(previousScript);
		}

		if (code) {
			const script = document.createElement("script");
			script.text = `function runCode() { ${code} \n } \n runCode()`;
			script.id = "generated-code";
			document.body.appendChild(script);
		}
		setRender(false);
	}, [render]);

	return (
		<main className="flex h-screen flex-col items-center gap-8 p-8">
			<div className="flex gap-4 min-h-0 w-full h-[600px]">
				<div
					className="basis-5/12 rounded-sm overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-black"
					id="code"
				></div>

				<div
					className="basis-7/12 flex flex-col items-end justify-center"
					id="svg-container"
				>
					{/* <svg
						className="border-border border-2 rounded-sm bg-black box-content"
						width={900}
						height={700}
					></svg> */}
				</div>
			</div>
			<div className="flex gap-5 w-3/4 items-center">
				<Input
					className=""
					id="inp"
					value={query}
					onKeyDown={(e) => {
						if (e.ctrlKey && e.key === "Enter") {
							generateCode();
						}
					}}
					placeholder="write your query, hit Ctrl-Enter to generate code"
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Button
					onClick={() => generateCode()}
					className=""
					disabled={query === ""}
					variant={query ? "default" : "ghost"}
				>
					<SendHorizontal size={18} />
				</Button>
			</div>
		</main>
	);
}
