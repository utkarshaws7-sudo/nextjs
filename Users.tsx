"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Users = () => {
    const [apiStatus, setApiStatus] = useState<string>("idle");
    const [error, setError] = useState<string>("");
    const [responseTime, setResponseTime] = useState<number>(0);
    const [url, setUrl] = useState<string>("");

    const fetchUsers = async (url: string) => {
        try {
            setApiStatus("loading");
            const startTime = Date.now();
            const response = await fetch(url);
            const data = await response.json();
            const endTime = Date.now();
            const duration = endTime - startTime;
            setResponseTime(duration);
            setApiStatus("success");
            return data;

        } catch (error) {
            setApiStatus("error");
            // setError(error as string);
            // console.log(error);
        }
    }
    function fetchUsersWithQuery(url: string) {
        return useQuery({
            queryKey: ["users"],
            queryFn: () => fetchUsers(url),
        })
    }

    const { data, isLoading, isError, refetch } = fetchUsersWithQuery(url);
    return (
        <div >
            <input type="text" placeholder="Enter URL" onChange={(e) => setUrl(e.target.value)} />
            <button onClick={() => refetch()}>Fetch Users</button>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error: {error}</div>}
            {/* {data && <div>Data: {JSON.stringify(data)}</div>} */}
            {responseTime && <div>Response Time: {responseTime}ms</div>}
            {apiStatus && <div>API Status: {apiStatus}</div>}
        </div>
    )
}

export default Users;