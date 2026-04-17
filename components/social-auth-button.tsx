'use client';

import { authClient } from '@/lib/auth-client';
import {
  OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS,
} from '@/lib/o-auth-providers';
import { BetterAuthActionButton } from './better-auth-action';

export function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = OAUTH_PROVIDERS[provider].Icon;

    return (
      <BetterAuthActionButton
        variant="outline"
        key={provider}
        action={() => {
          return authClient.signIn.social({
            provider,
            callbackURL: '/dashboard',
          });
        }}
      >
        <Icon />
        {OAUTH_PROVIDERS[provider].name}
      </BetterAuthActionButton>
    );
  });
}
