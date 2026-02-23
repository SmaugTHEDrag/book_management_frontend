import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import { Home } from "../pages/Home/Home";
import Library from "../pages/Library/Library";
import { DashboardLayout } from "../Dashboard/DashboardLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login";
import SingleBook from "../pages/shared/SingleBook";
import UploadBook from "../Dashboard/UploadBook";
import Dashboard from "../Dashboard/Dashboard";
import EditBooks from "../Dashboard/EditBooks";
import Signup from "../pages/Signup";
import Logout from "../pages/Logout";
import ErrorPage from "../pages/shared/ErrorPage";
import About from "../pages/about/About";
import Blog from "../pages/blog/Blog";
import ManageBooks from "../Dashboard/ManageBooks";
import Favorite from "../Dashboard/Favorite";
import ManageUsers from "../Dashboard/ManageUsers";
import BookReader from "../pages/shared/BookReader";
import BlogDetail from "../pages/blog/BlogDetail";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/library",
        element: <Library />,
      },
      {
        path: "/book/:id",
        element: <SingleBook />,
        loader: ({ params }) => fetch(`https://https://book-management-backend-eghi.onrender.com/api/books/${params.id}`)
      },
      {
        path: "/book/:id/read",
        element: <BookReader />,
      },
      {
        path: "/about",
        element: <About/>
      },
      {
        path: "/blog",
        element: <Blog/>
      },
      {
        path: "/blog/:id",
        element: <BlogDetail />,
        loader: ({ params }) => fetch(`https://https://book-management-backend-eghi.onrender.com/api/blogs/${params.id}`)
      }
    ]
  },
  {
    path: "/admin/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "", element: <PrivateRoute><Dashboard></Dashboard></PrivateRoute>},
      { path: "/admin/dashboard/upload", element: <UploadBook /> },
      { path: "/admin/dashboard/manage", element: <ManageBooks /> },
      { path: "/admin/dashboard/manage-users", element: <ManageUsers /> },
      { path: "/admin/dashboard/favorite", element: <Favorite /> },
      { path: "/admin/dashboard/favorite", element: <PrivateRoute><Favorite /></PrivateRoute> },
      { path: "/admin/dashboard/edit-books/:id", element: <EditBooks />,
      loader: ({ params }) => fetch(`https://https://book-management-backend-eghi.onrender.com/api/books/${params.id}`)
    },
    ],
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "/create-user",
    element: <Signup/>
  },
  {
    path:"/logout",
    element: <Logout/>
  }
]);

export default router;