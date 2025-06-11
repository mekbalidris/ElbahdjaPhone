import React, { useEffect } from 'react';
import Script from 'next/script';

const ReCaptcha = ({ onVerify }) => {
    useEffect(() => {
        // Initialize reCAPTCHA when the script loads
        window.onloadCallback = () => {
            window.grecaptcha.render('recaptcha-container', {
                sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
                callback: (token) => {
                    onVerify(token);
                },
                'expired-callback': () => {
                    onVerify(null);
                }
            });
        };
    }, [onVerify]);

    return (
        <>
            <Script
                src={`https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`}
                strategy="lazyOnload"
            />
            <div id="recaptcha-container" className="mt-4" />
        </>
    );
};

export default ReCaptcha; 