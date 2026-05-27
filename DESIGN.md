# AuraSync: Frontend Design & Screen Architecture

This document outlines the required screens and UI components needed to build AuraSync into a full-fledged product with user accounts, subscription tiers, and payment gateways.

## 1. Landing / Home Screen (`/`)
**Purpose:** Convert visitors into users by explaining the value proposition.
- **Hero Section:** Headline ("Your AI Communication Coach"), Subheadline, and a prominent "Try for Free" or "Upload Video" Call-to-Action (CTA).
- **Demo/Preview Section:** A short looping GIF or interactive demo showing how the AI breaks down a video (highlighting body language and tone).
- **Features Breakdown:** Cards detailing Audio Analysis (tone, pacing) and Video Analysis (eye contact, expressions).
- **Testimonials/Social Proof:** Fake/real reviews from job seekers and professionals.
- **Footer:** Links to Privacy Policy, Terms, Contact, and Pricing.

## 2. Main Dashboard / Analysis Screen (`/app`)
**Purpose:** The core tool where users upload media and view results.
- **Header:** Logo (AuraSync), User Profile Avatar, and "Upgrade to Pro" badge.
- **Upload Component:**
  - Tabs for "Audio Only" vs "Video & Audio".
  - Drag-and-drop zone.
  - "Record live" button.
- **Processing State:** Loading skeleton or progress bar with tips (e.g., "Analyzing body language...").
- **Results View:**
  - **Scorecard:** Overall Confidence Score (0-100).
  - **Visuals Tab (Video only):** Gemini Vision feedback on eye contact, posture, gestures.
  - **Acoustics Tab:** Speech rate, pauses, tone.
  - **Transcript & Multi-Agent Feedback:** Chat-like or card-based feedback from the Communication, Confidence, and Personality agents.

## 3. User Profile & History (`/profile`)
**Purpose:** Show users their progress over time.
- **Overview Stats:** Total videos analyzed, average confidence score, most improved metric.
- **Recent History List:** Table or grid of past uploads with dates and thumbnail/score summaries. Clicking one opens the saved Results View.
- **Settings:** Update name, email, password, and notification preferences.

## 4. Pricing / Plans Screen (`/pricing`)
**Purpose:** Upsell users to the Pro tier.
- **Toggle:** Monthly vs. Yearly billing.
- **Free Plan Card:** Highlights what they already have (Ad-supported, basic analysis).
- **Pro Plan Card:** Highlights premium features (PDF exports, History tracking, No Ads, Custom prompts). Strong CTA ("Go Pro").
- **Enterprise Card:** Contact sales for API / Team usage.
- **FAQ Section:** Common questions about billing and privacy.

## 5. Payments / Checkout Flow (`/checkout`)
**Purpose:** Securely handle credit card transactions (via Stripe/Paddle).
- **Order Summary:** Selected plan and price.
- **Payment Element:** Secure iframe for card details, Apple Pay, Google Pay.
- **Success Page (`/success`):** "Welcome to Pro! View your dashboard."
- **Cancel Page (`/cancel`):** "Payment failed or cancelled. Try again."

## 6. Authentication Screens (`/login`, `/signup`)
**Purpose:** User onboarding.
- **Forms:** Email/Password fields.
- **Social Login:** "Continue with Google", "Continue with GitHub".
- **Forgot Password:** Flow to reset credentials.
