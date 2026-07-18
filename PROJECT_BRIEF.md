Project: PassKaro — a website where engineering students search their college,
pick their branch/year/subject, and watch fixed-length recorded videos designed
around that specific college's semester exam syllabus. It's positioned as
last-minute exam prep, not a full course platform.

MVP scope: only one college exists in the database — BIT Mesra. The search bar
UI must be built as if many colleges exist (real search input, dropdown/results),
but the backend is only seeded with BIT Mesra data. Do not hardcode "BIT Mesra"
into frontend components — it must come from the database via API, so adding a
second college later requires zero frontend code changes.

Tech stack (do not substitute or add libraries beyond what's listed per phase):
- Frontend: React 18 + Vite, React Router v6, Tailwind CSS, Axios, React Hook
  Form, react-hot-toast
- Backend: Node.js + Express 4, Mongoose 8, jsonwebtoken, bcryptjs,
  express-validator, cors, dotenv
- Database: MongoDB Atlas
- Payments: Razorpay
- Video: Bunny Stream (private library, token-authenticated signed URLs)
- Auth: JWT stored in httpOnly cookies

Repo structure: monorepo with /client and /server as sibling folders at root,
each with its own package.json.

Data model hierarchy: College -> Branch -> Subject (tagged to a semester
number) -> Chapter -> Video. A Subject belongs to one Branch. A Video belongs
to one Chapter. Users have a role field ("student" or "admin"). Payments unlock
access at the Subject level (one payment = one subject unlocked for that user).

I will review every file you generate before moving to the next phase. When
anything in a prompt is ambiguous or missing, stop and ask me rather than
assuming or inventing new fields, routes, or files. Do not create any pages,
routes, or DB fields that aren't explicitly listed in the current phase's
prompt — extra scope now means bugs I don't have time to debug later.