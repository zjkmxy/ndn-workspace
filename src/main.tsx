import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  Params,
  RouterProvider,
} from "react-router-dom";
import Root from './routes/root'
import ErrorPage from './error-page'
import './index.css'
import Config from './routes/config';
import Docs from './routes/docs'
import SharedCalendar from './routes/calendar';
import Latex from './routes/latex';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "config",
        element: <Config />
      },
      // TODO: Navibar's link to docs does not return to top level.
      {
        path: "docs",
        element: <Docs />,
      },
      {
        path: "docs/:docId",
        element: <Docs />,
        loader: async ({ params }: { params: Params }) => params.docId,
      },
      {
        path: "calendar",
        element: <SharedCalendar />,
      },
      {
        path: "latex",
        element: <Latex />,
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)
