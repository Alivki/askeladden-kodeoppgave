/**
 * AI Service for generating task suggestions
 * 
 * This is a boilerplate implementation. Replace the mock implementation
 * with actual AI API calls (e.g., OpenAI, Anthropic, etc.)
 */

export interface TaskSuggestion {
  title: string;
  description: string | null;
}

export interface CarInfo {
  id: number;
  regNr: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
}

/**
 * Generate AI-powered task suggestions for a car
 * 
 * @param carInfo - Information about the car
 * @returns Array of task suggestions
 */
export async function generateTaskSuggestions(
  carInfo: CarInfo
): Promise<TaskSuggestion[]> {
  // TODO: Replace with actual AI API call
  // Example with OpenAI:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are a helpful assistant that suggests maintenance tasks for cars."
  //     },
  //     {
  //       role: "user",
  //       content: `Suggest maintenance tasks for a ${carInfo.year} ${carInfo.make} ${carInfo.model} (${carInfo.regNr})`
  //     }
  //   ]
  // });
  
  // Mock implementation - replace with actual AI call
  const mockSuggestions: TaskSuggestion[] = [
    {
      title: "Service",
      description: `Årlig service for ${carInfo.make} ${carInfo.model}`,
    },
    {
      title: "Oljeskift",
      description: "Rutinemessig oljeskift",
    },
    {
      title: "Bilvask",
      description: "Vask og polering av bilen",
    },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockSuggestions;
}

