import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import RootLayout from './routes/RootLayout';
import HomePage from './pages/HomePage';
import BrowseJobsPage from './pages/BrowseJobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import SubmitBidPage from './pages/SubmitBidPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PostJobPage from './pages/PostJobPage';
import WalletPage from './pages/wallet/WalletPage';
import ContractsPage from './pages/contracts/ContractsPage';
import ContractDetailsPage from './pages/contracts/ContractDetailsPage';
import MessagesPage from './pages/messages/MessagesPage';
import ThreadPage from './pages/messages/ThreadPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import WriteReviewPage from './pages/reviews/WriteReviewPage';
import FreelancerDashboard from './pages/dashboards/FreelancerDashboard';
import ClientDashboard from './pages/dashboards/ClientDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'jobs', element: <BrowseJobsPage /> },
      { path: 'jobs/:id', element: <JobDetailsPage /> },
      { path: 'jobs/:id/bid', element: <SubmitBidPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'post-job', element: <PostJobPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'contracts/:id', element: <ContractDetailsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'messages/:id', element: <ThreadPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/new', element: <WriteReviewPage /> },
      { path: 'freelancer-dashboard', element: <FreelancerDashboard /> },
      { path: 'client-dashboard', element: <ClientDashboard /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);