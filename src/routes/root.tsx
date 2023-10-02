import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
// import * as main from "../utils/main";

export default function Root() {
  useEffect(() => {
    console.log('ROOT mounted!');
    // main.init();
    return () => console.log('unmounting...');
  }, [])


  return (
    <>
      <div id="sidebar">
        <h1>NDN Workspace</h1>
        <nav>
          <ul>
            <li>
              <Link to={`docs`}>Docs</Link>
            </li>
            <li>
              <Link to={`calendar`}>Calendar</Link>
            </li>
            <li>
              <Link to={`config`}>Config</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}