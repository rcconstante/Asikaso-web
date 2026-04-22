📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
🧠 Product Name

Asikaso

🎯 Product Vision

Asikaso helps Filipinos complete real-life tasks step-by-step—from government IDs to taxes and travel—using guides, automation, and AI assistance.

“Hindi ka na maghahanap — gagawin mo na lang.”

🎯 Target Users
Primary
🎓 Fresh graduates
💼 First-time employees
💻 Freelancers
Secondary
✈️ Travelers
👨‍👩‍👧 Adults managing life admin
🚨 Problem Statement

Filipinos struggle with:

confusing government processes
scattered information (Google, Facebook, Reddit)
manual repetitive work (forms, documents)
no centralized system to track progress
💡 Solution

A platform that:

provides step-by-step guides
allows task tracking
automates form filling & documents
offers AI assistance per step
🧩 CORE FEATURES (MVP)
1. 🏠 Landing Page

Goal: Convert visitors → users

Sections:
Hero
Life stage selector
Features
Pricing
CTA
2. 🔐 Authentication
Firebase Auth
Google login + Email
Auto-create user profile
3. 📚 Guides System
Description:

Structured step-by-step flows

Requirements:
List all guides
Filter by category
Search guides
View guide details
4. 🧭 Guide Flow Page
Layout:
Step navigation (left/top)
Step content (main)
AI assistant (right panel)
Features:
checklist per step
mark step complete
progress tracking
5. 📊 Progress Tracking
% completion per guide
last accessed step
dashboard summary
6. 🤖 AI Assistant
Scope:
contextual help per step
suggest next steps
explain requirements
Trigger:
button: “Ask AI”
7. 📄 PDF Form Filler
Flow:
user inputs data once
system fills official forms
downloadable PDF
8. 💳 Payments (Stripe)
MVP Strategy:
₱79 per guide (one-time)
Flow:
click “Unlock Guide”
Stripe checkout
unlock on success
9. 🧾 Purchases System
track unlocked guides
restrict premium content
10. 🛠️ Admin Panel (VERY IMPORTANT)
Features:
create/edit guides
add steps
manage pricing
publish/unpublish
BLOG SEO
Users - ban or unban
Settings Can turn app to meintenance,
Data logs
Dashboard
🗄️ DATA MODEL (SIMPLIFIED)
Users
id
email
plan
Guides
title
category
price
stepsCount
Steps
title
description
checklist
Progress
completedSteps
currentStep
Purchases
guideId
userId
status
🔁 USER FLOW
First-time user
Visit landing
Click “Get Started”
Sign up
Choose life stage
View guides
Click guide
Hit paywall → purchase
Start guide
Returning user
Login
Dashboard
Continue guide
📱 UI / UX REQUIREMENTS
mobile-first
simple navigation
no clutter
clear progress indicators
fast loading
🎨 DESIGN SYSTEM
Colors
Blue: Primary
Green: Success
Purple: Accent
Light Gray: Background
Style
Rounded (2xl)
Soft shadows
Friendly icons
⚙️ TECH STACK
Frontend
Vite (SEO + performance)
Tailwind CSS
Backend
Firebase
Firestore
Auth
Functions
Payments
Stripe
AI
GEMINI

