import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../../db/drizzle";
import { cars, tasks, taskSuggestions, TaskStatus } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { generateTaskSuggestions } from "../services/ai";
import {fetchVehicle} from "@/server/services/vegvesen";

export const appRouter = router({
  getCars: publicProcedure.query(async () => {
    return await db.select().from(cars);
  }),

  getCarById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const [car] = await db
        .select()
        .from(cars)
        .where(eq(cars.id, input.id))
        .limit(1);
      if (!car) {
        throw new Error("Bil ikke funnet");
      }
      return car;
    }),

  createCar: publicProcedure
    .input(
      z.object({
        regNr: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
        const regNr = input.regNr.toUpperCase();

        let vehicleData = {
            make: "UKJENT",
            model: "UKJENT",
            year: 0,
            color: "UKJENT",
        };

        try {
            vehicleData = await fetchVehicle(regNr);
        } catch (err) {
            console.warn(`Failed to fetch vehicle info for ${regNr}:`, err);
        }

      const [newCar] = await db
        .insert(cars)
        .values({
          regNr: regNr,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          color: vehicleData.color,
        })
        .returning();
      return newCar;
    }),

    deleteCar: publicProcedure
        .input(z.object({id: z.number().int().positive()}))
        .mutation(async ({ input }) => {
            const deleted = await db
                .delete(cars)
                .where(eq(cars.id, input.id))
                .returning();

            if (deleted.length === 0) {
                throw new Error("Bil ikke funnet");
            }
        }),

  // Task Suggestions
  getTaskSuggestions: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(taskSuggestions)
        .where(eq(taskSuggestions.carId, input.carId));
    }),

  fetchAISuggestions: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      // Get car information
      const [car] = await db
        .select()
        .from(cars)
        .where(eq(cars.id, input.carId))
        .limit(1);

      if (!car) {
        throw new Error("Bil ikke funnet");
      }

      // Generate AI suggestions
      const suggestions = await generateTaskSuggestions(car);

      // Save suggestions to database
      const insertedSuggestions = await db
        .insert(taskSuggestions)
        .values(
          suggestions.map((suggestion) => ({
            carId: input.carId,
            title: suggestion.title,
            description: suggestion.description,
              timeUse: suggestion.timeUse,
          }))
        )
        .returning();

      return insertedSuggestions;
    }),

  // Tasks
  getTasks: publicProcedure
    .input(z.object({ carId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.carId, input.carId));
    }),


    deleteSuggestionTask: publicProcedure
        .input(z.object({taskId: z.number().int().positive()}))
        .mutation(async ({ input }) => {
            const deleted = await db
                .delete(taskSuggestions)
                .where(eq(taskSuggestions.id, input.taskId))
                .returning();

            if (deleted.length === 0) {
                throw new Error("Oppgave forslag ikke funnet");
            }
        }),

  createTask: publicProcedure
    .input(
      z.object({
        carId: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
          time: z.number().int(),
        suggestionId: z.number().int().positive().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
        const existing = await db
            .select()
            .from(tasks)
            .where(
                and(
                    eq(tasks.carId, input.carId),
                    eq(tasks.title, input.title)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            throw new Error("Oppgave med samme tittel finnes allerede for denne bilen.");
        }

      const [newTask] = await db
        .insert(tasks)
        .values({
          carId: input.carId,
          title: input.title,
          description: input.description ?? null,
            estimatedTimeMinutes: input.time,
          suggestionId: input.suggestionId ?? null,
          status: TaskStatus.PENDING,
          completed: false,
        })
        .returning();

      return newTask;
    }),

  updateTaskStatus: publicProcedure
    .input(
      z.object({
        taskId: z.number().int().positive(),
        status: z.nativeEnum(TaskStatus),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedTask] = await db
        .update(tasks)
        .set({
          status: input.status,
          completed: input.completed ?? input.status === TaskStatus.COMPLETED,
        })
        .where(eq(tasks.id, input.taskId))
        .returning();

      if (!updatedTask) {
        throw new Error("Oppgave ikke funnet");
      }

      return updatedTask;
    }),

    deleteTask: publicProcedure
        .input(z.object({taskId: z.number().int().positive()}))
        .mutation(async ({ input }) => {
            const deleted = await db
                .delete(tasks)
                .where(eq(tasks.id, input.taskId))
                .returning();

            if (deleted.length === 0) {
                throw new Error("Oppgave ikke funnet");
            }
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
