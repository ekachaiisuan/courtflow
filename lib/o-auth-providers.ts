import { ComponentProps,ElementType } from "react";
import { GitHubIcon } from "@/components/icon/o-auth-icon";

export const SUPPORTED_OAUTH_PROVIDERS = ["github"] as const;

export type OAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const OAUTH_PROVIDERS: Record<OAuthProvider, {name: string; Icon: ElementType<ComponentProps<"svg">>}> = {
    github: {name: "GitHub", Icon: GitHubIcon},
}
   