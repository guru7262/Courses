import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Footer } from "@/app/components/Footer";
import React from 'react';  

export function Login() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md p-6 bg-card rounded-lg shadow">
                    <h1 className="text-2xl font-semibold mb-4">Sign in to EduLearn</h1>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input type="email" className="w-full rounded-md border px-3 py-2" />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input type="password" className="w-full rounded-md border px-3 py-2" />
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                                Sign in
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
}
