# RealEst

RealEst is a full-stack property management web application built with a Node.js + Express backend and a Vite + React frontend. The app supports owner/tenant role-based access, property listing and management, lease creation, rental requests, payments, and Razorpay integration.

---

## Project Structure

```
/backend
  package.json
  server.js
  config/db.js
  controllers/
  models/
  routes/
  middleware/
  utils/
  uploads/
  .env
/frontend
  package.json
  src/
    App.jsx
    main.jsx
    context/AuthContext.jsx
    lib/axios.js
    services/api.js
    components/
    pages/
  public/
  index.html
```

---

## Backend Architecture (MVC)

The backend follows a simple MVC-style separation:

- `server.js`: app entry point, loads env variables, connects to MongoDB, initializes cron jobs, sets up middleware, and mounts routes.
- `config/db.js`: MongoDB connection logic using Mongoose.
- `routes/`: API route definitions that connect endpoints to controller functions.
- `controllers/`: business logic for auth, properties, leases, payments, and requests.
- `models/`: Mongoose schemas for User, Property, Lease, Payment, and Request.
- `middleware/`: authentication, authorization, file uploads, and centralized error handling.
- `utils/`: supporting utilities like Razorpay client setup and monthly cron jobs.

### Backend Routes

#### Authentication

- `POST /api/auth/register`
  - Registers a new user.
  - Required body: `name`, `email`, `password`, `role`.
  - Returns JWT and sanitized user data.
- `POST /api/auth/login`
  - Logs in a user.
  - Required body: `email`, `password`.
  - Returns JWT.

#### Properties

- `GET /api/properties`
  - Returns all properties.
  - If the authenticated user is an owner, the backend filters to owner-owned properties.
- `POST /api/properties`
  - Owner-only.
  - Creates a property with `title`, `location`, `rent`, optionally `lat`, `lng`.
- `GET /api/properties/:id`
  - Retrieves a single property by ID.
- `PUT /api/properties/:id`
  - Owner-only.
  - Updates property details.
- `DELETE /api/properties/:id`
  - Owner-only.
  - Deletes the property.
- `PUT /api/properties/assign/:id`
  - Owner-only.
  - Assigns a tenant and creates a lease.
  - Body: `tenantId`, optional `leaseStart`, `leaseEnd`.

#### Leases

- `GET /api/leases`
  - Returns lease records.
  - Owners see leases for their properties, tenants see their own leases.
- `GET /api/leases/:id`
  - Fetches a single lease by ID.
- `POST /api/leases`
  - Owner-only.
  - Creates a lease.
  - Body: `tenantId`, `propertyId`, `startDate`, `endDate`.
- `POST /api/leases/upload`
  - Owner-only.
  - Uploads a lease document file.
  - Uses `multipart/form-data` with `file` and `leaseId`.

#### Payments

- `GET /api/payments`
  - Returns payment records.
  - Owners see payments for their properties, tenants see their own payments.
- `POST /api/payments`
  - Tenant-only.
  - Creates a payment record or updates an existing one.
  - Body: `propertyId`, `amount`, `status`, optional `existingPaymentId`.
- `POST /api/payments/create-order`
  - Authenticated.
  - Creates a Razorpay order for online payment.
  - Body: `amount`.
- `POST /api/payments/verify`
  - Authenticated.
  - Verifies Razorpay payment signature and records the payment.
  - Body: `order_id`, `payment_id`, `signature`, `propertyId`, `amount`, `status`, optional `existingPaymentId`.
- `POST /api/payments/issue`
  - Owner-only.
  - Issues a pending payment to a tenant.
  - Body: `tenantId`, `propertyId`, `amount`.

#### Requests

- `POST /api/requests`
  - Tenant-only.
  - Creates a rental request.
  - Body: `propertyId`.
- `GET /api/requests`
  - Owner-only.
  - Fetches requests for properties owned by the current user.
- `PUT /api/requests/accept/:id`
  - Owner-only.
  - Marks request as accepted.
- `PUT /api/requests/reject/:id`
  - Owner-only.
  - Marks request as rejected.

