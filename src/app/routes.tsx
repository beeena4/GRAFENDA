import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RegisterSeller } from "./pages/RegisterSeller";
import { Search } from "./pages/Search";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Chat } from "./pages/Chat";
import { Payment } from "./pages/Payment";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { DashboardUser } from "./pages/DashboardUser";
import { DashboardSeller } from "./pages/DashboardSeller";
import { NewDashboardSeller } from "./pages/NewDashboardSeller";
import { DashboardAdmin } from "./pages/DashboardAdmin";
import { ProfileUser } from "./pages/ProfileUser";
import { ProfileSeller } from "./pages/ProfileSeller";
import { WithdrawSaldo } from "./pages/WithdrawSaldo";
import { Inbox } from "./pages/Inbox";
import { Reviews } from "./pages/Reviews";
import { WriteReview } from "./pages/WriteReview";
import { ManageService } from "./pages/ManageService";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "register-seller", Component: RegisterSeller },
      { path: "search", Component: Search },
      { path: "service/:id", Component: ServiceDetail },
      { path: "chat/:id", Component: Chat },
      { path: "payment/:id", Component: Payment },
      { path: "payment-success/:id", Component: PaymentSuccess },
      { path: "dashboard/user", Component: DashboardUser },
      { path: "dashboard/seller", Component: NewDashboardSeller },
      { path: "dashboard/admin", Component: DashboardAdmin },
      { path: "profile/user", Component: ProfileUser },
      { path: "profile/seller", Component: ProfileSeller },
      { path: "withdraw", Component: WithdrawSaldo },
      { path: "inbox", Component: Inbox },
      { path: "service/:id/reviews", Component: Reviews },
      { path: "order/:id/review", Component: WriteReview },
      { path: "seller/service/add", Component: ManageService },
      { path: "seller/service/:id/edit", Component: ManageService },
    ],
  },
]);
