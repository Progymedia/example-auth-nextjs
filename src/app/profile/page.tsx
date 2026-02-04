'use client';

import { useEffect, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { router } from 'next/client';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [returnUrl, setReturnUrl] = useState<string | undefined>(undefined);
  const loginName = useMemo(
    () => session?.user?.email ?? session?.user?.name ?? undefined,
    [session],
  );

  const zitadelDomain =
    process.env.NEXT_PUBLIC_ZITADEL_DOMAIN ?? process.env.ZITADEL_DOMAIN;

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/profile`);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('zitadel', { callbackUrl: router.asPath });
    }
  }, [status]);

  const selfServiceActions = useMemo(
    () => [
      {
        label: 'Self-service home',
        description: 'Open the ZITADEL login v2 self-service start page',
        path: '',
      },
      {
        label: 'Change password',
        description: 'Update your password using ZITADEL self-service',
        path: 'password',
      },
      {
        label: 'Manage passkeys',
        description: 'Register or remove passkeys for passwordless login',
        path: 'passkey',
      },
      {
        label: 'Set up TOTP MFA',
        description: 'Add an authenticator app for multi-factor login',
        path: 'mfa/totp',
      },
      {
        label: 'Set up OTP via email/SMS',
        description: 'Add one-time code delivery as an additional factor',
        path: 'mfa/otp',
      },
      {
        label: 'Manage email address',
        description: 'Update or verify your email details',
        path: 'email',
      },
      {
        label: 'Manage phone number',
        description: 'Add, verify, or change your phone number',
        path: 'phone',
      },
      {
        label: 'Profile details',
        description: 'Review and edit your personal profile data',
        path: 'profile',
      },
      {
        label: 'Sessions & devices',
        description: 'See active sessions and revoke access',
        path: 'sessions',
      },
    ],
    [],
  );

  const buildSelfServiceUrl = (path: string) => {
    if (!zitadelDomain) return '#';

    const normalizedDomain = zitadelDomain.replace(/\/$/, '');
    const basePath = path
      ? `/ui/v2/login/${path}`
      : '/ui/v2/login';
    const params = new URLSearchParams();

    if (returnUrl) {
      params.set('returnUrl', returnUrl);
    }

    if (loginName) {
      params.set('loginName', loginName);
    }

    params.set('organization', '356673417786688160');

    const query = params.toString();

    return `${normalizedDomain}${basePath}${query}`;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your session…</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header isAuthenticated={true} />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-green-900">
                  Authentication Successful!
                </h2>
                <p className="text-green-700 mt-1">
                  You have successfully logged into the application.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Session Information
            </h2>
            <p className="text-gray-600 mb-6">
              Below is the authentication data stored in your session:
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono leading-relaxed">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  ZITADEL Self-Service
                </h2>
                <p className="text-gray-600">
                  Jump directly into login v2 self-service flows to test account
                  management tasks.
                </p>
              </div>
              {!zitadelDomain && (
                <span className="text-sm text-red-600">
                  Set ZITADEL_DOMAIN or NEXT_PUBLIC_ZITADEL_DOMAIN to enable
                  links.
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selfServiceActions.map((action) => (
                <a
                  key={action.label}
                  href={buildSelfServiceUrl(action.path)}
                  className={`block p-4 rounded-lg border transition ${zitadelDomain
                    ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-sm bg-emerald-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!zitadelDomain}
                >
                  <div className="font-semibold text-gray-900">
                    {action.label}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
