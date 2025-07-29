import { NextResponse } from "next/server";

// Função para converter "15,11,2040" → "2040-11-15"
function formatarData(valor) {
  if (typeof valor === "string" && valor.includes(",")) {
    const [dia, mes, ano] = valor.split(",");
    if (dia && mes && ano) {
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }
  return valor;
}

export async function PUT(request, { params }) {
  const { num_processo, id_nodo, id_usuario } = params;

  try {
    const body = await request.json();

    // Formata datas no campo ttableId === 6212
    for (const tableId in body.tables) {
      const table = body.tables[tableId];
      for (const lineId in table.lines) {
        const campos = table.lines[lineId];
        for (const campo of campos) {
          if (campo.ttableId === 6212) {
            campo.value = formatarData(campo.value);
          }
        }
      }
    }

    const token = process.env.API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Token não configurado no .env." },
        { status: 500 }
      );
    }

    const externalEndpoint = `https://0221.fluid.sicredi.io/pato/process/api/v2/process/${num_processo}/node/${id_nodo}/form/table/row`;

    const response = await fetch(externalEndpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
        "Target-User-ID": id_usuario,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    return NextResponse.json(
      {
        message: "Requisição enviada com sucesso.",
        status: response.status,
        data: responseData,
      },
      { status: response.status }
    );
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
