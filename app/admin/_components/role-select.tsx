"use client"

import * as React from "react"
import { ROLES, type Role } from "@/lib/permissions"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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