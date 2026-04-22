// Mock AI Service (Frontend only for now)

export const asikasoAIAssistant = async (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`This is a mock AI response for: "${prompt}". Backend integration is currently disabled.`);
    }, 1000);
  });
};
