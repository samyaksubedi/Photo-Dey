import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CreateEventPage } from './pages/CreateEventPage';
import { DashboardPage, EventsPage } from './pages/DashboardPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicEventPage } from './pages/PublicEventPage';
import { ResendVerificationPage, SignInPage, SignUpPage, VerifyEmailPage } from './pages/AuthPages';
import { AccountPage } from './pages/AccountPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
      <Route path="/verify/:token" element={<VerifyEmailPage />} />
      <Route path="/auth/verify/:token" element={<VerifyEmailPage />} />
      <Route path="/e/:publicCode" element={<PublicEventPage />} />
      <Route path="/gallery/:searchRequestId" element={<GalleryPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/new" element={<CreateEventPage />} />
          <Route path="events/:eventId" element={<EventDetailPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
