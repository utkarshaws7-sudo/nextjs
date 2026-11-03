"use client";
import { useEffect, useRef, useState } from "react";

type Task = {
    id: string;
    task: string;
};


const KanbanBoard = () => {
    const [todoTask, setTodoTask] = useState<Task[]>([
        { id: "1", task: "Learn JavaScript Drag and Drop" },
        { id: "2", task: "Build a Kanban Board" },
        { id: "3", task: "Practice React Hooks" },
    ]);

    const [progressTask, setProgressTask] = useState<Task[]>([
        { id: "4", task: "Implement Drag Events" },
        { id: "5", task: "Understand DataTransfer API" },
    ]);

    const [doneTask, setDoneTask] = useState<Task[]>([
        { id: "6", task: "Learn JavaScript Basics" },
        { id: "7", task: "Learn React Fundamentals" },
    ]);
    const todoRef = useRef<any>(null);
    const progressRef = useRef<any>(null);


    useEffect(() => {
        const element = todoRef.current;
        if (!element) return;

        element.addEventListener("dragstart", (e) => {
            console.log("Drag started");
            console.log(e.target.id)
            e.dataTransfer.setData("text/plain", e.target.id);
        })

        progressRef?.current.addEventListener("dragover", (e) => {
            e.preventDefault();
        })

        progressRef?.current.addEventListener("drop", (e) => {
            const id = e.dataTransfer.getData("text/plain");
            console.log("transfer id: ", id);
            const targetTask = todoTask.find((item) => item.id === id.toString())!;
            setProgressTask((prev) => [...prev, targetTask]);

            setTodoTask((prev) =>
                prev.filter((item) => item.id !== id)
            );
        })

        progressRef?.current.addEventListener("dragend", (e) => {
            console.log("drag ended");
        })
    }, []);

    useEffect(() => {
        console.log("todo task: ", todoTask)
        console.log(progressTask)
    }, [todoTask, progressTask])

    return (
        <div className="flex gap-3">
            <div ref={todoRef} id="todoTask" draggable="true" className="border border-black rounded-md h-96 w-1/4 flex flex-col gap-3">
                {
                    todoTask.map((item) => (
                        <div id={item.id} draggable="true" className="bg-black py-4 rounded-md mx-2 px-2 text-white">
                            {item.task}
                        </div>
                    ))
                }
            </div>

            <div ref={progressRef} id="progressTask" className="border border-black rounded-md h-96 w-1/4 flex flex-col gap-3">
                {
                    progressTask.map((item, index) => (
                        <div id={item.id} draggable="true" className="bg-black py-4 rounded-md mx-2 px-2 text-white">
                            {item.task}
                        </div>
                    ))
                }
            </div>

            <div id="doneTask" className="border border-black rounded-md h-96 w-1/4 flex flex-col gap-3">
                {
                    doneTask.map((item, index) => (
                        <div id={item.id} draggable="true" className="bg-black py-4 rounded-md mx-2 px-2 text-white">
                            {item.task}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default KanbanBoard;