"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./utils/trpc";
import { GuestManager } from "./components/GuestManager";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Wedding Guest Manager
                </h1>
                <div className="text-sm text-gray-500">
                  Manage your wedding guests with ease
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GuestManager />
          </main>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
