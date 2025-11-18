"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TaskStatus } from "@/db/schema";
import {taskFormSchema} from "@/validators/validators";
import {z} from "zod";
import Task from "@/components/TaskCard"
import {Trash2, Sparkles, Loader} from "lucide-react";

export default function CarPage() {
  const { id } = useParams() as { id: string };
  const carId = parseInt(id);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTime, setTaskTime] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof z.infer<typeof taskFormSchema>, string>>>({});

  const {
    data: car,
    isLoading,
    error,
  } = trpc.getCarById.useQuery({ id: carId });

  const { data: suggestions, refetch: refetchSuggestions } =
    trpc.getTaskSuggestions.useQuery({ carId }, { enabled: !!carId });

  const { data: tasks, refetch: refetchTasks } = trpc.getTasks.useQuery(
    { carId },
    { enabled: !!carId }
  );

  const fetchAISuggestions = trpc.fetchAISuggestions.useMutation({
    onSuccess: () => {
      refetchSuggestions();
    },
  });

    const deleteSuggestionTask = trpc.deleteSuggestionTask.useMutation({
        onSuccess: () => {
            refetchSuggestions();
        }
    })

  const createTask = trpc.createTask.useMutation({
    onSuccess: () => {
      setTaskTitle("");
      setTaskDescription("");
      setTaskTime(0);
      setShowCreateTaskForm(false);
      refetchTasks();
    },
  });

  const updateTaskStatus = trpc.updateTaskStatus.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  const deleteTask = trpc.deleteTask.useMutation({
      onSuccess: () => {
          refetchTasks();
      }
  })

  const handleCreateTaskFromSuggestion = (suggestionId: number) => {
    const suggestion = suggestions?.find((s) => s.id === suggestionId);
    if (suggestion) {
      createTask.mutate({
        carId,
        title: suggestion.title,
        description: suggestion.description ?? undefined,
          time: suggestion.timeUse ?? 0,
        suggestionId,
      });
    }
  };

    const  handleTaskSuggestionDelete = (taskId: number) => {
        deleteSuggestionTask.mutate({
            taskId
        })
    }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    const result = taskFormSchema.safeParse({
       title: taskTitle.trim(),
        time: taskTime,
        description: taskDescription.trim(),
    });

      if (!result.success) {
          const errors: typeof fieldErrors= {};
          result.error.issues.forEach((err) => {
             if (err.path.length > 0) {
                 const key = err.path[0] as keyof typeof fieldErrors;
                 errors[key] = err.message;
             }
          });
          setFieldErrors(errors);
          return;
      }

      setFieldErrors({});

      createTask.mutate({
        carId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
          time: taskTime,
      });
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    updateTaskStatus.mutate({
      taskId,
      status: newStatus,
    });
  };

  const handleTaskDelete = (taskId: number) => {
      deleteTask.mutate({
          taskId
      })
  }

  if (isLoading) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <div className="p-8 text-center text-gray-600">
          Laster bildetaljer...
        </div>
      </main>
    );
  }

  if (error || !car) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <div className="p-8 bg-red-50 text-red-600 rounded-lg mb-4">
          <p className="m-0 mb-4">{error?.message || "Bil ikke funnet"}</p>
          <Link href="/" className="text-blue-600 underline">
            ← Tilbake til biliste
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Link href="/" className="inline-block mb-8 text-blue-600 no-underline">
        ← Tilbake til biliste
      </Link>

      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
          <h1 className="text-2xl mb-8">Bildetaljer</h1>

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Registreringsnummer
            </div>
            <div className="text-2xl font-bold">{car.regNr}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Merke
            </div>
            <div className="text-xl font-medium">{car.make}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              Modell
            </div>
            <div className="text-xl font-medium">{car.model}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
              År
            </div>
            <div className="text-xl">{car.year}</div>
          </div>

          {car.color && (
            <div>
              <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
                Farge
              </div>
              <div className="text-xl">{car.color}</div>
            </div>
          )}

          {car.createdAt && (
            <div>
              <div className="text-sm text-gray-600 mb-2 uppercase tracking-wider">
                Lagt til i register
              </div>
              <div className="text-base text-gray-600">
                {new Date(car.createdAt).toLocaleString("no-NO")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Suggestions Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Oppgaveforslag</h2>
            {suggestions && suggestions.length === 0  ? (
                <button
                    onClick={() => fetchAISuggestions.mutate({ carId })}
                    disabled={fetchAISuggestions.isPending}
                    className="px-4 py-2 text-sm bg-purple-600 text-white border-none rounded whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700 transition-colors"
                >
                    {fetchAISuggestions.isPending ? (
                        <span className="flex items-center gap-2">
                            Henter forslag <Loader className="animate-spin w-4 h-4" />
                        </span>
                    ) : (
                        "Hent AI-forslag"
                    )}
                </button>
            ) : (
                <div className="px-4 py-2 bg-purple-600 rounded cursor-not-allowed text-sm text-white flex items-center gap-2 justify-between">
                    <Sparkles size={16}/>
                    <p>AI forslag gitt</p>
                </div>
            )}
        </div>

        {fetchAISuggestions.error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
            <p className="m-0">Feil: {fetchAISuggestions.error.message}</p>
          </div>
        )}

        {!suggestions || suggestions.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            Ingen forslag ennå. Klikk på &quot;Hent AI-forslag&quot; for å generere
            forslag.
          </div>
        ) : (
          <div className="grid gap-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start flex-col sm:flex-row justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {suggestion.title}
                  </h3>
                  {suggestion.description && (
                    <p className="text-gray-600 m-0">
                      {suggestion.description}
                    </p>
                  )}
                </div>
                  <div className="flex w-full sm:w-auto flex-row gap-2 h-10">
                      <button
                          onClick={() => handleCreateTaskFromSuggestion(suggestion.id)}
                          disabled={createTask.isPending}
                          className="px-4 py-2 w-full sm:w-auto text-sm bg-purple-600 text-white border-none rounded whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700 transition-colors"
                      >
                          Opprett oppgave
                      </button>
                      <button
                          onClick={() => handleTaskSuggestionDelete(suggestion.id)}
                          disabled={createTask.isPending}
                          className="h-10 w-10 flex-shrink-0 flex items-center justify-center duration-200 bg-gray-400 text-white border-none rounded disabled:cursor-not-allowed cursor-pointer hover:bg-red-500 transition-colors"
                      >
                          <Trash2 size={15}/>
                      </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tasks Section */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-row gap-2 items-center justify-center">
                <h2 className="text-xl">Oppgaver</h2>
                {!tasks || tasks.length > 0 && (
                    <h2>({tasks.length})</h2>
                )}
            </div>
          <button
            onClick={() => setShowCreateTaskForm(!showCreateTaskForm)}
            className="px-4 py-2 text-sm bg-blue-600 text-white border-none rounded whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {showCreateTaskForm ? "Avbryt" : "+ Opprett oppgave"}
          </button>
        </div>

        {showCreateTaskForm && (
          <form
            onSubmit={handleCreateTask}
            className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="mb-4">
              <label
                htmlFor="task-title"
                className="block text-sm font-medium mb-2"
              >
                Tittel *
              </label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={createTask.isPending}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded"
                placeholder="F.eks. Service"
                required
              />
                {fieldErrors.title && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>
                )}
            </div>

              <div className="mb-4">
                  <label
                      htmlFor="task-time"
                      className="block text-sm font-medium mb-1"
                      >
                      Tid
                  </label>
                  <p className="text-xs font-medium text-zinc-500 mb-2">Skriv in tid i minutter</p>
                  <input
                  id="task-time"
                  type="number"
                  value={String(taskTime)}
                  onChange={(e) => setTaskTime(parseInt(e.target.value))}
                  disabled={createTask.isPending}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded"
                  placeholder="F.eks. 60"
                  required
              />
                  {fieldErrors.time && (
                      <p className="text-red-600 text-sm mt-1">{fieldErrors.time}</p>
                  )}
              </div>

            <div className="mb-4">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium mb-2"
              >
                Beskrivelse
              </label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                disabled={createTask.isPending}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded"
                placeholder="Beskrivelse av oppgaven..."
                rows={3}
              />
                {fieldErrors.description && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.description}</p>
                )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createTask.isPending || !taskTitle.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white border-none rounded disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-700 transition-colors"
              >
                {createTask.isPending ? "Oppretter..." : "Opprett oppgave"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTaskForm(false);
                  setTaskTitle("");
                  setTaskDescription("");
                }}
                className="px-4 py-2 text-sm bg-gray-300 text-gray-700 border-none rounded cursor-pointer hover:bg-gray-400 transition-colors"
              >
                Avbryt
              </button>
            </div>
            {createTask.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                Feil: {createTask.error.message}
              </div>
            )}
          </form>
        )}

        {!tasks || tasks.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
            Ingen oppgaver ennå. Opprett en oppgave eller konverter et forslag
            til oppgave.
          </div>
        ) : (
          <div className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                      <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                          Venter
                          <span className="text-sm text-gray-500 font-normal">
                              ({tasks.filter(task => task.status ===  TaskStatus.PENDING).length})
                          </span>
                      </h3>

                      <div className="space-y-3">
                          {tasks?.filter(task => task.status === TaskStatus.PENDING).length === 0 && (
                              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                                  Ingen ventene oppgaver på dette tidspunktet. Bra jobbet 👍
                              </div>
                          )}
                          {tasks.filter(task => task.status === TaskStatus.PENDING)
                              .map(task => (
                              <Task
                                  key={task.id}
                                  task={task}
                                  onStatusChange={handleStatusChange}
                                  onDelete={handleTaskDelete}
                                  isUpdating={updateTaskStatus.isPending || deleteTask.isPending}
                              />
                            ))
                          }
                      </div>
                  </div>

                  <div>
                      <h3 className="font-semibold text-lg mb-3 text-yellow-700 flex items-center gap-2">
                          <div>Pågår</div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                          <span className="text-sm text-gray-500 font-normal">
                              ({tasks.filter(task => task.status ===  TaskStatus.IN_PROGRESS).length})
                          </span>
                      </h3>

                      <div className="space-y-3">
                          {tasks?.filter(task => task.status === TaskStatus.IN_PROGRESS).length === 0 && (
                              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                                  Ingen pågående oppgaver på dette tidspunktet.
                              </div>
                          )}
                          {tasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
                              .map(task => (
                              <Task
                                  key={task.id}
                                  task={task}
                                  onStatusChange={handleStatusChange}
                                  onDelete={handleTaskDelete}
                                  isUpdating={updateTaskStatus.isPending || deleteTask.isPending}
                              />
                            ))
                          }
                      </div>
                  </div>

                  <div>
                      <h3 className="font-semibold text-lg mb-3 text-green-700 flex items-center gap-2">
                          <div>Fullført</div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-500 font-normal">
                              ({tasks.filter(task => task.status ===  TaskStatus.COMPLETED).length})
                          </span>
                      </h3>

                      <div className="space-y-3">
                          {tasks?.filter(task => task.status === TaskStatus.COMPLETED).length === 0 && (
                              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                                  Ingen fullførte oppgaver enda.
                              </div>
                          )}
                          {tasks.filter(task => task.status === TaskStatus.COMPLETED)
                              .map(task => (
                              <Task
                                  key={task.id}
                                  task={task}
                                  onStatusChange={handleStatusChange}
                                  onDelete={handleTaskDelete}
                                  isUpdating={updateTaskStatus.isPending || deleteTask.isPending}
                              />
                            ))
                          }
                      </div>
                  </div>
              </div>
          </div>
        )}
      </section>
    </main>
  );
}
