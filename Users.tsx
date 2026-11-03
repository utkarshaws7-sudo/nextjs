
"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
    url: string;
    method: HttpMethod;
    params: string;
    headers: string;
    body: string;
    token: string;
}

interface ApiResult {
    status: number;
    statusText: string;
    responseTime: number;
    size: number;
    data: unknown;
    headers: Record<string, string>;
    url: string;
}

interface HistoryItem {
    id: string;
    request: RequestConfig;
    response: ApiResult;
}

const initialRequest: RequestConfig = {
    url: "https://jsonplaceholder.typicode.com/users",
    method: "GET",
    params: "{}",
    headers: '{\n  "Accept": "application/json",\n  "Content-Type": "application/json"\n}',
    body: '{\n  \n}',
    token: "",
};

const methods: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
];

const Users = () => {
    const [request, setRequest] = useState<RequestConfig>(initialRequest);
    const [activeTab, setActiveTab] = useState<
        "response" | "headers" | "request"
    >("response");

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [copied, setCopied] = useState(false);

    const controllerRef = useRef<AbortController | null>(null);

    // Update request configuration
    const updateRequest = <K extends keyof RequestConfig>(
        key: K,
        value: RequestConfig[K]
    ) => {
        setRequest((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Parse JSON safely
    const parseJSON = (value: string, field: string) => {
        try {
            return JSON.parse(value);
        } catch {
            throw new Error(`Invalid JSON in ${field}.`);
        }
    };

    // API request function
    const sendRequest = async (
        config: RequestConfig
    ): Promise<ApiResult> => {
        const parsedUrl = new URL(config.url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Only HTTP and HTTPS URLs are supported.");
        }

        // Query parameters
        const params = parseJSON(config.params, "Query Parameters");

        if (
            params === null ||
            typeof params !== "object" ||
            Array.isArray(params)
        ) {
            throw new Error("Query parameters must be a JSON object.");
        }

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                parsedUrl.searchParams.set(key, String(value));
            }
        });

        // Request headers
        const headers = parseJSON(config.headers, "Headers");

        if (
            headers === null ||
            typeof headers !== "object" ||
            Array.isArray(headers)
        ) {
            throw new Error("Headers must be a JSON object.");
        }

        const requestHeaders: Record<string, string> = {};

        Object.entries(headers).forEach(([key, value]) => {
            if (
                typeof value !== "string" &&
                typeof value !== "number"
            ) {
                throw new Error(`Invalid header value for ${key}.`);
            }

            requestHeaders[key] = String(value);
        });

        // Bearer token authentication
        if (config.token.trim()) {
            requestHeaders.Authorization = `Bearer ${config.token.trim()}`;
        }

        // Request body
        const hasBody = !["GET", "DELETE"].includes(config.method);

        let requestBody: string | undefined;

        if (hasBody && config.body.trim()) {
            const parsedBody = parseJSON(config.body, "Request Body");

            requestBody = JSON.stringify(parsedBody);

            if (
                !Object.keys(requestHeaders).some(
                    (key) => key.toLowerCase() === "content-type"
                )
            ) {
                requestHeaders["Content-Type"] = "application/json";
            }
        }

        // Abort previous request if necessary
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        const startTime = performance.now();

        try {
            const response = await fetch(parsedUrl.toString(), {
                method: config.method,
                headers: requestHeaders,
                body: requestBody,
                signal: controller.signal,
            });

            // Read response
            const responseText = await response.text();

            const responseTime = Math.round(
                performance.now() - startTime
            );

            // Parse response JSON if possible
            let responseData: unknown = responseText;

            if (responseText.trim()) {
                try {
                    responseData = JSON.parse(responseText);
                } catch {
                    responseData = responseText;
                }
            } else {
                responseData = null;
            }

            // Response headers
            const responseHeaders = Object.fromEntries(
                response.headers.entries()
            );

            // Response size in bytes
            const size = new TextEncoder().encode(responseText).length;

            return {
                status: response.status,
                statusText: response.statusText,
                responseTime,
                size,
                data: responseData,
                headers: responseHeaders,
                url: response.url,
            };
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
            }
        }
    };

    // React Query mutation
    const mutation = useMutation<ApiResult, Error, RequestConfig>({
        mutationFn: sendRequest,

        onSuccess: (response, variables) => {
            const item: HistoryItem = {
                id: crypto.randomUUID(),
                request: variables,
                response,
            };

            setHistory((prev) => [item, ...prev].slice(0, 10));

            setActiveTab("response");
        },
    });

    // Send API request
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!request.url.trim()) {
            return;
        }

        try {
            new URL(request.url);
        } catch {
            return;
        }

        mutation.mutate({ ...request });
    };

    // Cancel request
    const cancelRequest = () => {
        controllerRef.current?.abort();
    };

    // Copy response
    const copyResponse = async () => {
        if (!mutation.data) return;

        await navigator.clipboard.writeText(
            JSON.stringify(mutation.data.data, null, 2)
        );

        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    };

    // Load previous request from history
    const loadHistory = (item: HistoryItem) => {
        setRequest(item.request);
        mutation.reset();
        mutation.mutate({ ...item.request });
    };

    const response = mutation.data;

    const isError = mutation.isError;
    const isPending = mutation.isPending;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        API Testing Tool
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Test REST APIs, inspect responses, and
                        monitor performance.
                    </p>
                </div>

                {/* Request Builder */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">

                    <h2 className="text-lg font-semibold">
                        Request Builder
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Method and URL */}
                        <div className="flex flex-col md:flex-row gap-3">

                            <select
                                value={request.method}
                                onChange={(e) =>
                                    updateRequest(
                                        "method",
                                        e.target.value as HttpMethod
                                    )
                                }
                                className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                            >
                                {methods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="url"
                                value={request.url}
                                onChange={(e) =>
                                    updateRequest("url", e.target.value)
                                }
                                placeholder="Enter API URL"
                                required
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500"
                            />

                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-7 py-3 rounded-lg font-semibold"
                            >
                                {isPending ? "Sending..." : "Send"}
                            </button>

                            {isPending && (
                                <button
                                    type="button"
                                    onClick={cancelRequest}
                                    className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg"
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                        {/* Request Tabs */}
                        <div className="flex gap-5 border-b border-gray-700 text-sm">

                            <button
                                type="button"
                                onClick={() => setActiveTab("request")}
                                className="pb-3 text-blue-400"
                            >
                                Request Configuration
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("response")}
                                className="pb-3"
                            >
                                Response
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("headers")}
                                className="pb-3"
                            >
                                Response Headers
                            </button>

                        </div>

                        {/* Request Configuration */}
                        {activeTab === "request" && (
                            <div className="space-y-4">

                                {/* Query Parameters */}
                                <div>
                                    <label className="block mb-2 text-sm">
                                        Query Parameters (JSON)
                                    </label>

                                    <textarea
                                        value={request.params}
                                        onChange={(e) =>
                                            updateRequest("params", e.target.value)
                                        }
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-sm"
                                    />
                                </div>

                                {/* Headers */}
                                <div>
                                    <label className="block mb-2 text-sm">
                                        Request Headers (JSON)
                                    </label>

                                    <textarea
                                        value={request.headers}
                                        onChange={(e) =>
                                            updateRequest("headers", e.target.value)
                                        }
                                        rows={4}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-sm"
                                    />
                                </div>

                                {/* Authentication */}
                                <div>
                                    <label className="block mb-2 text-sm">
                                        Bearer Token
                                    </label>

                                    <input
                                        type="password"
                                        value={request.token}
                                        onChange={(e) =>
                                            updateRequest("token", e.target.value)
                                        }
                                        placeholder="Enter your access token"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
                                    />
                                </div>

                                {/* Request Body */}
                                {!["GET", "DELETE"].includes(request.method) && (
                                    <div>
                                        <label className="block mb-2 text-sm">
                                            Request Body (JSON)
                                        </label>

                                        <textarea
                                            value={request.body}
                                            onChange={(e) =>
                                                updateRequest("body", e.target.value)
                                            }
                                            rows={7}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-sm"
                                        />
                                    </div>
                                )}

                            </div>
                        )}

                    </form>

                    {/* Response Section */}
                    {activeTab === "response" && (
                        <div className="space-y-4">

                            {isPending && (
                                <div className="p-8 text-center text-blue-400">
                                    Sending API request...
                                </div>
                            )}

                            {isError && (
                                <div className="bg-red-950/40 border border-red-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-400">
                                        Request Failed
                                    </h3>

                                    <p className="text-sm text-red-300 mt-2 break-words">
                                        {mutation.error.message}
                                    </p>
                                </div>
                            )}

                            {!response && !isPending && !isError && (
                                <div className="text-center py-12 text-gray-500">
                                    Enter an API URL and click Send to
                                    view the response.
                                </div>
                            )}

                            {response && (
                                <>
                                    {/* Response Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-xs">
                                                Status
                                            </p>

                                            <p className={`text-xl font-bold ${
                                                response.status >= 200 &&
                                                response.status < 300
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }`}>
                                                {response.status}{" "}
                                                {response.statusText}
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-xs">
                                                Response Time
                                            </p>

                                            <p className="text-xl font-bold">
                                                {response.responseTime} ms
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-xs">
                                                Response Size
                                            </p>

                                            <p className="text-xl font-bold">
                                                {response.size} bytes
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 p-4 rounded-lg">
                                            <p className="text-gray-400 text-xs">
                                                Result
                                            </p>

                                            <p className={`text-xl font-bold ${
                                                response.status >= 200 &&
                                                response.status < 300
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }`}>
                                                {response.status >= 200 &&
                                                response.status < 300
                                                    ? "Success"
                                                    : "HTTP Error"}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Response Body */}
                                    <div className="border border-gray-700 rounded-lg overflow-hidden">

                                        <div className="flex justify-between items-center bg-gray-800 p-3">

                                            <h3 className="font-semibold">
                                                Response Body
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={copyResponse}
                                                className="text-sm text-blue-400 hover:text-blue-300"
                                            >
                                                {copied ? "Copied!" : "Copy JSON"}
                                            </button>

                                        </div>

                                        <pre className="p-4 overflow-auto max-h-[500px] text-sm text-green-300 whitespace-pre-wrap break-words">
                                            {typeof response.data === "string"
                                                ? response.data
                                                : JSON.stringify(
                                                    response.data,
                                                    null,
                                                    2
                                                )}
                                        </pre>

                                    </div>

                                    <p className="text-xs text-gray-500 break-all">
                                        Final URL: {response.url}
                                    </p>
                                </>
                            )}

                        </div>
                    )}

                    {/* Response Headers */}
                    {activeTab === "headers" && (
                        <div className="space-y-2">

                            {!response && (
                                <p className="text-gray-500 py-8 text-center">
                                    Send a request to inspect response headers.
                                </p>
                            )}

                            {response && Object.entries(response.headers).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-gray-800 py-3 text-sm"
                                    >
                                        <span className="text-blue-400 break-all">
                                            {key}
                                        </span>

                                        <span className="md:col-span-2 text-gray-300 break-all">
                                            {value}
                                        </span>
                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

                {/* Request History */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">

                    <div className="flex justify-between items-center mb-4">

                        <h2 className="text-lg font-semibold">
                            Request History
                        </h2>

                        <button
                            type="button"
                            onClick={() => setHistory([])}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            Clear History
                        </button>

                    </div>

                    {history.length === 0 && (
                        <p className="text-gray-500 text-sm">
                            No requests yet.
                        </p>
                    )}

                    <div className="space-y-3">

                        {history.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => loadHistory(item)}
                                className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2 justify-between"
                            >

                                <div className="flex gap-3 items-center">

                                    <span className="text-blue-400 font-bold text-xs">
                                        {item.request.method}
                                    </span>

                                    <span className="text-sm truncate max-w-[500px]">
                                        {item.request.url}
                                    </span>

                                </div>

                                <span className="text-xs text-green-400">
                                    {item.response.status} ·{" "}
                                    {item.response.responseTime} ms
                                </span>

                            </button>
                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Users;