#### Protected test endpoint

- `GET /api/protected`
  - Requires auth token.
  - Returns authenticated user info.

---

## Backend Models

### `models/User.js`

- `name`, `email`, `password`, `role`
- Role enum: `owner`, `manager`, `tenant`

### `models/Property.js`

- `title`, `location`, `rent`, `lat`, `lng`, `owner`
- `leaseDocument` and `leases` array of lease IDs

### `models/Lease.js`

- `tenant`, `property`, `startDate`, `endDate`, `document`, `status`
- Status enum: `active`, `completed`

### `models/Payment.js`

- `tenant`, `property`, `amount`, `paymentDate`, `status`
- Status enum: `paid`, `pending`

### `models/Request.js`

- `tenant`, `property`, `status`
- Status enum: `pending`, `accepted`, `rejected`

---

## Backend Middleware

### `middleware/authMiddleware.js`

- Reads JWT from `Authorization: Bearer <token>`
- Verifies token using `JWT_SECRET`
- Attaches user payload to `req.user`

### `middleware/roleMiddleware.js`

- Restricts routes by role.
- Accepts a required role or array of roles.

### `middleware/upload.js`

- Uses `multer` to store files in `backend/uploads`.
- Accepts PDF uploads.

### `middleware/errorHandler.js`

- Global error handler for Express.

---

## Backend Utilities

### `utils/razorpay.js`

- Configures Razorpay SDK with `RAZORPAY_KEY` and `RAZORPAY_SECRET`.

### `utils/cron.js`

- Schedules a monthly cron job.
- Creates pending payments for all leases once per month.

---

## Frontend Architecture

The frontend is a React application built with Vite.

### Main files

- `src/main.jsx`
  - Bootstraps React and wraps the app with `BrowserRouter`.
- `src/App.jsx`
  - Defines public and protected routes.
  - Uses `ProtectedRoute` for authenticated pages.
- `src/context/AuthContext.jsx`
  - Manages login, registration, auth state, token persistence.
  - Stores `token` and `user` in `localStorage`.
- `src/lib/axios.js`
  - Axios instance with `baseURL` configured from `VITE_API_URL`.
  - Adds auth token to request headers.
  - Handles `401` responses by logging out and redirecting to `/login`.
- `src/services/api.js`
  - Central API wrapper for auth, properties, leases, payments, requests.

### Shared components

- `DashboardLayout.jsx`
  - Dashboard shell used by protected pages.
- `Navbar.jsx`
  - Top navigation for landing and auth links.
- `Sidebar.jsx`
  - Sidebar navigation shown inside dashboard screens.
- `ProtectedRoute.jsx`
  - Redirects unauthenticated users to `/login`.
- `PropertyMap.jsx`
  - Google Maps display for property locations.

---

## Frontend Pages

### LandingPage

- Public marketing page.
- Includes links to `/login` and `/register`.
- No API calls.

### LoginPage

- Authenticates users via `authAPI.login()`.
- Stores token and user info after login.

### RegisterPage

- Registers users via `authAPI.register()`.
- After registration, stores JWT and user in local storage.

### DashboardPage

- Protected page.
- Loads summary counts from:
  - `propertiesAPI.getAll()`
  - `leasesAPI.getAll()`
  - `paymentsAPI.getAll()`
  - `requestsAPI.getAll()` (owner only)
- Displays recent properties and payments.

### PropertiesPage

- Loads all properties via `propertiesAPI.getAll()`.
- For owners:
  - Add property: `propertiesAPI.create()`
  - Edit property: `propertiesAPI.update(id, data)`
  - Delete property: `propertiesAPI.delete(id)`
  - Assign tenant / create lease: `propertiesAPI.assignTenant(id, data)`
- Search and map view powered by Google Maps API.

### PropertyDetailsPage

- Loads a single property via `propertiesAPI.getById(id)`.
- Tenants can request the property using `requestsAPI.create({ propertyId })`.

### LeasesPage

