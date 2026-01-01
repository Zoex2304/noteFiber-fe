"use client";

import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Note } from "@/types/note";

interface NoteBreadcrumbProps {
    note: Note;
}

export function NoteBreadcrumb({ note }: NoteBreadcrumbProps) {
    if (!note?.breadcrumb?.length) return null;

    return (
        <nav className="flex items-center gap-1 text-sm text-gray-500 px-6 py-3 bg-gray-50 border-b border-gray-200">
            {note.breadcrumb.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <Link
                        to="/app"
                        className="hover:text-gray-900 hover:underline transition-colors"
                    >
                        {crumb.name}
                    </Link>
                </span>
            ))}
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{note.title}</span>
        </nav>
    );
}
