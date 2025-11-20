export const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Underline
    .replace(/`/g, '')               // Code
    .replace(/#{1,6}\s/g, '');       // Headers
};
