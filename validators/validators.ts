import {z} from "zod";

export const regNrSchema = z.string().regex(/^[A-Za-z]{2}[0-9]{5}$/)


export const taskFormSchema = z.object({
    title: z.string().min(1, "Oppgave på ha en tittel").max(100, "Tittelen kan ikke være lenger enn 100 bokstaver"),
    time: z.number().int().positive(),
    description: z.string().min(1, "Oppgave må ha en beskrivelse").max(400, "Beskrivelsen kan ikke være over 400 bokstaver")
});