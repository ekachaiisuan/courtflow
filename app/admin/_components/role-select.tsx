"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { ROLES, type Role } from "@/lib/permissions"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type RoleSelectProps = {
    value?: Role
    onChange?: (role: Role) => void
    disabled?: boolean
}

export function RoleSelect({
    value,
    onChange,
    disabled,
}: RoleSelectProps) {
    const [mounted, setMounted] = React.useState(false)
    const label = value ? formatRoleLabel(value) : "Select role"

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                type="button"
                disabled
                className={cn(
                    "border-input text-muted-foreground flex h-9 w-[200px] items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs",
                    value && "text-foreground"
                )}
            >
                <span className="truncate">{label}</span>
                <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </button>
        )
    }

    return (
        <Select
            value={value}
            onValueChange={(val) => onChange?.(val as Role)}
            disabled={disabled}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>

            <SelectContent>
                {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                        {formatRoleLabel(role)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function formatRoleLabel(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1)
}
