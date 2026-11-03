
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ApiResponse {
    data: unknown;
    responseTime: number;
    statusCode: number;
    statusText: string;
    contentType: string;
}

const Users = () => {
    const [url, setUrl] = useState("");
    const [submittedUrl, setSubmittedUrl] = useState("");
    const [validationError, setValidationError] = useState("");

    // API request function
    const fetchUsers = async ({
        queryKey,
        signal,
    }: {
        queryKey: [string, string];
        signal: AbortSignal;
    }): Promise<ApiResponse> => {
        const requestUrl = queryKey[1];

        const startTime = performance.now();

        const response = await fetch(requestUrl, { signal });

        const responseTime = Math.round(
            performance.now() - startTime
        );

        const contentType = response.headers.get("content-type") || "";

        const responseText = await response.text();

        let responseData: unknown = responseText;

        try {
            responseData = responseText
                ? JSON.parse(responseText)
                : null;
        } catch {
            // Keep the response as plain text if it isn't valid JSON.
        }

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}` +
                (responseText ? ` - ${responseText}` : "")
            );
        }

        return {
            data: responseData,
            responseTime,
            statusCode: response.status,
            statusText: response.statusText,
            contentType,
        };
    };

    // React Query
    const {
        data,
        error,
        isFetching,
        isError,
        isSuccess,
        refetch,
    } = useQuery<ApiResponse, Error>({
        queryKey: ["api-response", submittedUrl],
        queryFn: fetchUsers,
        enabled: !!submittedUrl,
        retry: false,
    });

    // Handle API request
    const handleFetch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            setValidationError("Please enter an API URL.");
            return;
        }

        try {
            const parsedUrl = new URL(trimmedUrl);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Invalid protocol");
            }
        } catch {
            setValidationError("Please enter a valid HTTP or HTTPS URL.");
            return;
        }

        setValidationError("");

        if (trimmedUrl === submittedUrl) {
            refetch();
        } else {
            setSubmittedUrl(trimmedUrl);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-5">

            <h1 className="text-2xl font-bold">
                API Response Tester
            </h1>

            {/* URL Input */}
            <form onSubmit={handleFetch} className="flex gap-3">

                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://jsonplaceholder.typicode.com/users"
                    className="border rounded-md p-3 flex-1"
                />

                <button
                    type="submit"
                    disabled={isFetching}
                    className="bg-blue-600 text-white px-5 rounded-md disabled:opacity-50"
                >
                    {isFetching ? "Fetching..." : "Fetch"}
                </button>

            </form>

            {/* Validation Error */}
            {validationError && (
                <p className="text-red-500">
                    {validationError}
                </p>
            )}

            {/* Loading */}
            {isFetching && (
                <p className="text-blue-500">
                    Sending API request...
                </p>
            )}

            {/* Request Error */}
            {isError && !isFetching && (
                <div className="border border-red-300 rounded-md p-4">
                    <h2 className="font-semibold text-red-600">
                        Request Failed
                    </h2>

                    <p className="text-sm mt-2 break-words">
                        {error.message}
                    </p>
                </div>
            )}

            {/* Successful Response */}
            {isSuccess && data && (
                <div className="space-y-4">

                    {/* Response Information */}
                    <div className="grid grid-cols-3 gap-3">

                        <div className="border rounded-md p-3">
                            <p className="text-sm text-gray-500">
                                Status Code
                            </p>

                            <p className="text-xl font-bold text-green-600">
                                {data.statusCode}
                            </p>
                        </div>

                        <div className="border rounded-md p-3">
                            <p className="text-sm text-gray-500">
                                Response Time
                            </p>

                            <p className="text-xl font-bold">
                                {data.responseTime} ms
                            </p>
                        </div>

                        <div className="border rounded-md p-3">
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <p className="text-xl font-bold text-green-600">
                                Success
                            </p>
                        </div>

                    </div>

                    {/* Response Content */}
                    <div className="border rounded-md overflow-hidden">

                        <div className="bg-gray-100 p-3 font-semibold">
                            API Response
                        </div>

                        <pre className="p-4 overflow-auto max-h-96 text-sm">
                            {JSON.stringify(data.data, null, 2)}
                        </pre>

                    </div>

                    <p className="text-sm text-gray-500">
                        Content-Type: {data.contentType || "Unknown"}
                    </p>

                </div>
            )}

        </div>
    );
};

export default Users;
