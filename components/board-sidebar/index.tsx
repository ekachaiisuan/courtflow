'use client';
import { useRouter } from "next/navigation";
import { Sidebar, useSidebar } from "../ui/sidebar";

export const BoardSidebar = () => {
    const {open} = useSidebar();
    const router = useRouter();


    return (
        <Sidebar></Sidebar>
    );
};