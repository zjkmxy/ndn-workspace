import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  const errorMsg = (() => {
    if (isRouteErrorResponse(error)) {
      return error.statusText;
    } else if (error instanceof Error) {
      return error.message;
    } else {
      return 'Unknown error';
    }
  })();

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMsg}</i>
      </p>
    </div>
  );
}
