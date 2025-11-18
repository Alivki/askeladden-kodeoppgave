import {generateObject} from "ai"
import {z} from "zod";
import { gateway } from 'ai';

export interface TaskSuggestion {
  title: string;
  description: string | null;
  timeUse: number;
}

const taskSuggestionSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(500).nullable().optional(),
    timeUse: z.number().int().positive(),
});

const taskSuggestionsSchema = z.object({
    tasks: z.array(taskSuggestionSchema)
});

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
export async function generateTaskSuggestions(carInfo: CarInfo): Promise<TaskSuggestion[]> {
    try {
        const { object } = await generateObject<typeof taskSuggestionsSchema>({
            model: gateway('openai/gpt-5.1'),
            output: "object",
            schema: taskSuggestionsSchema,
            messages: [
                {
                    role: "system",
                    content:
                        "Du er en erfaren norsk bilmekaniker. Du foreslår konkrete, realistiske vedlikeholdsoppgaver basert på bilens merke, modell og årgang. " +
                        "Alltid svar med et gyldig JSON-array med 3 oppgaver på norsk bokmål. Make the title short and desciprtion around 20 words. Make sure to pic task very relevant to the " +
                        "specific car and implement the car name/model if needed to explain task. Add the expected time of task. Bruk kun feltene 'title' og 'description' and 'time use'.",
                },
                {
                    role: "user",
                    content: `Foreslå vedlikeholdsoppgaver for en ${carInfo.year} ${carInfo.make} ${carInfo.model} med regnr ${carInfo.regNr}.`,
                },
            ],
        });

        return object.tasks.map((item) => ({
            title: item.title,
            description: item.description ?? null,
            timeUse: item.timeUse ?? null,
        }));
    } catch (error) {
        console.error("AI feilet ved generering av oppgaver:", error);
        return [
            { title: "Oljeskift og filterbytte", description: "Anbefales hvert 15 000 km eller årlig", timeUse: 10 },
            { title: "Bremsesjekk", description: "Kontroller klosser, skiver og bremsevæske", timeUse: 20 },
            { title: "Dekk og hjulstilling", description: "Sjekk mønsterdybde og juster sporvidde ved behov", timeUse: 200 },
        ];
    }
}

