import { TaskStatus } from "@/db/schema";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/routers/_app";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Task = RouterOutput["getTasks"][number];

type TaskItemProps = {
    task: Task;
    onStatusChange: (taskId: number, status: TaskStatus) => void;
    onDelete: (taskId: number) => void;
    isUpdating: boolean;
};

export default function Task({task, onStatusChange, onDelete, isUpdating}: TaskItemProps) {
    const getStatusColor = () => {
        switch (task.status) {
            case TaskStatus.COMPLETED:
                return "bg-green-50 border-green-200";
            case TaskStatus.IN_PROGRESS:
                return "bg-yellow-50 border-yellow-200";
            default:
                return "bg-white border-gray-200";
        }
    }

    const formatStatus = () => {
        switch (task.status) {
            case TaskStatus.PENDING: return "Venter";
            case TaskStatus.IN_PROGRESS: return "Pågår";
            case TaskStatus.COMPLETED: return "Fullført";
        }
    }

    return (
        <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                    {task.description && (
                        <p className="text-gray-600 m-0 mb-2">
                            {task.description}
                        </p>
                    )}
                    {task.estimatedTimeMinutes && (
                        <p className="text-gray-600 m-0 mb-2">
                            Estimert tid i min: {task.estimatedTimeMinutes}
                        </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                          Status: <span className="font-medium">{formatStatus()}</span>
                      </span>
                        {task.createdAt && (
                            <span>
                                Opprettet:{" "}{new Date(task.createdAt).toLocaleDateString("no-NO")}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            onStatusChange(task.id, TaskStatus.PENDING)
                        }
                        disabled={
                            isUpdating || task.status === TaskStatus.PENDING
                        }
                        className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                            task.status === TaskStatus.PENDING
                                ? "bg-gray-200 text-gray-700 border-gray-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        Venter
                    </button>
                    <button
                        onClick={() =>
                            onStatusChange(task.id, TaskStatus.IN_PROGRESS)
                        }
                        disabled={
                            isUpdating || task.status === TaskStatus.IN_PROGRESS
                        }
                        className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                            task.status === TaskStatus.IN_PROGRESS
                                ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50"
                        }`}
                    >
                        Pågår
                    </button>
                    <button
                        onClick={() =>
                            onStatusChange(task.id, TaskStatus.COMPLETED)
                        }
                        disabled={
                            isUpdating|| task.status === TaskStatus.COMPLETED
                        }
                        className={`px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                            task.status === TaskStatus.COMPLETED
                                ? "bg-green-200 text-green-800 border-green-300"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                        }`}
                    >
                        Fullført
                    </button>
                </div>
                <div>
                    <button
                        onClick={() =>
                            onDelete(task.id)
                        }
                        className={`bg-red-200 text-red-800 border-red-300 hover:bg-red-100 px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors`}
                    >
                        Slett oppgave
                    </button>
                </div>
            </div>
        </div>
    )
}