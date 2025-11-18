import {TaskStatus} from "@/db/schema";

interface TaskDashboardProps {
    tasks: {
        id: number;
        status: TaskStatus;
        estimatedTimeMinutes?: number;
    }[];
}

export default function TaskDashboard({tasks}: TaskDashboardProps) {
    const totalTasks = tasks.length;

    const completedCount = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgressCount = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;

    const totalEstimatedTime = tasks.reduce((total, task) => total + (task.estimatedTimeMinutes || 0), 0);
    const averageTime = totalTasks ? Math.round(totalEstimatedTime / totalTasks) : 0;

    const completedPercentage = totalTasks ? (completedCount / totalTasks) * 100 : 0;
    const inProgressPercentage = totalTasks ? ((completedCount + inProgressCount) / totalTasks) * 100 : 0;

    return (
        <div className="border rounded-lg overflow-clip mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 p-5 mb-5 ">
                <div
                    className="flex flex-col items-start border-b border-gray-300 pb-4 last:border-b-0 sm:border-b-0 sm:pb-0">
                    <p className="text-gray-800 text-lg">Oppgaver:</p>
                    <p className="text-gray-600 text-xl font-medium break-words">{tasks.length}</p>
                </div>

                <div
                    className="flex flex-col items-start border-b border-gray-300 pb-4 last:border-b-0 sm:border-b-0 sm:pb-0">
                    <p className="text-gray-800 text-lg">Estimert total tid:</p>
                    <p className="text-gray-600 text-xl font-medium break-words">
                        {totalEstimatedTime}{" "}minutter
                    </p>
                </div>

                <div className="flex flex-col items-start">
                    <p className="text-gray-800 text-lg">Gjennomsnitt tid:</p>
                    <p className="text-gray-600 text-xl font-medium break-words">
                        {averageTime}{" "}minutter
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-start">
                <div className="text-gray-600 text-sm ml-5 mb-1 font-medium">
                    {completedCount} / {tasks.length} oppgaver ferdig
                </div>
                <div className="relative w-full">
                    <div
                        style={{width: `${inProgressPercentage}%`}}
                        className="absolute rounded-bl-lg rounded-r-none bg-yellow-400 h-5 transition-all duration-500 ease-in-out"
                    />
                    <div
                        style={{width: `${completedPercentage}%`}}
                        className="absolute rounded-bl-lg rounded-r-none bg-green-300 h-5 transition-all duration-500 ease-in-out"
                    />
                    <div className="h-5 w-full bg-gray-200 rounded-b-lg">
                    </div>
                </div>
            </div>
        </div>
    );
};