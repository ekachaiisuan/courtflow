import * as React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

interface ResetPasswordEmailProps {
    userEmail: string;
    url: string;
}

const ResetPasswordEmail = (props: ResetPasswordEmailProps) => {
    const { userEmail, url } = props;
    const companyName = "Better Auth";

    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Reset your password - Action required</Preview>
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                                Password Reset Request
                            </Heading>
                            <Text className="text-[16px] text-gray-600 m-0">
                                We received a request to reset your password
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="mb-[32px]">
                            <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                                Hello,
                            </Text>
                            <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                                We received a request to reset the password for your account associated with{' '}
                                <strong>{userEmail}</strong>. If you made this request, click the button below to reset your password.
                            </Text>
                            <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[24px]">
                                This password reset link will expire in 24 hours for security reasons.
                            </Text>
                        </Section>

                        {/* Reset Button */}
                        <Section className="text-center mb-[32px]">
                            <Button
                                href={url}
                                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border hover:bg-blue-700"
                            >
                                Reset Password
                            </Button>
                        </Section>

                        {/* Alternative Link */}
                        <Section className="mb-[32px]">
                            <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[16px]">
                                If the button above doesn't work, copy and paste the following link into your browser:
                            </Text>
                            <Text className="text-[14px] text-blue-600 break-all m-0">
                                <Link href={url} className="text-blue-600 underline">
                                    {url}
                                </Link>
                            </Text>
                        </Section>

                        {/* Security Notice */}
                        <Section className="bg-yellow-50 border-l-[4px] border-yellow-400 p-[16px] mb-[32px]">
                            <Text className="text-[14px] text-gray-700 leading-[20px] m-0 mb-[8px]">
                                <strong>Security Notice:</strong>
                            </Text>
                            <Text className="text-[14px] text-gray-700 leading-[20px] m-0">
                                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-gray-200 pt-[24px]">
                            <Text className="text-[14px] text-gray-500 leading-[20px] m-0 mb-[8px]">
                                Best regards,<br />
                                The {companyName} Team
                            </Text>
                            <Text className="text-[12px] text-gray-400 leading-[16px] m-0 mb-[8px]">
                                {companyName}, Inc.<br />
                                123 Business Street, Suite 100<br />
                                San Francisco, CA 94105
                            </Text>
                            <Text className="text-[12px] text-gray-400 leading-[16px] m-0">
                                © 2026 {companyName}. All rights reserved. |{' '}
                                <Link href="#" className="text-gray-400 underline">
                                    Unsubscribe
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ResetPasswordEmail;