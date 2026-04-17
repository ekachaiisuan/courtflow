import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
    Tailwind,
} from '@react-email/components';

interface WelcomeEmailProps {
    firstName: string;
}

const WelcomeEmail = (props: WelcomeEmailProps) => {
    const { firstName } = props;

    return (
        <Html lang="th" dir="ltr">
            <Head />
            <Preview>ยินดีต้อนรับสู่ครอบครัวของเรา! 🎉</Preview>
            <Tailwind>
                <Body className="bg-gray-100 py-[40px] font-sans">
                    <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[16px]">
                                🎉 ยินดีต้อนรับ!
                            </Heading>
                            <Text className="text-[16px] text-gray-600 m-0">
                                ขอบคุณที่เข้าร่วมกับเรา
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="mb-[32px]">
                            <Text className="text-[18px] text-gray-900 mb-[16px] font-semibold">
                                สวัสดี {firstName}!
                            </Text>

                            <Text className="text-[16px] text-gray-700 mb-[16px] leading-[24px]">
                                การลงทะเบียนของคุณสำเร็จแล้ว! เราดีใจมากที่ได้ต้อนรับคุณเข้าสู่ครอบครัวของเรา
                            </Text>

                            <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                                ตอนนี้คุณสามารถเริ่มใช้งานบริการต่างๆ ของเราได้เลย หากมีคำถามใดๆ
                                อย่าลังเลที่จะติดต่อทีมสนับสนุนของเรา
                            </Text>

                            <Button
                                href="#"
                                className="bg-blue-600 text-white px-[24px] py-[12px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                            >
                                เริ่มใช้งาน
                            </Button>
                        </Section>

                        <Hr className="border-gray-200 my-[32px]" />

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;