- Loads leases using `leasesAPI.getAll()`.
- Owner-only actions:
  - Create lease: `leasesAPI.create(data)`
  - Upload lease document: `leasesAPI.upload(formData)`
- Lease documents are served from `backend/uploads`.

### PaymentsPage

- Loads payment history via `paymentsAPI.getAll()`.
- Tenant actions:
  - Record manual payment: `paymentsAPI.add(data)`
  - Pay online through Razorpay: `paymentsAPI.createOrder(data)` + `paymentsAPI.verify(data)`
- Owner actions:
  - Issue a pending payment: `paymentsAPI.issue(data)`

### RequestsPage

- Tenants can send requests using `requestsAPI.create(data)`.
- Owners can view requests from `requestsAPI.getAll()`.
- Owners can accept/reject requests using `requestsAPI.accept(id)` / `requestsAPI.reject(id)`.
- Accepted requests can be converted into leases.

---

## Frontend → Backend API Flow

The frontend uses a centralized Axios instance in `src/lib/axios.js`:

- `baseURL` from `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`
- Sends `Authorization: Bearer <token>` on every request when logged in.
- Automatically logs out and redirects on `401 Unauthorized`.

API wrapper functions in `src/services/api.js` call backend routes using this Axios instance.

Auth data is stored in `localStorage` so the app persists login state between refreshes.

---

## Environment Variables

### Backend (`backend/.env`)

Required:

- `MONGO_URI` — MongoDB connection string.
- `PORT` — Server port (default `5000`).
- `JWT_SECRET` — Secret for signing JWT tokens.
- `RAZORPAY_KEY` — Razorpay key ID.
- `RAZORPAY_SECRET` — Razorpay key secret.

Example:

```
MONGO_URI=mongodb://localhost:27017/realestate
PORT=5000
JWT_SECRET=supersecretkey
RAZORPAY_KEY=your_test key
RAZORPAY_SECRET=your key
```

### Frontend (`.env` file in frontend folder)

Optional custom values:

- `VITE_API_URL` — Backend API base URL, e.g. `http://localhost:5000/api`
- `VITE_GOOGLE_MAPS_KEY` — Google Maps API key for map rendering.
- `VITE_RAZORPAY_KEY` — Razorpay key used by the checkout widget.

If not set, frontend defaults to `http://localhost:5000/api`.

---

## NPM Modules

### Backend dependencies

- `express` — Web framework.
- `mongoose` — MongoDB ORM.
- `cors` — Cross-origin support.
- `dotenv` — Environment variables.
- `express-validator` — Request validation.
- `jsonwebtoken` — JWT auth.
- `bcryptjs` — Password hashing.
- `multer` — File uploads.
- `node-cron` — Scheduled jobs.
- `razorpay` — Razorpay payment integration.

Dev:

- `nodemon` — auto-restart server during development.

### Frontend dependencies

- `react`, `react-dom` — UI library.
- `react-router-dom` — routing.
- `axios` — HTTP client.
- `@react-google-maps/api` — Google Maps integration.
- `react-hot-toast` — notifications.
- `framer-motion` — animations.
- `lucide-react` and `react-icons` — icons.
- `date-fns` — date formatting.

Dev:

- `vite` — build tool.
- `@vitejs/plugin-react` — React support.
- `tailwindcss`, `postcss`, `autoprefixer` — styling tooling.
- `eslint` + React plugins — linting.

---

## How to Run

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite, and the backend should be available on `http://localhost:5000` by default.

---

## Feature Summary

- Role-based access: `owner`, `tenant`, `manager`.
- Property creation, editing, deletion, and assignment.
- Lease creation, document upload, and lease listing.
- Payment history, manual payment, Razorpay checkout, and payment issuance.
- Rental request sending, approval, and rejection.
- Google Maps property visualization.
- Monthly cron payment generation for active leases.

---

## Notes

- Uploaded lease documents are stored in `backend/uploads` and served at `/uploads`.
- The backend protects routes with JWT auth and role checks.
- Frontend UI is built around authenticated dashboard flows.
- This README documents the current codebase as implemented.
