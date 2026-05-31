const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs";

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // unpkg mirrors npm directly so the worker URL is always available
  pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  return fullText.trim();
}
