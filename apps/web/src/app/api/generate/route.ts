import { NextResponse } from "next/server";
import { type AgentConfig } from "@/lib/agents";

export async function POST(req: Request) {
  try {
    const { notasCrudas, agentConfig } = await req.json() as {
      notasCrudas: string;
      agentConfig: AgentConfig;
    };

    if (!notasCrudas || !agentConfig) {
      return NextResponse.json(
        { error: "Faltan notasCrudas o agentConfig" },
        { status: 400 }
      );
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: "La API key de Anthropic no está configurada." },
        { status: 500 }
      );
    }

    const sectionsList = agentConfig.secciones
      .map((sec: string, index: number) => `${index + 1}. ${sec}`)
      .join("\n");

    const systemPrompt = `You are an expert construction site assistant.
Your job is to generate a structured document based on raw field notes.
The document type is: ${agentConfig.nombre}.
Description: ${agentConfig.descripcion}

You must organize the raw field notes into the following sections:
${sectionsList}

Return ONLY a valid JSON object matching the following structure. Do not return markdown, do not wrap in \`\`\`json.
{
  "titulo": "A concise title based on the notes",
  "secciones": [
    {
      "numero": 1,
      "heading": "Section Heading",
      "body": "Detailed content based on the raw notes or structure.",
      "source": "notas" // or "estructura" if the content is boilerplate or not explicitly backed by the field notes.
    }
  ]
}
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: "user", content: `Raw field notes: ${notasCrudas}` }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "Error al generar el documento con Anthropic." },
        { status: response.status }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
