import type { AppNode, AppEdge } from "./types";
import { DIAGRAM_TEMPLATES } from "./templates";

export interface DiagramPayload {
  version: number;
  nodes: AppNode[];
  edges: AppEdge[];
  templateId?: string;
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function crc32(bytes: Uint8Array, offset = 0, length = bytes.length): number {
  let crc = -1;
  for (let i = offset; i < offset + length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const CHUNK_KEYWORD = "devsolve:diagram";

export function embedDiagramInPng(
  pngBytes: ArrayBuffer | Uint8Array,
  diagram: { nodes: AppNode[]; edges: AppEdge[]; templateId?: string },
): Uint8Array {
  const png =
    pngBytes instanceof Uint8Array ? pngBytes : new Uint8Array(pngBytes);

  if (
    png.length < 8 ||
    png[0] !== 0x89 ||
    png[1] !== 0x50 ||
    png[2] !== 0x4e ||
    png[3] !== 0x47 ||
    png[4] !== 0x0d ||
    png[5] !== 0x0a ||
    png[6] !== 0x1a ||
    png[7] !== 0x0a
  ) {
    throw new Error("Invalid PNG header signature");
  }

  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const ihdrLen = view.getUint32(8);
  const insertPos = 8 + 4 + 4 + ihdrLen + 4;

  const keywordBytes = new TextEncoder().encode(CHUNK_KEYWORD);
  const payload: DiagramPayload = {
    version: 1,
    nodes: diagram.nodes,
    edges: diagram.edges,
    templateId: diagram.templateId,
  };
  const jsonText = JSON.stringify(payload);
  const textBytes = new TextEncoder().encode(jsonText);

  const chunkData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  chunkData.set(keywordBytes, 0);
  chunkData[keywordBytes.length] = 0; 
  chunkData.set(textBytes, keywordBytes.length + 1);

  const typeBytes = new Uint8Array([0x74, 0x45, 0x58, 0x74]);

  const forCrc = new Uint8Array(4 + chunkData.length);
  forCrc.set(typeBytes, 0);
  forCrc.set(chunkData, 4);
  const crcVal = crc32(forCrc);

  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  const chunkView = new DataView(chunk.buffer);
  chunkView.setUint32(0, chunkData.length);
  chunk.set(typeBytes, 4);
  chunk.set(chunkData, 8);
  chunkView.setUint32(8 + chunkData.length, crcVal);

  const result = new Uint8Array(png.length + chunk.length);
  result.set(png.subarray(0, insertPos), 0);
  result.set(chunk, insertPos);
  result.set(png.subarray(insertPos), insertPos + chunk.length);

  return result;
}

export function extractDiagramFromPng(
  pngBytes: ArrayBuffer | Uint8Array,
): DiagramPayload | null {
  const png =
    pngBytes instanceof Uint8Array ? pngBytes : new Uint8Array(pngBytes);

  if (png.length < 8 || png[0] !== 0x89 || png[1] !== 0x50) {
    return null;
  }

  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  let offset = 8;
  const decoder = new TextDecoder("utf-8");

  while (offset + 8 <= png.length) {
    const len = view.getUint32(offset);
    const type = String.fromCharCode(
      png[offset + 4],
      png[offset + 5],
      png[offset + 6],
      png[offset + 7],
    );

    if (type === "tEXt" && offset + 8 + len <= png.length) {
      const data = png.subarray(offset + 8, offset + 8 + len);
      const nullIdx = data.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = String.fromCharCode(...data.subarray(0, nullIdx));
        if (keyword === CHUNK_KEYWORD) {
          try {
            const jsonText = decoder.decode(data.subarray(nullIdx + 1));
            const parsed = JSON.parse(jsonText);
            if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
              return parsed as DiagramPayload;
            }
          } catch (e) {
            console.warn("Failed to parse diagram JSON from PNG tEXt chunk", e);
          }
        }
      }
    }

    offset += 8 + len + 4;
  }

  return null;
}

export async function extractDiagramFromBlobOrFile(
  blobOrFile: Blob,
): Promise<DiagramPayload | null> {
  try {
    const arrayBuffer = await blobOrFile.arrayBuffer();
    return extractDiagramFromPng(arrayBuffer);
  } catch {
    return null;
  }
}

const KNOWN_LEGACY_STEP_TEMPLATES: Record<string, string> = {
  "55ceba6e-7be5-4958-855d-d68de82aeebe": "concept-ddd",
  "d217e8e7-2fc8-44f7-83fd-0b72ba624dd8": "concept-ddd",
  "7943cb44-741e-4c49-9ee1-45b836319af7": "concept-ddd",
};

export async function fetchAndExtractDiagram(
  url: string,
  stepId?: string,
): Promise<DiagramPayload | null> {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const extracted = extractDiagramFromPng(buffer);
      if (extracted) {
        return extracted;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch/extract diagram PNG chunks:", err);
  }

  const checkKeys = [stepId, url].filter((k): k is string => Boolean(k));
  for (const key of checkKeys) {
    for (const [pattern, templateId] of Object.entries(
      KNOWN_LEGACY_STEP_TEMPLATES,
    )) {
      if (key.includes(pattern)) {
        const tpl = DIAGRAM_TEMPLATES.find((t) => t.id === templateId);
        if (tpl) {
          return {
            version: 1,
            nodes: tpl.nodes,
            edges: tpl.edges,
            templateId: tpl.id,
          };
        }
      }
    }
  }

  return null;
}
